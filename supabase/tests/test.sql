do $$
declare
  r jsonb; r2 jsonb; ok boolean;
  cat uuid; p1 uuid; p_unpub uuid; p_oos uuid; p_lead uuid; p_quote uuid;
  admin uuid := gen_random_uuid(); other uuid := gen_random_uuid();
  oid uuid; oid2 uuid; n integer; i integer;
  ph text := '+919876543210';
  function_args jsonb;
begin
  select id into cat from categories where slug = 'biryani-mandi';
  insert into products (category_id, name, slug, short_description, price, is_published, in_stock, order_lead_time_hours)
    values (cat, 'Test Biryani', 'test-biryani', 'x', 250, true, true, 2) returning id into p1;
  insert into products (category_id, name, slug, short_description, price, is_published)
    values (cat, 'Unpublished Dish', 'unpublished-dish', 'x', 100, false) returning id into p_unpub;
  insert into products (category_id, name, slug, short_description, price, is_published, in_stock)
    values (cat, 'Sold Out Dish', 'sold-out-dish', 'x', 100, true, false) returning id into p_oos;
  insert into products (category_id, name, slug, short_description, price, is_published, order_lead_time_hours)
    values (cat, 'Lead Dish', 'lead-dish', 'x', 100, true, 24) returning id into p_lead;
  insert into products (category_id, name, slug, short_description, price, sale_price, is_published, order_lead_time_hours)
    values (cat, 'Quote Dish', 'quote-dish', 'x', 0, null, true, 1) returning id into p_quote;

  insert into auth.users (id, email) values (admin, 'owner@example.com'), (other, 'rando@example.com');
  insert into admin_users (user_id) values (admin);

  -- 1. happy path
  set local role service_role;
  r := create_order(jsonb_build_object(
    'idempotencyKey', 'key-00000001',
    'customer', jsonb_build_object('name', 'Asha', 'phone', ph),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '1 day'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 2))), 'iphash-a');
  reset role;
  perform t.check('create ok', (r->>'ok')::boolean and not (r->>'duplicate')::boolean);
  perform t.check('subtotal computed server-side (500)', (r->>'subtotal')::numeric = 500);
  perform t.check('reference format', r->>'reference' ~ '^YS-[A-HJKMNP-Z2-9]{6}$');
  select id into oid from orders where reference = r->>'reference';
  perform t.check('item snapshot stored', (select count(*) from order_items where order_id = oid and unit_price = 250 and product_name = 'Test Biryani') = 1);
  perform t.check('initial event logged', (select count(*) from order_events where order_id = oid and to_status = 'new') = 1);

  -- 2. idempotency key replay
  set local role service_role;
  r2 := create_order(jsonb_build_object(
    'idempotencyKey', 'key-00000001',
    'customer', jsonb_build_object('name', 'Asha', 'phone', ph),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '1 day'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 2))), 'iphash-a');
  reset role;
  perform t.check('idempotent replay returns same order', (r2->>'duplicate')::boolean and r2->>'reference' = r->>'reference');

  -- 3. same basket, new key => dedupe
  set local role service_role;
  r2 := create_order(jsonb_build_object(
    'idempotencyKey', 'key-00000002',
    'customer', jsonb_build_object('name', 'Asha', 'phone', ph),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '1 day'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 2))), 'iphash-a');
  reset role;
  perform t.check('same basket within 10min deduped', (r2->>'duplicate')::boolean and r2->>'reference' = r->>'reference');
  perform t.check('still one order for phone', (select count(*) from orders where customer_phone = ph) = 1);

  -- 4. phone rate limit (3/hour)
  for i in 3..5 loop
    set local role service_role;
    r2 := create_order(jsonb_build_object(
      'idempotencyKey', 'key-0000000' || i,
      'customer', jsonb_build_object('name', 'Asha', 'phone', ph),
      'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '1 day'),
      'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', i))), 'iphash-a');
    reset role;
    if i < 5 then
      perform t.check('order ' || i || ' accepted', (r2->>'ok')::boolean);
    else
      perform t.check('4th order in an hour rate limited', r2->>'code' = 'rate_limited');
    end if;
  end loop;

  -- 5. availability
  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-avail-001',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p_unpub, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('unpublished product rejected', r2->>'code' = 'unavailable');

  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-avail-002',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p_oos, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('out of stock product rejected', r2->>'code' = 'unavailable');

  -- 6. lead time
  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-lead-0001',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 hours'),
    'items', jsonb_build_array(jsonb_build_object('productId', p_lead, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('lead time enforced', r2->>'code' = 'lead_time');

  -- 7. invalid input becomes a controlled error, not an exception
  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-bad-00001',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'bogus', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('bad enum => invalid', r2->>'code' = 'invalid');

  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-bad-00002',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', 'garbage'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('bad timestamp => invalid', r2->>'code' = 'invalid');

  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-bad-00003',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'delivery', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('delivery without address => invalid', r2->>'code' = 'invalid');
  perform t.check('invalid attempt left no order behind', (select count(*) from orders where customer_phone = '+919876500001') = 0);

  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-bad-00004',
    'customer', jsonb_build_object('name', 'Ben', 'phone', 'not-a-phone'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-b');
  reset role;
  perform t.check('bad phone => invalid', r2->>'code' = 'invalid');

  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-bad-00005',
    'customer', jsonb_build_object('name', 'Ben', 'phone', '+919876500001'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 500))), 'iphash-b');
  reset role;
  perform t.check('quantity > 99 => invalid', r2->>'code' = 'invalid');

  -- 8. price on request
  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-quote-001',
    'customer', jsonb_build_object('name', 'Cara', 'phone', '+919876500002'),
    'fulfilment', jsonb_build_object('type', 'delivery', 'address', '12 Test Street', 'requestedFor', now() + interval '3 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p_quote, 'quantity', 1))), 'iphash-c');
  reset role;
  perform t.check('price-on-request flagged', (r2->>'ok')::boolean and (r2->>'needsPriceQuote')::boolean);
  select id into oid2 from orders where reference = r2->>'reference';

  -- 9. kill switch
  update site_settings set accepting_orders = false where id = 1;
  set local role service_role;
  r2 := create_order(jsonb_build_object('idempotencyKey', 'key-off-00001',
    'customer', jsonb_build_object('name', 'Dev', 'phone', '+919876500003'),
    'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
    'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-d');
  reset role;
  perform t.check('accepting_orders=false blocks orders', r2->>'code' = 'not_accepting');
  update site_settings set accepting_orders = true where id = 1;

  -- 10. IP rate limit (10/hour)
  for i in 1..11 loop
    set local role service_role;
    r2 := create_order(jsonb_build_object('idempotencyKey', 'key-ip-' || lpad(i::text, 6, '0'),
      'customer', jsonb_build_object('name', 'Eve', 'phone', '+91990000' || lpad(i::text, 4, '0')),
      'fulfilment', jsonb_build_object('type', 'pickup', 'requestedFor', now() + interval '2 days'),
      'items', jsonb_build_array(jsonb_build_object('productId', p1, 'quantity', 1))), 'iphash-flood');
    reset role;
  end loop;
  perform t.check('11th order from one IP hash rate limited', r2->>'code' = 'rate_limited');

  -- 11. anon / authenticated cannot call the RPC or touch orders
  ok := false;
  begin set local role anon; perform create_order('{}'::jsonb, 'x'); exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('anon cannot call create_order', ok);

  ok := false;
  begin set local role authenticated; perform create_order('{}'::jsonb, 'x'); exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('authenticated cannot call create_order', ok);

  ok := false;
  begin set local role anon; perform count(*) from orders; exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('anon cannot read orders', ok);

  ok := false;
  begin set local role anon; insert into orders (reference, customer_name, customer_phone, fulfilment_type, requested_for, idempotency_key, items_signature) values ('X','Eve','+919999999999','pickup',now(),'k','s'); exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('anon cannot insert orders directly', ok);

  -- 12. public catalog visibility
  set local role anon;
  select count(*) into n from products;
  reset role;
  perform t.check('anon sees only published products (4 of 5)', n = 4);

  set local role anon;
  select count(*) into n from categories;
  reset role;
  perform t.check('anon sees active categories (10)', n = 10);

  ok := false;
  begin set local role anon; update products set price = 1; exception when others then ok := true; end;
  reset role;
  perform t.check('anon cannot update products', ok or (select count(*) from products where price = 1) = 0);

  -- 13. non-admin authenticated user sees nothing
  perform set_config('request.jwt.claim.sub', other::text, true);
  set local role authenticated;
  select count(*) into n from orders;
  reset role;
  perform t.check('non-admin authenticated sees zero orders', n = 0);

  -- 14. admin workflow
  perform set_config('request.jwt.claim.sub', admin::text, true);
  set local role authenticated;
  select count(*) into n from orders;
  reset role;
  perform t.check('admin can read orders', n >= 1);

  ok := false;
  begin set local role authenticated; update orders set status = 'preparing' where id = oid; exception when check_violation then ok := true; end;
  reset role;
  perform t.check('cannot skip new -> preparing', ok);

  set local role authenticated;
  update orders set status = 'confirmed' where id = oid;
  reset role;
  perform t.check('new -> confirmed allowed', (select status from orders where id = oid) = 'confirmed');
  perform t.check('confirmed_at stamped', (select confirmed_at is not null from orders where id = oid));
  perform t.check('audit event written with actor', (select count(*) from order_events where order_id = oid and to_status = 'confirmed' and actor = admin) = 1);

  ok := false;
  begin set local role authenticated; update orders set status = 'rejected' where id = oid2; exception when check_violation then ok := true; end;
  reset role;
  perform t.check('reject requires a reason', ok);

  set local role authenticated;
  update orders set status = 'rejected', rejection_reason = 'Out of area' where id = oid2;
  reset role;
  perform t.check('reject with reason allowed', (select status from orders where id = oid2) = 'rejected');

  ok := false;
  begin set local role authenticated; update orders set status = 'confirmed' where id = oid2; exception when check_violation then ok := true; end;
  reset role;
  perform t.check('rejected is terminal', ok);

  ok := false;
  begin set local role authenticated; update orders set customer_name = 'Hacked' where id = oid; exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('admin cannot edit customer fields', ok);

  set local role authenticated;
  update orders set owner_notes = 'Call before delivery' where id = oid;
  reset role;
  perform t.check('admin can edit owner_notes', (select owner_notes from orders where id = oid) = 'Call before delivery');

  -- pickup order must not go out_for_delivery
  update orders set status = 'preparing' where id = oid;
  update orders set status = 'ready' where id = oid;
  ok := false;
  begin set local role authenticated; update orders set status = 'out_for_delivery' where id = oid; exception when check_violation then ok := true; end;
  reset role;
  perform t.check('pickup order cannot go out_for_delivery', ok);
  update orders set status = 'completed' where id = oid;
  perform t.check('pickup ready -> completed', (select status from orders where id = oid) = 'completed' and (select completed_at is not null from orders where id = oid));

  -- 15. retention
  update orders set created_at = now() - interval '200 days' where id = oid;
  set local role service_role;
  select public.purge_old_orders(90) into n;
  reset role;
  perform t.check('purge removes old finished orders', n = 1 and not exists (select 1 from orders where id = oid));

  ok := false;
  begin set local role authenticated; perform public.purge_old_orders(1); exception when insufficient_privilege then ok := true; end;
  reset role;
  perform t.check('admin client cannot call purge', ok);

  -- 16. media asset objects (Cloudinary references live in jsonb)
  ok := false;
  begin update categories set image = '"just-a-string"'::jsonb where slug = 'curries'; exception when check_violation then ok := true; end;
  perform t.check('category image must be a JSON object', ok);

  update categories set image = '{"provider":"cloudinary","publicId":"yummy-spot/categories/x","url":"https://res.cloudinary.com/demo/image/upload/x.jpg"}'::jsonb where slug = 'curries';
  perform t.check('category image object accepted', (select image ->> 'publicId' from categories where slug = 'curries') = 'yummy-spot/categories/x');

  ok := false;
  begin insert into gallery_items (title, image) values ('x', 'null'::jsonb); exception when check_violation or not_null_violation then ok := true; end;
  perform t.check('gallery image must be a JSON object', ok);

  ok := false;
  begin update products set images = '[1,2,3,4,5,6,7]'::jsonb where id = p1; exception when check_violation then ok := true; end;
  perform t.check('product images capped at 6', ok);
end;
$$;

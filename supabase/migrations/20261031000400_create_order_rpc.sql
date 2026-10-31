-- Single entry point for customer orders. Called only by the Worker (service role) after Turnstile
-- verification and Zod validation. All pricing, availability, rate-limit and dedupe logic lives here
-- so it runs atomically and can never be bypassed by a client.
--
-- Returns jsonb: { ok: true, duplicate, reference, subtotal, currency, summary }
--             or { ok: false, code, ... } where code is one of:
--                not_accepting | invalid | unavailable | lead_time | rate_limited

create or replace function public.create_order(p_payload jsonb, p_ip_hash text)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  c_phone_per_hour constant integer := 3;
  c_ip_per_hour    constant integer := 10;
  c_dedupe_minutes constant integer := 10;
  c_max_items      constant integer := 20;
  c_max_days_ahead constant integer := 60;

  v_key        text := p_payload ->> 'idempotencyKey';
  v_name       text := btrim(p_payload #>> '{customer,name}');
  v_phone      text := p_payload #>> '{customer,phone}';
  v_email      text := nullif(btrim(p_payload #>> '{customer,email}'), '');
  v_area       text := nullif(btrim(p_payload #>> '{fulfilment,area}'), '');
  v_address    text := nullif(btrim(p_payload #>> '{fulfilment,address}'), '');
  v_notes      text := nullif(btrim(p_payload ->> 'notes'), '');
  v_type       fulfilment_type;
  v_requested  timestamptz;

  v_settings   site_settings%rowtype;
  v_existing   orders%rowtype;
  v_agg        jsonb;
  v_signature  text;
  v_bad        uuid[];
  v_max_lead   integer;
  v_subtotal   numeric(10, 2);
  v_quote      boolean;
  v_order_id   uuid;
  v_reference  text;
  v_attempts   integer := 0;
  v_summary    jsonb;
begin
  -- Casts live in the body (not DECLARE) so the EXCEPTION handler below turns bad input into 'invalid'.
  v_type := (p_payload #>> '{fulfilment,type}')::fulfilment_type;
  v_requested := (p_payload #>> '{fulfilment,requestedFor}')::timestamptz;

  if v_key is null or char_length(v_key) not between 8 and 100 or v_phone is null then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  select * into v_settings from site_settings where id = 1;
  if not found or not v_settings.accepting_orders then
    return jsonb_build_object('ok', false, 'code', 'not_accepting', 'notice', v_settings.order_notice);
  end if;

  select * into v_existing from orders where idempotency_key = v_key;
  if found then
    return jsonb_build_object('ok', true, 'duplicate', true, 'reference', v_existing.reference,
                              'subtotal', v_existing.subtotal, 'currency', v_existing.currency,
                              'needsPriceQuote', v_existing.needs_price_quote);
  end if;

  -- Serialise concurrent submissions from the same phone so the rate-limit counts stay accurate.
  perform pg_advisory_xact_lock(hashtext(v_phone));

  if (select count(*) from orders
        where customer_phone = v_phone and created_at > now() - interval '1 hour') >= c_phone_per_hour
     or (p_ip_hash is not null and (select count(*) from orders
        where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= c_ip_per_hour)
  then
    return jsonb_build_object('ok', false, 'code', 'rate_limited');
  end if;

  if jsonb_typeof(p_payload -> 'items') is distinct from 'array' then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  -- Merge repeated products into one line.
  select jsonb_agg(jsonb_build_object('product_id', r.product_id, 'quantity', r.quantity, 'note', r.note))
    into v_agg
  from (
    select (i ->> 'productId')::uuid as product_id,
           sum((i ->> 'quantity')::numeric) as quantity,
           min(nullif(btrim(i ->> 'note'), '')) as note
    from jsonb_array_elements(p_payload -> 'items') i
    group by 1
  ) r;

  if v_agg is null or jsonb_array_length(v_agg) > c_max_items then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  if exists (select 1 from jsonb_to_recordset(v_agg) as x(product_id uuid, quantity numeric, note text)
             where x.quantity <= 0 or x.quantity > 99) then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  select array_agg(x.product_id) filter (where p.id is null or not p.is_published or not p.in_stock),
         max(p.order_lead_time_hours)
    into v_bad, v_max_lead
  from jsonb_to_recordset(v_agg) as x(product_id uuid, quantity numeric, note text)
  left join products p on p.id = x.product_id;

  if v_bad is not null then
    return jsonb_build_object('ok', false, 'code', 'unavailable', 'productIds', to_jsonb(v_bad));
  end if;

  if v_requested > now() + make_interval(days => c_max_days_ahead) then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  if v_requested < now() + make_interval(hours => coalesce(v_max_lead, 0)) then
    return jsonb_build_object('ok', false, 'code', 'lead_time',
      'earliest', now() + make_interval(hours => coalesce(v_max_lead, 0)));
  end if;

  select md5(string_agg(x.product_id::text || ':' || x.quantity::text, ',' order by x.product_id))
    into v_signature
  from jsonb_to_recordset(v_agg) as x(product_id uuid, quantity numeric, note text);

  -- Same phone and same basket within a few minutes is treated as a double submit.
  select * into v_existing from orders
  where customer_phone = v_phone
    and items_signature = v_signature
    and created_at > now() - make_interval(mins => c_dedupe_minutes)
  order by created_at desc
  limit 1;
  if found then
    return jsonb_build_object('ok', true, 'duplicate', true, 'reference', v_existing.reference,
                              'subtotal', v_existing.subtotal, 'currency', v_existing.currency,
                              'needsPriceQuote', v_existing.needs_price_quote);
  end if;

  select coalesce(sum(round(coalesce(p.sale_price, p.price) * x.quantity, 2)), 0),
         coalesce(bool_or(coalesce(p.sale_price, p.price) = 0), false)
    into v_subtotal, v_quote
  from jsonb_to_recordset(v_agg) as x(product_id uuid, quantity numeric, note text)
  join products p on p.id = x.product_id;

  loop
    v_reference := generate_order_reference();
    begin
      insert into orders (
        reference, customer_name, customer_phone, customer_email, fulfilment_type,
        delivery_area, delivery_address, requested_for, notes, subtotal, needs_price_quote,
        idempotency_key, items_signature, ip_hash
      ) values (
        v_reference, v_name, v_phone, v_email, v_type,
        v_area, v_address, v_requested, v_notes, v_subtotal, v_quote,
        v_key, v_signature, p_ip_hash
      ) returning id into v_order_id;
      exit;
    exception when unique_violation then
      select * into v_existing from orders where idempotency_key = v_key;
      if found then
        return jsonb_build_object('ok', true, 'duplicate', true, 'reference', v_existing.reference,
                                  'subtotal', v_existing.subtotal, 'currency', v_existing.currency,
                                  'needsPriceQuote', v_existing.needs_price_quote);
      end if;
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then
        raise;
      end if;
    end;
  end loop;

  insert into order_items (order_id, product_id, product_name, unit_price, price_unit, quantity, line_total, note)
  select v_order_id, p.id, p.name, coalesce(p.sale_price, p.price), p.price_unit, x.quantity,
         round(coalesce(p.sale_price, p.price) * x.quantity, 2), x.note
  from jsonb_to_recordset(v_agg) as x(product_id uuid, quantity numeric, note text)
  join products p on p.id = x.product_id;

  insert into order_events (order_id, from_status, to_status, actor, note)
  values (v_order_id, null, 'new', null, 'Created from website');

  select jsonb_agg(jsonb_build_object('name', oi.product_name, 'quantity', oi.quantity)) into v_summary
  from order_items oi where oi.order_id = v_order_id;

  return jsonb_build_object(
    'ok', true, 'duplicate', false, 'reference', v_reference,
    'subtotal', v_subtotal, 'currency', 'INR', 'needsPriceQuote', v_quote,
    'customerName', v_name, 'requestedFor', v_requested, 'fulfilment', v_type, 'summary', v_summary
  );
exception
  when invalid_text_representation or invalid_datetime_format or datetime_field_overflow
       or check_violation or not_null_violation then
    return jsonb_build_object('ok', false, 'code', 'invalid');
end;
$$;

revoke all on function public.create_order(jsonb, text) from public, anon, authenticated;
grant execute on function public.create_order(jsonb, text) to service_role;

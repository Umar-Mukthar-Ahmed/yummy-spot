-- Orders, order items, status audit trail, and status-transition enforcement.

create type public.order_status as enum (
  'new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'rejected', 'cancelled'
);

create type public.fulfilment_type as enum ('delivery', 'pickup');

-- Unambiguous alphabet (no 0/O, 1/I/L) so owners can read references over the phone.
create or replace function public.generate_order_reference()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := 'YS-';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return result;
end;
$$;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  status            public.order_status not null default 'new',
  customer_name     text not null check (char_length(customer_name) between 2 and 80),
  customer_phone    text not null check (customer_phone ~ '^\+[1-9][0-9]{7,14}$'),
  customer_email    text check (customer_email is null or char_length(customer_email) <= 254),
  fulfilment_type   public.fulfilment_type not null,
  delivery_area     text check (delivery_area is null or char_length(delivery_area) <= 120),
  delivery_address  text check (delivery_address is null or char_length(delivery_address) <= 300),
  requested_for     timestamptz not null,
  notes             text check (notes is null or char_length(notes) <= 500),
  subtotal          numeric(10, 2) not null default 0 check (subtotal >= 0),
  currency          char(3) not null default 'INR',
  needs_price_quote boolean not null default false,
  idempotency_key   text not null unique,
  items_signature   text not null,
  ip_hash           text,
  owner_notes       text check (owner_notes is null or char_length(owner_notes) <= 1000),
  rejection_reason  text check (rejection_reason is null or char_length(rejection_reason) <= 300),
  confirmed_at      timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint delivery_needs_address
    check (fulfilment_type <> 'delivery' or delivery_address is not null)
);

create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_phone_created_idx on public.orders (customer_phone, created_at desc);
create index orders_ip_created_idx on public.orders (ip_hash, created_at desc);
create index orders_dedupe_idx on public.orders (customer_phone, items_signature, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  price_unit   text not null,
  quantity     numeric(6, 2) not null check (quantity > 0 and quantity <= 99),
  line_total   numeric(10, 2) not null check (line_total >= 0),
  note         text check (note is null or char_length(note) <= 200),
  unique (order_id, product_id)
);

create index order_items_order_idx on public.order_items (order_id);

create table public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  actor       uuid references auth.users (id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, created_at);

-- Allowed transitions are enforced in the database so no client can skip a step.
create or replace function public.enforce_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if not (
    (old.status = 'new'              and new.status in ('confirmed', 'rejected', 'cancelled')) or
    (old.status = 'confirmed'        and new.status in ('preparing', 'cancelled')) or
    (old.status = 'preparing'        and new.status in ('ready', 'cancelled')) or
    (old.status = 'ready'            and new.status = 'out_for_delivery' and new.fulfilment_type = 'delivery') or
    (old.status = 'ready'            and new.status = 'completed'        and new.fulfilment_type = 'pickup') or
    (old.status = 'out_for_delivery' and new.status = 'completed')
  ) then
    raise exception 'Invalid order status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if new.status = 'rejected' and coalesce(btrim(new.rejection_reason), '') = '' then
    raise exception 'rejection_reason is required when rejecting an order'
      using errcode = 'check_violation';
  end if;

  if new.status = 'confirmed' then
    new.confirmed_at := now();
  elsif new.status in ('completed', 'rejected', 'cancelled') then
    new.completed_at := now();
  end if;

  return new;
end;
$$;

create trigger orders_enforce_status_transition
  before update of status on public.orders
  for each row execute function public.enforce_order_status_transition();

-- Security definer so admins (who cannot insert into order_events directly) still get an audit row.
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_events (order_id, from_status, to_status, actor, note)
    values (new.id, old.status, new.status, auth.uid(), new.rejection_reason);
  end if;
  return new;
end;
$$;

create trigger orders_log_status_change
  after update of status on public.orders
  for each row execute function public.log_order_status_change();

-- Retention: removes finished orders older than p_days. Schedule with pg_cron (see comment) or a Worker cron.
create or replace function public.purge_old_orders(p_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.orders
  where status in ('completed', 'rejected', 'cancelled')
    and created_at < now() - make_interval(days => p_days);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_old_orders(integer) from public, anon, authenticated;
grant execute on function public.purge_old_orders(integer) to service_role;

-- Optional (enable the pg_cron extension first):
--   select cron.schedule('purge-old-orders', '30 3 * * *', $$select public.purge_old_orders(90)$$);

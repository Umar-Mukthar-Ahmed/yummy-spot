-- Row Level Security. Public visitors can read published content only; admins manage everything.
-- Orders are never readable or writable by anon; they are created only through create_order (service role).

alter table public.admin_users   enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.site_settings enable row level security;
alter table public.banners       enable row level security;
alter table public.gallery_items enable row level security;
alter table public.reviews       enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.order_events  enable row level security;

-- Admins may read their own membership row (lets the admin app confirm access after login).
create policy admin_users_self_select on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Public read policies
create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active);

create policy products_public_read on public.products
  for select to anon, authenticated
  using (is_published and exists (
    select 1 from public.categories c where c.id = category_id and c.is_active
  ));

create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated using (true);

create policy banners_public_read on public.banners
  for select to anon, authenticated
  using (is_visible and (expires_at is null or expires_at > now()));

create policy gallery_public_read on public.gallery_items
  for select to anon, authenticated using (is_published);

create policy reviews_public_read on public.reviews
  for select to anon, authenticated using (is_published);

-- Admin full access on content tables
create policy categories_admin_all on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_admin_all on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy site_settings_admin_all on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy banners_admin_all on public.banners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy gallery_admin_all on public.gallery_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy reviews_admin_all on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- The single settings row cannot be deleted or duplicated.
revoke insert, delete on public.site_settings from authenticated;

-- Orders: admin read, limited admin update. No anon access at all.
revoke all on public.orders, public.order_items, public.order_events from anon, authenticated;
grant select on public.orders, public.order_items, public.order_events to authenticated;
grant update (status, owner_notes, rejection_reason) on public.orders to authenticated;

create policy orders_admin_select on public.orders
  for select to authenticated using (public.is_admin());
create policy orders_admin_update on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin_select on public.order_items
  for select to authenticated using (public.is_admin());
create policy order_events_admin_select on public.order_events
  for select to authenticated using (public.is_admin());

-- Live "new order" updates in the admin. Realtime enforces the SELECT policies above.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;

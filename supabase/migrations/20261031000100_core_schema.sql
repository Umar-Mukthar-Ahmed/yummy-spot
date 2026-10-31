-- Core catalog + site content tables. Order tables live in the next migration.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admins are Supabase Auth users listed here. Public signups must be disabled in the Auth settings.
-- Bootstrap: create the user in the dashboard, then run:
--   insert into public.admin_users (user_id) select id from auth.users where email = '<owner email>';
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

create table public.categories (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique check (char_length(name) between 2 and 80),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description      text,
  -- Media asset object: { "provider": "cloudinary", "publicId": "...", "url": "...", "alt": "...", "width": 0, "height": 0 }
  image            jsonb check (image is null or jsonb_typeof(image) = 'object'),
  icon             text,
  sort_order       integer not null default 0,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id                       uuid primary key default gen_random_uuid(),
  category_id              uuid not null references public.categories (id) on delete restrict,
  name                     text not null check (char_length(name) between 3 and 120),
  slug                     text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description        text not null check (char_length(short_description) <= 200),
  description              text not null default '',
  -- Values mirror ProductLabel / DietaryClassification in types/product.ts.
  labels                   text[] not null default '{}'
    check (labels <@ array['bestseller','featured','isNew','seasonal','festive','customOrder']),
  dietary                  text[] not null default '{}'
    check (dietary <@ array['halal','pure-vegetarian','contains-egg','gluten-free','dairy-free','sugar-free','diabetic-friendly','postnatal-safe','immunity-booster']),
  tags                     text[] not null default '{}',
  -- price = 0 means "ask for today's price" in the storefront.
  price                    numeric(10, 2) not null default 0 check (price >= 0),
  sale_price               numeric(10, 2) check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  price_unit               text not null default 'per piece'
    check (price_unit in ('per piece','per kg','per box','per dozen','per portion','per pack')),
  currency                 char(3) not null default 'INR',
  in_stock                 boolean not null default true,
  availability_note        text,
  delivery_areas           text[] not null default '{}',
  preparation_time_minutes integer not null default 60 check (preparation_time_minutes >= 0),
  order_lead_time_hours    integer not null default 4 check (order_lead_time_hours >= 0),
  ingredients              text[] not null default '{}',
  allergens                text[] not null default '{}',
  serving_size             text,
  shelf_life               text,
  -- Array of media asset objects (same shape as categories.image plus "isPrimary"); the first item is the cover.
  images                   jsonb not null default '[]'
    check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 6),
  meta_title               text,
  meta_description         text,
  og_image_url             text,
  is_published             boolean not null default false,
  published_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index products_category_idx on public.products (category_id);
create index products_published_idx on public.products (is_published, in_stock);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Single-row table (id is pinned to 1).
create table public.site_settings (
  id               smallint primary key default 1 check (id = 1),
  whatsapp_number  text,
  contact_email    text,
  address          text,
  opening_hours    jsonb not null default '[]',
  delivery_areas   text[] not null default '{}',
  instagram_url    text,
  facebook_url     text,
  accepting_orders boolean not null default true,
  order_notice     text,
  updated_at       timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1);

create table public.banners (
  id         uuid primary key default gen_random_uuid(),
  text       text not null check (char_length(text) <= 90),
  link_text  text,
  link_url   text,
  variant    text not null default 'emerald' check (variant in ('emerald','amber','rose')),
  is_visible boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

create table public.gallery_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  image        jsonb not null check (jsonb_typeof(image) = 'object'),
  category_tag text not null default 'kitchen-prep'
    check (category_tag in ('kitchen-prep','packaging','festivals','events')),
  product_id   uuid references public.products (id) on delete set null,
  caption      text,
  sort_order   integer not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  location      text,
  rating        smallint not null default 5 check (rating between 1 and 5),
  review_text   text not null check (char_length(review_text) <= 300),
  product_id    uuid references public.products (id) on delete set null,
  is_verified   boolean not null default true,
  is_featured   boolean not null default false,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

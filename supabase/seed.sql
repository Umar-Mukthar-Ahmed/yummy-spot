-- Category slugs and order mirror config/navigation.ts (categoryNav). Descriptions and images are added in the admin.
insert into public.categories (name, slug, sort_order) values
  ('Homemade Meals',              'homemade-meals',     10),
  ('Desserts & Sweets',           'desserts-sweets',    20),
  ('Snacks & Savouries',          'snacks-savouries',   30),
  ('Biryani & Mandi',             'biryani-mandi',      40),
  ('Curries',                     'curries',            50),
  ('Traditional Wellness Foods',  'wellness-foods',     60),
  ('Homemade Health Supplements', 'health-supplements', 70),
  ('Seasonal Specials',           'seasonal-specials',  80),
  ('Festival Specials',           'festival-specials',  90),
  ('Custom Orders',               'custom-orders',     100)
on conflict (slug) do nothing;

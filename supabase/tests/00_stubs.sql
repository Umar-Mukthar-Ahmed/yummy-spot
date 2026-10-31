-- Local test harness for the migrations (not applied to Supabase).
-- Run against a throwaway Postgres 16 (for example `docker run -e POSTGRES_PASSWORD=pw postgres:16`), in this order:
--   00_stubs.sql, migrations/*.sql (by filename), seed.sql, tests/test.sql
-- test.sql prints one 'PASS : name' or 'FAIL : name' notice per check; every line must be PASS.

-- Minimal stand-ins for what Supabase provides, so the migrations can run on vanilla Postgres.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema public, auth to anon, authenticated, service_role;
grant select on auth.users to service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create publication supabase_realtime;

create schema t;
create function t.check(name text, cond boolean) returns void language plpgsql as
$$ begin raise notice '% : %', case when coalesce(cond, false) then 'PASS' else 'FAIL' end, name; end $$;

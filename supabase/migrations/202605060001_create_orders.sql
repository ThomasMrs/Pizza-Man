create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'À faire'
    check (status in ('À faire', 'En préparation', 'Prête', 'Terminée')),
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(10, 2) not null default 0,
  delivery_charge numeric(10, 2) not null default 0,
  source text not null default 'site'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;

drop policy if exists "Clients can create orders" on public.orders;
create policy "Clients can create orders"
on public.orders
for insert
to anon
with check (status = 'À faire');

drop policy if exists "Pizzeria can create orders" on public.orders;
create policy "Pizzeria can create orders"
on public.orders
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'pizzeria');

drop policy if exists "Pizzeria can read orders" on public.orders;
create policy "Pizzeria can read orders"
on public.orders
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'pizzeria');

drop policy if exists "Pizzeria can update orders" on public.orders;
create policy "Pizzeria can update orders"
on public.orders
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'pizzeria')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'pizzeria');

drop policy if exists "Pizzeria can delete orders" on public.orders;
create policy "Pizzeria can delete orders"
on public.orders
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'pizzeria');

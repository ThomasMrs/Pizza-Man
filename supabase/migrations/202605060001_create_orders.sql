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
  service_date date,
  order_slot text,
  pizza_count integer not null default 0,
  source text not null default 'site'
);

alter table public.orders add column if not exists service_date date;
alter table public.orders add column if not exists order_slot text;
alter table public.orders add column if not exists pizza_count integer not null default 0;

create or replace function public.calculate_order_pizza_count(order_items jsonb)
returns integer
language sql
immutable
as $$
  select coalesce(
    sum(
      case
        when item.value ->> 'quantity' ~ '^[0-9]+$' then (item.value ->> 'quantity')::integer
        else 1
      end
    ),
    0
  )::integer
  from jsonb_array_elements(coalesce(order_items, '[]'::jsonb)) as item(value)
  where coalesce(item.value ->> 'pizzaId', '') not in (
    'vin-deprade-jorda',
    'lambrusco',
    'coca-125',
    'canettes',
    'despe-33'
  );
$$;

create or replace function public.is_valid_order_slot(slot_value text)
returns boolean
language plpgsql
immutable
as $$
declare
  slot_hours integer;
  slot_minutes integer;
  total_minutes integer;
begin
  if slot_value is null or slot_value !~ '^[0-9]{2}:[0-9]{2}$' then
    return false;
  end if;

  slot_hours := split_part(slot_value, ':', 1)::integer;
  slot_minutes := split_part(slot_value, ':', 2)::integer;
  total_minutes := slot_hours * 60 + slot_minutes;

  return slot_minutes between 0 and 59
    and total_minutes between (17 * 60) and (21 * 60 + 30)
    and total_minutes % 15 = 0;
end;
$$;

update public.orders
set
  service_date = coalesce(
    service_date,
    case
      when customer ->> 'serviceDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then (customer ->> 'serviceDate')::date
      else (created_at at time zone 'Europe/Paris')::date
    end
  ),
  order_slot = case
    when public.is_valid_order_slot(coalesce(nullif(customer ->> 'plannedTime', ''), nullif(customer ->> 'desiredTime', ''))) then
      coalesce(nullif(customer ->> 'plannedTime', ''), nullif(customer ->> 'desiredTime', ''))
    else order_slot
  end,
  pizza_count = public.calculate_order_pizza_count(items);

alter table public.orders alter column service_date set default ((now() at time zone 'Europe/Paris')::date);
alter table public.orders alter column service_date set not null;
alter table public.orders alter column pizza_count set default 0;
alter table public.orders alter column pizza_count set not null;

alter table public.orders drop constraint if exists orders_order_slot_valid;
alter table public.orders add constraint orders_order_slot_valid
check (order_slot is null or public.is_valid_order_slot(order_slot));

create index if not exists orders_service_slot_idx
on public.orders (service_date, order_slot)
where status <> 'Terminée';

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

create or replace function public.enforce_order_slot_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  used_pizzas integer;
begin
  if new.service_date is null then
    new.service_date := case
      when new.customer ->> 'serviceDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then (new.customer ->> 'serviceDate')::date
      else (new.created_at at time zone 'Europe/Paris')::date
    end;
  end if;

  if new.customer ? 'plannedTime' or new.customer ? 'desiredTime' then
    new.order_slot := coalesce(nullif(new.customer ->> 'plannedTime', ''), nullif(new.customer ->> 'desiredTime', ''));
  end if;

  if new.order_slot is not null and not public.is_valid_order_slot(new.order_slot) then
    raise exception 'Heure invalide: choisissez un créneau entre 17h00 et 21h30 par tranche de 15 minutes.';
  end if;

  new.pizza_count := public.calculate_order_pizza_count(new.items);

  if new.status <> 'Terminée' and new.order_slot is not null and new.pizza_count > 0 then
    select coalesce(sum(orders.pizza_count), 0)::integer
    into used_pizzas
    from public.orders
    where orders.id <> new.id
      and orders.status <> 'Terminée'
      and orders.service_date = new.service_date
      and orders.order_slot = new.order_slot;

    if used_pizzas + new.pizza_count > 8 then
      raise exception 'Créneau complet: maximum 8 pizzas par tranche de 15 minutes.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_enforce_slot_capacity on public.orders;
create trigger orders_enforce_slot_capacity
before insert or update on public.orders
for each row
execute function public.enforce_order_slot_capacity();

create or replace function public.get_order_slot_usage(service_date_arg date)
returns table(slot_time text, pizza_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select orders.order_slot as slot_time, coalesce(sum(orders.pizza_count), 0)::integer as pizza_count
  from public.orders
  where orders.service_date = service_date_arg
    and orders.status <> 'Terminée'
    and orders.order_slot is not null
  group by orders.order_slot
  order by orders.order_slot;
$$;

alter table public.orders enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant execute on function public.get_order_slot_usage(date) to anon, authenticated;

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
with check ((auth.jwt() ->> 'email') = 'christian@pizza.com');

drop policy if exists "Pizzeria can read orders" on public.orders;
create policy "Pizzeria can read orders"
on public.orders
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'christian@pizza.com');

drop policy if exists "Pizzeria can update orders" on public.orders;
create policy "Pizzeria can update orders"
on public.orders
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'christian@pizza.com')
with check ((auth.jwt() ->> 'email') = 'christian@pizza.com');

drop policy if exists "Pizzeria can delete orders" on public.orders;
create policy "Pizzeria can delete orders"
on public.orders
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'christian@pizza.com');

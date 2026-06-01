-- ============================================================
-- Bytec Cotizador — esquema Supabase
-- Ejecuta TODO este script en:  Supabase → SQL Editor → New query → Run
-- ============================================================

-- Cada tabla guarda un objeto JSON por fila (modelo flexible).
create table if not exists public.company  ( id int  primary key, data jsonb not null );
create table if not exists public.catalog  ( id text primary key, data jsonb not null );
create table if not exists public.clients  ( id text primary key, data jsonb not null );
create table if not exists public.quotes   ( id text primary key, data jsonb not null );

-- ------------------------------------------------------------
-- Seguridad (RLS)
-- ------------------------------------------------------------
-- OPCIÓN A — Inicio rápido (herramienta interna, sin login):
-- permite a la clave anónima leer/escribir. Cualquiera con tu URL+anon key
-- podría acceder, así que NO publiques esas credenciales en un repo público.
alter table public.company enable row level security;
alter table public.catalog enable row level security;
alter table public.clients enable row level security;
alter table public.quotes  enable row level security;

create policy "anon full company" on public.company for all using (true) with check (true);
create policy "anon full catalog" on public.catalog for all using (true) with check (true);
create policy "anon full clients" on public.clients for all using (true) with check (true);
create policy "anon full quotes"  on public.quotes  for all using (true) with check (true);

-- ------------------------------------------------------------
-- OPCIÓN B — Recomendada para producción: exige usuario autenticado.
-- Borra las 4 políticas "anon full ..." de arriba y usa estas.
-- Luego habilita Auth (Email) en Supabase e inicia sesión en la app.
-- ------------------------------------------------------------
-- create policy "auth company" on public.company for all to authenticated using (true) with check (true);
-- create policy "auth catalog" on public.catalog for all to authenticated using (true) with check (true);
-- create policy "auth clients" on public.clients for all to authenticated using (true) with check (true);
-- create policy "auth quotes"  on public.quotes  for all to authenticated using (true) with check (true);

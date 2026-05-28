-- ============================================================
-- BiBilet Initial Schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TICKETS
-- ============================================================
create table public.tickets (
  id             uuid        primary key default gen_random_uuid(),
  title          text        not null,
  description    text,
  event_date     timestamptz not null,
  location       text        not null,
  price          numeric(10,2) not null,
  original_price numeric(10,2) not null,
  category       text        not null,
  contact        text        not null,
  status         text        not null default 'available'
                               check (status in ('available', 'sold')),
  owner_id       uuid        not null references auth.users(id) on delete cascade,
  currency       text        not null default 'TRY',
  image_url      text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- OFFERS
-- ============================================================
create table public.offers (
  id         uuid          primary key default gen_random_uuid(),
  ticket_id  uuid          not null references public.tickets(id) on delete cascade,
  user_id    uuid          not null references auth.users(id) on delete cascade,
  amount     numeric(10,2) not null,
  created_at timestamptz   not null default now()
);

-- ============================================================
-- RATINGS
-- ============================================================
create table public.ratings (
  id         uuid        primary key default gen_random_uuid(),
  seller_id  uuid        not null references auth.users(id) on delete cascade,
  rater_id   uuid        not null references auth.users(id) on delete cascade,
  score      integer     not null check (score >= 1 and score <= 5),
  created_at timestamptz not null default now(),
  unique (seller_id, rater_id)  -- aynı kullanıcı aynı satıcıya iki kez oy veremez
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.tickets enable row level security;
alter table public.offers  enable row level security;
alter table public.ratings enable row level security;

-- ------------------------------------------------------------
-- TICKETS policies
-- ------------------------------------------------------------

-- Herkes müsait biletleri okuyabilir; sahip kendi satıldı biletlerini de görebilir
create policy "tickets_select"
  on public.tickets for select
  using (status = 'available' or owner_id = auth.uid());

-- Giriş yapmış kullanıcı kendi adına bilet ekleyebilir
create policy "tickets_insert"
  on public.tickets for insert
  with check (auth.uid() is not null and owner_id = auth.uid());

-- Yalnızca sahip güncelleyebilir
create policy "tickets_update"
  on public.tickets for update
  using (owner_id = auth.uid());

-- Yalnızca sahip silebilir
create policy "tickets_delete"
  on public.tickets for delete
  using (owner_id = auth.uid());

-- ------------------------------------------------------------
-- OFFERS policies
-- ------------------------------------------------------------

-- Teklif veren kendi tekliflerini, bilet sahibi de kendi ilanındaki teklifleri görebilir
create policy "offers_select"
  on public.offers for select
  using (
    user_id = auth.uid()
    or ticket_id in (
      select id from public.tickets where owner_id = auth.uid()
    )
  );

-- Giriş yapmış kullanıcı kendi adına teklif verebilir
create policy "offers_insert"
  on public.offers for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- ------------------------------------------------------------
-- RATINGS policies
-- ------------------------------------------------------------

-- Herkes puanları okuyabilir
create policy "ratings_select"
  on public.ratings for select
  using (true);

-- Giriş yapmış kullanıcı kendi adına puan verebilir
create policy "ratings_insert"
  on public.ratings for insert
  with check (auth.uid() is not null and rater_id = auth.uid());

-- Mevcut puanı güncelleme (upsert için)
create policy "ratings_update"
  on public.ratings for update
  using (rater_id = auth.uid());

-- ============================================================
-- INDEXES (sorgu performansı için)
-- ============================================================
create index tickets_owner_id_idx  on public.tickets (owner_id);
create index tickets_status_idx    on public.tickets (status);
create index tickets_event_date_idx on public.tickets (event_date);
create index offers_ticket_id_idx  on public.offers  (ticket_id);
create index offers_user_id_idx    on public.offers  (user_id);
create index ratings_seller_id_idx on public.ratings (seller_id);

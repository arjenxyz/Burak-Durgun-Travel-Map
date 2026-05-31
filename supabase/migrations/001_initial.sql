-- Burak Durgun Travel Map — run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Raw YouTube videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique,
  title text not null,
  description text,
  thumbnail_url text,
  published_at timestamptz not null,
  video_url text not null,
  parsed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists videos_published_at_idx on public.videos (published_at desc);
create index if not exists videos_parsed_at_idx on public.videos (parsed_at);

-- Extracted locations per video
create table if not exists public.video_locations (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  country_code text not null,
  country_name text not null,
  city text,
  lat double precision not null,
  lng double precision not null,
  confidence real not null default 0.5 check (confidence >= 0 and confidence <= 1),
  source text not null default 'parser',
  created_at timestamptz not null default now(),
  unique (video_id, country_code, city)
);

create index if not exists video_locations_country_idx on public.video_locations (country_code);
create index if not exists video_locations_video_idx on public.video_locations (video_id);

-- Sync run log (for cron monitoring)
create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  videos_fetched int not null default 0,
  videos_new int not null default 0,
  locations_added int not null default 0,
  status text not null default 'running',
  error_message text
);

-- Public read for map data; writes only via service role
alter table public.videos enable row level security;
alter table public.video_locations enable row level security;
alter table public.sync_runs enable row level security;

create policy "Public read videos"
  on public.videos for select
  to anon, authenticated
  using (true);

create policy "Public read locations"
  on public.video_locations for select
  to anon, authenticated
  using (true);

create policy "Public read sync_runs"
  on public.sync_runs for select
  to anon, authenticated
  using (true);

-- Aggregated map view
create or replace view public.map_stats as
select
  vl.country_code,
  vl.country_name,
  count(distinct vl.video_id) as video_count,
  count(distinct vl.city) filter (where vl.city is not null) as city_count,
  min(v.published_at) as first_visit,
  max(v.published_at) as last_visit
from public.video_locations vl
join public.videos v on v.id = vl.video_id
group by vl.country_code, vl.country_name;

create or replace view public.map_cities as
select
  vl.country_code,
  vl.country_name,
  vl.city,
  avg(vl.lat) as lat,
  avg(vl.lng) as lng,
  count(distinct vl.video_id) as video_count,
  max(v.published_at) as last_visit
from public.video_locations vl
join public.videos v on v.id = vl.video_id
where vl.city is not null
group by vl.country_code, vl.country_name, vl.city;

create or replace view public.map_countries as
select
  vl.country_code,
  vl.country_name,
  avg(vl.lat) as lat,
  avg(vl.lng) as lng,
  count(distinct vl.video_id) as video_count,
  count(distinct vl.city) filter (where vl.city is not null) as city_count
from public.video_locations vl
group by vl.country_code, vl.country_name;

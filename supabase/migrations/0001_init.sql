-- Schema for posts and daily_metrics as provided in the challenge PDF

-- Posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null check (platform in ('instagram', 'tiktok')),
  caption text,
  thumbnail_url text,
  media_type text not null check (media_type in ('image', 'video', 'carousel')),
  posted_at timestamptz not null,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  reach integer default 0,
  impressions integer default 0,
  engagement_rate decimal(5,2),
  permalink text,
  created_at timestamptz default now()
);

-- Daily metrics table
create table public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  engagement integer default 0,
  reach integer default 0,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- Enable RLS
alter table public.posts enable row level security;
alter table public.daily_metrics enable row level security;

-- RLS policies for posts
create policy "posts_select_own"
on public.posts
for select
using (auth.uid() = user_id);

create policy "posts_insert_own"
on public.posts
for insert
with check (auth.uid() = user_id);

create policy "posts_update_own"
on public.posts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "posts_delete_own"
on public.posts
for delete
using (auth.uid() = user_id);

-- RLS policies for daily_metrics
create policy "daily_metrics_select_own"
on public.daily_metrics
for select
using (auth.uid() = user_id);

create policy "daily_metrics_insert_own"
on public.daily_metrics
for insert
with check (auth.uid() = user_id);

create policy "daily_metrics_update_own"
on public.daily_metrics
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily_metrics_delete_own"
on public.daily_metrics
for delete
using (auth.uid() = user_id);

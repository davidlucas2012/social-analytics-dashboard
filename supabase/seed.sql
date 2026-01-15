-- Seed data for two users (replace USER_A_ID / USER_B_ID with your Supabase auth user IDs).
-- Safe to re-run: existing rows for these users are replaced.

-- User identifiers (edit these before running)
--   User A: e6314f17-d2f0-4501-a40b-b5015071879a
--   User B: 8e5ac388-9fa0-4a58-98e0-795c86423b94

-- Clear prior seed data for the two test users
delete from public.posts
where user_id in ('e6314f17-d2f0-4501-a40b-b5015071879a', '8e5ac388-9fa0-4a58-98e0-795c86423b94');

delete from public.daily_metrics
where user_id in ('e6314f17-d2f0-4501-a40b-b5015071879a', '8e5ac388-9fa0-4a58-98e0-795c86423b94');

-- Seed POSTS (18 total, 9 per user with thumbnails + permalinks)
insert into public.posts
  (user_id, platform, caption, thumbnail_url, media_type, posted_at, likes, comments, shares, saves, reach, impressions, engagement_rate, permalink)
values
  -- User A
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Studio desk refresh for a calmer Monday', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', 'image', now() - interval '2 days', 245, 38, 22, 30, 4200, 5100, 6.80, 'https://instagram.com/p/studio-desk'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'tiktok', 'Refactoring timelapse with lo-fi beats', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'video', now() - interval '4 days', 1320, 145, 71, 90, 15000, 21400, 7.20, 'https://tiktok.com/@usera/video/1'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'UI polish before the launch 🚀 (carousel)', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'carousel', now() - interval '6 days', 540, 64, 29, 55, 7200, 9100, 7.30, 'https://instagram.com/p/ui-polish'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'tiktok', 'Dark mode drop walkthrough', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'video', now() - interval '9 days', 1880, 212, 95, 120, 21100, 29800, 8.10, 'https://tiktok.com/@usera/video/2'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Weekend hike to reset the brain', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'image', now() - interval '12 days', 330, 27, 12, 18, 4100, 5200, 7.40, 'https://instagram.com/p/hike'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Coffee break AMA ☕️', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 'image', now() - interval '15 days', 420, 35, 15, 22, 4800, 6300, 7.30, 'https://instagram.com/p/coffee-ama'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'tiktok', 'TypeScript tips in 30 seconds', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'video', now() - interval '17 days', 1560, 168, 82, 96, 17500, 24600, 7.70, 'https://tiktok.com/@usera/video/3'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Launch-day stats recap (carousel)', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', 'carousel', now() - interval '21 days', 610, 55, 31, 42, 9300, 12000, 6.00, 'https://instagram.com/p/launch-recap'),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'tiktok', 'Micro-interactions I''m obsessed with', 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e', 'video', now() - interval '24 days', 990, 101, 48, 63, 14200, 18900, 6.30, 'https://tiktok.com/@usera/video/4'),

  -- User B
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Sunset timelapse over the city', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'video', now() - interval '1 day', 310, 28, 14, 20, 3900, 4700, 7.40, 'https://instagram.com/p/sunset-city'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'tiktok', '30-sec cooking hack that actually works', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 'video', now() - interval '3 days', 1780, 192, 102, 118, 20500, 28700, 7.60, 'https://tiktok.com/@userb/video/1'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Weekend vibes with friends', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', 'image', now() - interval '5 days', 260, 21, 10, 14, 3200, 4300, 7.30, 'https://instagram.com/p/weekend'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'New reel: behind the scenes of a shoot', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', 'video', now() - interval '7 days', 640, 66, 31, 40, 7200, 9600, 7.40, 'https://instagram.com/p/reel-bts'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'tiktok', 'Travel packing checklist that saves time', 'https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab', 'video', now() - interval '11 days', 1190, 130, 61, 76, 16800, 22500, 5.90, 'https://tiktok.com/@userb/video/2'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Minimal workspace snapshot', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'image', now() - interval '14 days', 295, 25, 12, 18, 4100, 5200, 6.80, 'https://instagram.com/p/workspace'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'What I learned editing 5 videos in one day', 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e', 'carousel', now() - interval '18 days', 430, 40, 18, 27, 6800, 9100, 6.00, 'https://instagram.com/p/editing-learnings'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'tiktok', 'Drone b-roll tips', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', 'video', now() - interval '22 days', 1420, 158, 75, 89, 18400, 24300, 6.70, 'https://tiktok.com/@userb/video/3'),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Rainy day indoors (carousel)', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'carousel', now() - interval '26 days', 220, 18, 8, 11, 2900, 3800, 6.90, 'https://instagram.com/p/rainy-day');

-- Seed DAILY_METRICS (full 30 days for each user)
with dates as (
  select
    gs::date as date,
    row_number() over (order by gs) - 1 as idx
  from generate_series(current_date - interval '29 days', current_date, interval '1 day') as gs
),
user_params as (
  select 'e6314f17-d2f0-4501-a40b-b5015071879a'::uuid as user_id, 65 as base_engagement, 900 as base_reach, 6 as daily_growth
  union all
  select '8e5ac388-9fa0-4a58-98e0-795c86423b94'::uuid as user_id, 55 as base_engagement, 820 as base_reach, 5 as daily_growth
)
insert into public.daily_metrics (user_id, date, engagement, reach)
select
  p.user_id,
  d.date,
  (p.base_engagement + (p.daily_growth * d.idx) + ((d.idx % 6) * 4))::int as engagement,
  (p.base_reach + (p.daily_growth * 35) + (d.idx * 28) + ((d.idx % 5) * 12))::int as reach
from dates d
cross join user_params p
on conflict (user_id, date) do update
  set engagement = excluded.engagement,
      reach = excluded.reach;

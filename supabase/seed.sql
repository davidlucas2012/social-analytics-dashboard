-- Seed data for two users (replace user_id values with your actual Supabase auth user IDs)

-- Seed POSTS (a few per user)
insert into public.posts
  (user_id, platform, caption, thumbnail_url, media_type, posted_at, likes, comments, shares, saves, reach, impressions, engagement_rate, permalink)
values
  -- User A
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Morning espresso ☕️', null, 'image', now() - interval '3 days', 120, 14, 3, 8, 1800, 2400, 7.50, null),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'tiktok', 'Dev life in 15s', null, 'video', now() - interval '10 days', 980, 88, 41, 55, 12000, 18000, 15.20, null),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', 'instagram', 'Carousel: UI polish', null, 'carousel', now() - interval '20 days', 340, 31, 9, 22, 5200, 6900, 7.80, null),

  -- User B
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Sunset timelapse', null, 'video', now() - interval '2 days', 210, 19, 6, 12, 2600, 3300, 9.00, null),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'tiktok', 'Quick cooking hack', null, 'video', now() - interval '8 days', 1500, 140, 70, 95, 20000, 29000, 18.40, null),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', 'instagram', 'Weekend vibes', null, 'image', now() - interval '28 days', 95, 8, 2, 4, 1400, 2000, 5.10, null);

-- Seed DAILY_METRICS (key points across ~30 days)
insert into public.daily_metrics
  (user_id, date, engagement, reach)
values
  -- User A
  ('e6314f17-d2f0-4501-a40b-b5015071879a', current_date - 29, 40, 800),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', current_date - 20, 65, 1100),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', current_date - 10, 120, 2400),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', current_date - 3, 90, 1900),
  ('e6314f17-d2f0-4501-a40b-b5015071879a', current_date - 1, 105, 2100),

  -- User B
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', current_date - 29, 55, 900),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', current_date - 20, 80, 1300),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', current_date - 10, 160, 3000),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', current_date - 3, 110, 2200),
  ('8e5ac388-9fa0-4a58-98e0-795c86423b94', current_date - 1, 140, 2600);

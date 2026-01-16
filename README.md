# Social Analytics Dashboard

A production-grade social media analytics dashboard built with Next.js 15, Supabase, and TypeScript. This application demonstrates secure multi-tenant data isolation using Row Level Security (RLS), server/client component patterns, and real-time data visualization.

## 🎯 Overview

This dashboard provides content creators with insights into their social media performance across Instagram and TikTok. Users can view summary metrics, track engagement trends, and analyze individual post performance—all secured at the database level through Supabase RLS policies.

## ✨ Features

- **Summary Dashboard**: Total engagement, average engagement rate, trend analysis, and top-performing post
- **Engagement Trends**: Interactive 30-day engagement chart with tooltip and line/area toggle
- **Posts Table**: Sortable, filterable table with platform filtering and search
- **Post Details Modal**: Detailed view of individual post metrics
- **Secure Authentication**: Supabase Auth with custom cookie management
- **Row-Level Security**: Per-user data isolation enforced at the database level
- **Edge Runtime**: Optimized API routes running on Vercel Edge Functions

## 🏗️ Design Decisions (Required)

### 1. Where should engagement metrics be aggregated?

**Decision**: Aggregate totals, averages, and top-post data inside the server-side [`/api/analytics/summary`](src/app/api/analytics/summary/route.ts) route instead of the client or a Postgres function/view.

**Why/Trade-offs**:
- Keeps RLS enforcement at the data boundary and avoids shipping all posts to the browser.
- Centralizes business logic in TypeScript where it is testable and easier to adjust than SQL.
- Reduces client payloads by only returning the summary fields the UI needs.
- Trade-off: the route does extra work on the server and reads raw rows, which is less CPU-efficient than a SQL view but keeps the logic readable and type-safe.

**Implementation**: The route fetches posts plus the last 14 days of `daily_metrics`, fills gaps with zeros, and returns `totalEngagement`, `averageEngagementRate`, `topPost`, `trendPercent`, and period totals. [`useSummary`](src/features/analytics/useSummary.ts) consumes the aggregated payload for the dashboard cards.

### 2. What data should live in Zustand vs. TanStack Query vs. URL state?

**State map (with reasoning)**:
- Platform filter (`selectedPlatform`): Stored in Zustand via [`useDashboardUIStore`](src/features/dashboard/useDashboardUIStore.ts) so filter buttons, table filtering, and modal context share the same value; not mirrored in the URL because it is an ephemeral per-user preference.
- Sort column/direction (`sorting`): Local `useState` inside [`usePostsTable`](src/features/posts/usePostsTable.tsx) since sorting is purely a table concern and should reset when the table unmounts.
- Selected post + modal open (`selectedPostId`, `isPostModalOpen`): Zustand holds this so row clicks in [`PostsTable`](src/features/posts/PostsTable.tsx) and [`PostDetailsModal`](src/features/posts/PostDetailsModal.tsx) stay in sync without prop drilling.
- Chart view type (`chartMode`): Zustand toggled in [`EngagementLineChart`](src/app/dashboard/EngagementLineChart.tsx) to keep the user’s line/area preference stable across re-renders and future chart controls.
- Posts data: TanStack Query in [`usePosts`](src/features/posts/usePosts.ts) fetches and caches Supabase rows with query key `["posts"]`.
- Daily metrics data: TanStack Query in [`useDailyMetrics`](src/features/metrics/useDailyMetrics.ts) fetches the edge route with query key `["daily-metrics", days]` and receives a normalized window.
- URL state: Currently unused on purpose—none of these filters need to be shareable links yet, and keeping them out of the URL avoids leaking user-specific context.

### 3. How do you handle the case where a user has no data?

**API behavior**:
- `/api/analytics/summary` returns `totalEngagement: 0`, `totalPosts: 0`, `averageEngagementRate: null`, `trendPercent: null`, `topPost: null`, and zeroed period totals when Supabase returns no rows; the trend helper short-circuits when the previous week sums to zero to avoid divide-by-zero noise.
- `/api/metrics/daily` always returns the requested window (7–90 days) and fills any missing days with `0` engagement/reach so the chart never receives an empty array.

**UI behavior**:
- Summary cards render `0` or `—`, and the top-post card shows "No posts yet." when the API reports empties.
- The engagement section shows "No engagement data available for the selected period." when `hasEngagementData` detects all-zero metrics; loading/error states render text fallbacks instead of a broken chart.
- [`PostsTable`](src/features/posts/PostsTable.tsx) renders skeleton rows while loading, a clear error message on failures, "No posts yet" for empty datasets, and "No results" when filters remove all rows; the modal stays closed when no post is selected.

### 4. How should the "trend" percentage be calculated?

**Decision**: Compare the last 7 days of engagement vs. the prior 7 days using UTC dates and zero-filling missing days.

**Why/Trade-offs**:
- Consistent windows keep the comparison meaningful even with sparse data.
- Zero-filling prevents gaps from inflating percentages and keeps new-user results stable.
- Returning `null` when the previous window sums to zero avoids misleading `Infinity%` values; the UI renders an em dash in that case.
- Simpler than a 30-day or month-over-month calculation and avoids moving logic into Postgres while keeping it close to the API boundary.

**Implementation**: `calculateTrendPercent` in [`/api/analytics/summary`](src/app/api/analytics/summary/route.ts) builds a 14-day series, slices it into two 7-day buckets, and computes the percent change; the dashboard card labeled "7-day engagement trend" displays the result with up/down indicators.

## 🔐 Security Implementation

### Row Level Security (RLS)

All database tables enforce user isolation through Postgres RLS policies:

**Policies per Table** (`posts` and `daily_metrics`):
1. **SELECT**: `auth.uid() = user_id` - Users only see their own data
2. **INSERT**: `auth.uid() = user_id` - Users can only create data for themselves
3. **UPDATE**: `auth.uid() = user_id` - Users can only modify their own data
4. **DELETE**: `auth.uid() = user_id` - Users can only delete their own data

**Testing**: See [`/rls-test`](src/app/rls-test/page.tsx) route to verify RLS enforcement.

### Authentication Flow

1. **Login**: User authenticates via Supabase Auth, receives session with access token
2. **Cookie Storage**: Custom cookie management ([`authCookies.ts`](src/lib/supabase/authCookies.ts)) stores tokens securely
3. **Middleware Protection**: [`middleware.ts`](middleware.ts) checks `sb-access-token` cookie, redirects unauthorized users
4. **API Authorization**: API routes require `Bearer` token in headers, validate via `supabase.auth.getUser(token)`
5. **RLS Enforcement**: Supabase client initialized with user token ensures RLS applies to all queries

### Security Measures

- **Token Validation**: Every API route validates bearer token before processing
- **Secure Cookies**: `Secure` flag enabled in production (HTTPS), `HttpOnly` where possible
- **Input Validation**: Query parameters validated (e.g., `days` param must be 7-90)
- **Error Sanitization**: Generic error messages prevent information leakage
- **No Client-Side Secrets**: Only `NEXT_PUBLIC_SUPABASE_*` vars exposed to browser
- **Server Components**: Dashboard page validates auth server-side before rendering

## 🗄️ Database Schema

### Tables

**posts**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- platform (text: 'instagram' | 'tiktok')
- posted_at (timestamptz)
- caption (text)
- permalink (text)
- thumbnail_url (text)
- likes (integer)
- comments (integer)
- shares (integer)
- saves (integer)
- views (bigint)
- plays (bigint)
- reach (integer)
- engagement_rate (numeric)
- created_at (timestamptz)
```

**daily_metrics**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- date (date, unique per user)
- engagement (integer)
- reach (integer)
```

### Migrations

- [`0001_init.sql`](supabase/migrations/0001_init.sql): Creates tables, indexes, and RLS policies
- [`seed.sql`](supabase/seed.sql): Populates two test users with 18 posts and 30 days of metrics

**Test Users**:
- User A: `e6314f17-d2f0-4501-a40b-b5015071879a` (9 posts, Instagram + TikTok mix)
- User B: `8e5ac388-9fa0-4a58-98e0-795c86423b94` (9 posts, Instagram + TikTok mix)

## 🚀 Tech Stack

**Framework**: Next.js 15 (App Router, Server Components, TypeScript strict mode)  
**Database**: Supabase (PostgreSQL + Auth + RLS)  
**State Management**: TanStack Query v5 (server state) + Zustand (UI state)  
**Data Visualization**: Visx (D3-based React charts)  
**Tables**: TanStack Table v8 (headless table library)  
**UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS 4.x)  
**Icons**: Lucide React  
**Deployment**: Vercel (with Edge Runtime for `/api/metrics/daily`)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── analytics/summary/    # Summary metrics endpoint
│   │   └── metrics/daily/        # Daily metrics endpoint (Edge)
│   ├── dashboard/                # Protected dashboard page + client shell
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   └── rls-test/                 # RLS verification page
├── components/ui/                # shadcn/ui components
├── features/                     # Feature modules
│   ├── analytics/                # Summary hooks
│   ├── auth/                     # Auth utilities and cookies
│   ├── dashboard/                # Dashboard UI store/hooks
│   ├── metrics/                  # Daily metrics hooks
│   └── posts/                    # Posts table + modal + hooks
├── lib/
│   ├── supabase/                 # Supabase client/server setup
│   ├── format.ts                 # Date/number formatting helpers
│   └── utils.ts                  # Tailwind utility helpers
├── pages/                        # Legacy Document config for Next.js
middleware.ts                      # Auth middleware
supabase/
├── migrations/                   # Database migrations (includes RLS)
└── seed.sql                      # Seed data
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd social-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run migrations: `supabase db push` (or run [`0001_init.sql`](supabase/migrations/0001_init.sql) manually)
   - Run seed: Execute [`seed.sql`](supabase/seed.sql) in SQL Editor
   - Create test users via Supabase Auth dashboard (use UUIDs from seed data)

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with test user credentials (create via Supabase dashboard)

## 🔧 Environment Variables (Documented)

- `.env.example` lists the required keys: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no secrets committed).
- Supabase clients on the client (`src/lib/supabase/client.ts`), server (`src/lib/supabase/server.ts`), and edge route (`src/app/api/metrics/daily/route.ts`) read from those names.
- Service role keys stay out of the client bundle; use the Supabase dashboard for migrations/seeds instead.

### Deployment

1. **Deploy to Vercel**
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Verify Edge Function**: `/api/metrics/daily` should run on Edge Runtime

## 🧪 Testing RLS

Visit [`/rls-test`](src/app/rls-test/page.tsx) after logging in to verify:
- You only see your own posts and metrics
- Other users' data is hidden via RLS policies
- Direct database queries respect `auth.uid()` filtering

## ⏱️ Development Time

**Total**: ~8-10 hours

- Database design & RLS policies: 1.5h
- Authentication setup (cookies, middleware): 1.5h
- API routes (summary, daily metrics): 2h
- Dashboard UI (summary cards, chart, table): 2.5h
- State management integration: 1h
- Testing & refinement: 1.5h

## 🚧 What I Would Improve

Given more time, I would enhance:

1. **Testing**: Add integration tests for RLS policies, E2E tests for auth flow
2. **Error Handling**: More granular error boundaries, retry logic for failed requests
3. **Performance**: Implement React `use` for suspense, optimize chart re-renders
4. **Features**: Add date range picker, export to CSV, more detailed post insights
5. **Accessibility**: Full keyboard navigation, ARIA labels, screen reader testing
6. **Mobile**: Responsive table (card view on small screens), touch-friendly chart
7. **Observability**: Add logging, performance monitoring, error tracking (e.g., Sentry)
8. **Caching**: Implement ISR for dashboard page, cache API responses with stale-while-revalidate
9. **Database**: Move trend calculation to Postgres function for better performance
10. **UI Polish**: Loading skeletons, animated transitions, empty state illustrations

---

**Built as part of the Frontend Engineer Coding Challenge**

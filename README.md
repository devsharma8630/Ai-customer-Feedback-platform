# Loop — AI Customer Feedback Intelligence Platform

Phase 1 foundation: multi-tenant SaaS scaffold with Supabase auth + RLS, RBAC,
feedback capture, Gemini-powered AI analysis, a live AI assistant, and a
premium glassmorphism dashboard.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Supabase (Postgres, Auth, Storage) · Google Gemini · Recharts

## What's included in this phase

- **Database**: `supabase/schema.sql` — full multi-tenant schema, RBAC roles,
  RLS policies on every table, storage buckets, triggers for customer stats.
- **Auth**: signup (auto-provisions a company + admin), login, forgot/reset
  password, session-aware middleware, RBAC route protection (`/admin` is
  super-admin only).
- **Feedback**: manual entry form, list with filters, detail view with AI
  insights, status/priority triage, AI-suggested replies.
- **AI**: OpenAI-powered sentiment/emotion/topic/urgency analysis on every
  submission, AI report generation (weekly/monthly/VoC/executive), and a
  chat assistant that answers questions from your live feedback data.
- **Dashboard**: NPS, sentiment trend, department performance, top
  complaints/feature requests — all computed from real data.
- **Settings**: company profile, departments, categories, team.
- **Super admin**: cross-tenant company list and AI usage monitoring.

## Not yet built (next phases)

CSV/email import, QR/survey channels, notifications (real-time + email),
PDF/Excel export, global command-K search, audit log viewer, saved filters,
customer CSV export, keyboard shortcuts, and the remaining polish pass
(loading skeletons everywhere, empty states, error boundaries on every route).

## Setup

1. **Create a Supabase project**, then run `supabase/schema.sql` in the SQL
   editor (or via the Supabase CLI: `supabase db push`).
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page (server-only, never exposed to
     the client — used for company provisioning on signup and the admin panel).
   - `OPENAI_API_KEY` — from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` in dev.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Visit `/signup` to create your first workspace — it becomes a
   `company_admin` automatically. To promote a user to `super_admin`, update
   their `role` directly in the `profiles` table.

## Deploying

Push to GitHub and import into Vercel, or run `vercel` from this directory.
Add the same environment variables in the Vercel project settings.

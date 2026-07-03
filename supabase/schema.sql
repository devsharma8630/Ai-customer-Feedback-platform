-- ============================================================
-- PROJECT LOOP — AI Customer Feedback Intelligence Platform
-- Supabase / PostgreSQL schema
-- Multi-tenant, RBAC, RLS enforced
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_role as enum ('super_admin', 'company_admin', 'manager', 'employee');
create type feedback_channel as enum ('website_form', 'email_import', 'csv_upload', 'manual_entry', 'qr_code', 'survey');
create type feedback_status as enum ('new', 'in_review', 'in_progress', 'resolved', 'closed', 'spam');
create type feedback_priority as enum ('low', 'medium', 'high', 'urgent');
create type feedback_sentiment as enum ('positive', 'negative', 'neutral');
create type feedback_emotion as enum ('happy', 'angry', 'excited', 'frustrated', 'confused', 'neutral');
create type subscription_plan as enum ('trial', 'starter', 'growth', 'enterprise');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

-- ------------------------------------------------------------
-- COMPANIES (tenants)
-- ------------------------------------------------------------
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  industry text,
  website text,
  plan subscription_plan not null default 'trial',
  subscription_status subscription_status not null default 'trialing',
  ai_monthly_quota integer not null default 1000,
  ai_usage_this_month integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  role user_role not null default 'employee',
  full_name text not null,
  avatar_url text,
  phone text,
  job_title text,
  department_id uuid,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_company on profiles(company_id);

-- ------------------------------------------------------------
-- DEPARTMENTS
-- ------------------------------------------------------------
create table departments (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  lead_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table profiles add constraint fk_profiles_department
  foreign key (department_id) references departments(id) on delete set null;

create index idx_departments_company on departments(company_id);

-- ------------------------------------------------------------
-- FEEDBACK CATEGORIES (tags/categories per company)
-- ------------------------------------------------------------
create table feedback_categories (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  color text default '#7C6CF6',
  created_at timestamptz not null default now()
);

create index idx_categories_company on feedback_categories(company_id);

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
create table customers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  total_feedback_count integer not null default 0,
  average_rating numeric(3,2),
  first_seen_at timestamptz not null default now(),
  last_feedback_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index idx_customers_company on customers(company_id);
create index idx_customers_email on customers(company_id, email);

-- ------------------------------------------------------------
-- FEEDBACK
-- ------------------------------------------------------------
create table feedback (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,

  customer_name text not null,
  customer_email text,
  customer_phone text,

  product text,
  category_id uuid references feedback_categories(id) on delete set null,
  department_id uuid references departments(id) on delete set null,

  rating smallint check (rating between 1 and 5),
  message text not null,
  location text,
  channel feedback_channel not null default 'manual_entry',

  status feedback_status not null default 'new',
  priority feedback_priority not null default 'medium',
  tags text[] not null default '{}',

  -- AI enrichment
  ai_sentiment feedback_sentiment,
  ai_emotion feedback_emotion,
  ai_topics text[] default '{}',
  ai_keywords text[] default '{}',
  ai_is_complaint boolean default false,
  ai_is_feature_request boolean default false,
  ai_is_spam boolean default false,
  ai_is_urgent boolean default false,
  ai_language text,
  ai_summary text,
  ai_root_cause text,
  ai_recommended_action text,
  ai_confidence numeric(4,3),
  ai_analyzed_at timestamptz,

  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_feedback_company on feedback(company_id);
create index idx_feedback_status on feedback(company_id, status);
create index idx_feedback_sentiment on feedback(company_id, ai_sentiment);
create index idx_feedback_created on feedback(company_id, created_at desc);
create index idx_feedback_department on feedback(company_id, department_id);
create index idx_feedback_search on feedback using gin (to_tsvector('english', coalesce(message,'') || ' ' || coalesce(customer_name,'') || ' ' || coalesce(product,'')));

-- ------------------------------------------------------------
-- FEEDBACK ATTACHMENTS
-- ------------------------------------------------------------
create table feedback_attachments (
  id uuid primary key default uuid_generate_v4(),
  feedback_id uuid not null references feedback(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  file_size integer,
  uploaded_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FEEDBACK REPLIES / TIMELINE
-- ------------------------------------------------------------
create table feedback_replies (
  id uuid primary key default uuid_generate_v4(),
  feedback_id uuid not null references feedback(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  message text not null,
  is_ai_suggested boolean not null default false,
  sent_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_replies_feedback on feedback_replies(feedback_id);

create table feedback_activity (
  id uuid primary key default uuid_generate_v4(),
  feedback_id uuid not null references feedback(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_feedback on feedback_activity(feedback_id);

-- ------------------------------------------------------------
-- AI REPORTS (weekly / monthly / VoC / executive summaries)
-- ------------------------------------------------------------
create table ai_reports (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  type text not null check (type in ('weekly','monthly','voice_of_customer','executive_summary')),
  period_start date not null,
  period_end date not null,
  content jsonb not null,
  generated_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_reports_company on ai_reports(company_id);

-- ------------------------------------------------------------
-- AI CHAT (assistant conversations)
-- ------------------------------------------------------------
create table ai_chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table ai_chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references ai_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- AI USAGE LOG (for platform-level monitoring by super admin)
-- ------------------------------------------------------------
create table ai_usage_log (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  feature text not null,
  tokens_used integer default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, is_read);

-- ------------------------------------------------------------
-- SAVED FILTERS / BOOKMARKS
-- ------------------------------------------------------------
create table saved_filters (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now()
);

create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  feedback_id uuid not null references feedback(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, feedback_id)
);

-- ------------------------------------------------------------
-- AUDIT LOGS
-- ------------------------------------------------------------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_company on audit_logs(company_id, created_at desc);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function current_profile_company_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select company_id from profiles where id = auth.uid();
$$;

create or replace function current_profile_role()
returns user_role
language sql stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_super_admin()
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'super_admin' from profiles where id = auth.uid()), false);
$$;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_companies_updated before update on companies
  for each row execute function set_updated_at();
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger trg_feedback_updated before update on feedback
  for each row execute function set_updated_at();

-- keep customer aggregates in sync
create or replace function sync_customer_stats()
returns trigger language plpgsql as $$
begin
  if new.customer_id is not null then
    update customers c
      set total_feedback_count = (select count(*) from feedback where customer_id = new.customer_id),
          average_rating = (select round(avg(rating)::numeric, 2) from feedback where customer_id = new.customer_id and rating is not null),
          last_feedback_at = now()
    where c.id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger trg_feedback_customer_sync after insert on feedback
  for each row execute function sync_customer_stats();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table companies enable row level security;
alter table profiles enable row level security;
alter table departments enable row level security;
alter table feedback_categories enable row level security;
alter table customers enable row level security;
alter table feedback enable row level security;
alter table feedback_attachments enable row level security;
alter table feedback_replies enable row level security;
alter table feedback_activity enable row level security;
alter table ai_reports enable row level security;
alter table ai_chat_sessions enable row level security;
alter table ai_chat_messages enable row level security;
alter table ai_usage_log enable row level security;
alter table notifications enable row level security;
alter table saved_filters enable row level security;
alter table bookmarks enable row level security;
alter table audit_logs enable row level security;

-- COMPANIES: super admins see all; members see only their own company
create policy "companies_select" on companies for select
  using (is_super_admin() or id = current_profile_company_id());
create policy "companies_update" on companies for update
  using (is_super_admin() or (id = current_profile_company_id() and current_profile_role() = 'company_admin'));
create policy "companies_insert_super_admin" on companies for insert
  with check (is_super_admin());
create policy "companies_delete_super_admin" on companies for delete
  using (is_super_admin());

-- PROFILES
create policy "profiles_select" on profiles for select
  using (is_super_admin() or company_id = current_profile_company_id());
create policy "profiles_update_self_or_admin" on profiles for update
  using (id = auth.uid() or is_super_admin() or (company_id = current_profile_company_id() and current_profile_role() in ('company_admin')));
create policy "profiles_insert" on profiles for insert
  with check (id = auth.uid() or is_super_admin());

-- Generic tenant-isolation template applied to every company-scoped table
create policy "departments_isolated" on departments for all
  using (is_super_admin() or company_id = current_profile_company_id())
  with check (is_super_admin() or company_id = current_profile_company_id());

create policy "categories_isolated" on feedback_categories for all
  using (is_super_admin() or company_id = current_profile_company_id())
  with check (is_super_admin() or company_id = current_profile_company_id());

create policy "customers_isolated" on customers for all
  using (is_super_admin() or company_id = current_profile_company_id())
  with check (is_super_admin() or company_id = current_profile_company_id());

create policy "feedback_isolated" on feedback for all
  using (is_super_admin() or company_id = current_profile_company_id())
  with check (is_super_admin() or company_id = current_profile_company_id());

create policy "attachments_isolated" on feedback_attachments for all
  using (is_super_admin() or exists (select 1 from feedback f where f.id = feedback_id and f.company_id = current_profile_company_id()));

create policy "replies_isolated" on feedback_replies for all
  using (is_super_admin() or exists (select 1 from feedback f where f.id = feedback_id and f.company_id = current_profile_company_id()));

create policy "activity_isolated" on feedback_activity for all
  using (is_super_admin() or exists (select 1 from feedback f where f.id = feedback_id and f.company_id = current_profile_company_id()));

create policy "reports_isolated" on ai_reports for all
  using (is_super_admin() or company_id = current_profile_company_id())
  with check (is_super_admin() or company_id = current_profile_company_id());

create policy "chat_sessions_isolated" on ai_chat_sessions for all
  using (is_super_admin() or user_id = auth.uid())
  with check (is_super_admin() or user_id = auth.uid());

create policy "chat_messages_isolated" on ai_chat_messages for all
  using (is_super_admin() or exists (select 1 from ai_chat_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "usage_log_isolated" on ai_usage_log for select
  using (is_super_admin() or company_id = current_profile_company_id());

create policy "notifications_isolated" on notifications for all
  using (is_super_admin() or user_id = auth.uid())
  with check (is_super_admin() or user_id = auth.uid());

create policy "saved_filters_isolated" on saved_filters for all
  using (is_super_admin() or user_id = auth.uid())
  with check (is_super_admin() or user_id = auth.uid());

create policy "bookmarks_isolated" on bookmarks for all
  using (is_super_admin() or user_id = auth.uid())
  with check (is_super_admin() or user_id = auth.uid());

create policy "audit_logs_isolated" on audit_logs for select
  using (is_super_admin() or company_id = current_profile_company_id());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('feedback-attachments', 'feedback-attachments', false),
  ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatar_owner_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "logo_public_read" on storage.objects for select
  using (bucket_id = 'company-logos');
create policy "logo_admin_write" on storage.objects for insert
  with check (bucket_id = 'company-logos' and auth.uid() is not null);

create policy "attachments_tenant_read" on storage.objects for select
  using (bucket_id = 'feedback-attachments' and auth.uid() is not null);
create policy "attachments_tenant_write" on storage.objects for insert
  with check (bucket_id = 'feedback-attachments' and auth.uid() is not null);

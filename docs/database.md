# Database Schema

## 1. Overview

PostgreSQL is the primary database, managed through Supabase. The `pgvector` extension is enabled for storing embeddings used in AI matching and the RAG opportunity assistant.

Row Level Security (RLS) should be enabled on all tables. Access is scoped by role (learner, provider, sponsor, admin) and, where applicable, by ownership of the row.

---

## 2. Extensions

```sql
create extension if not exists "uuid-ossp";
create extension if not exists vector;
```

---

## 3. Enums

```sql
create type user_role as enum ('learner', 'provider', 'sponsor', 'admin');

create type opportunity_type as enum (
  'TUITION',
  'COURSE',
  'WORKSHOP',
  'MENTORSHIP',
  'MOCK_INTERVIEW'
);

create type opportunity_status as enum ('draft', 'active', 'closed', 'expired');

create type provider_status as enum ('pending', 'verified', 'rejected');

create type booking_status as enum ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

create type sponsorship_status as enum ('pending', 'active', 'completed', 'cancelled');

create type knowledge_source_status as enum ('draft', 'verified', 'expired');
```

---

## 4. Core Tables

### 4.1 users

Mirrors `auth.users` (Supabase Auth) with app-specific fields.

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'learner',
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.2 learner_profiles

```sql
create table learner_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  education_level text,
  subjects text[],
  interests text[],
  location text,
  learning_goals text,
  budget_min numeric,
  budget_max numeric,
  availability text,
  profile_embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.3 provider_profiles

```sql
create table provider_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  university text,
  faculty text,
  skills text[],
  subjects text[],
  expertise_areas text[],
  experience_years numeric,
  bio text,
  location text,
  availability text,
  status provider_status not null default 'pending',
  profile_embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.4 opportunities

```sql
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references users(id) on delete cascade,
  title text not null,
  type opportunity_type not null,
  description text,
  subject text,
  target_level text,
  price numeric,
  delivery_mode text,          -- e.g. online, in-person
  location text,
  duration text,
  status opportunity_status not null default 'draft',
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on opportunities using ivfflat (embedding vector_cosine_ops);
```

### 4.5 bookings

```sql
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  status booking_status not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  completed_at timestamptz
);
```

### 4.6 sponsorships

```sql
create table sponsorships (
  id uuid primary key default uuid_generate_v4(),
  sponsor_id uuid not null references users(id) on delete cascade,
  learner_id uuid references users(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  amount numeric not null,
  status sponsorship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.7 knowledge_base (RAG source documents)

```sql
create table knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  category text not null,       -- scholarship, internship, course, workshop, competition, career_opportunity
  title text not null,
  content text not null,
  source_url text,
  status knowledge_source_status not null default 'draft',
  embedding vector(1536),
  verified_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on knowledge_base using ivfflat (embedding vector_cosine_ops);
```

### 4.8 impact_metrics (optional aggregate/reporting table)

```sql
create table impact_metrics (
  id uuid primary key default uuid_generate_v4(),
  metric_key text not null,     -- e.g. 'active_providers', 'learners_supported'
  metric_value numeric not null,
  recorded_at timestamptz not null default now()
);
```

---

## 5. Relationships Summary

- `users` 1—1 `learner_profiles` / `provider_profiles` (role-dependent)
- `provider_profiles` 1—N `opportunities`
- `opportunities` 1—N `bookings`
- `users` (sponsor) 1—N `sponsorships`
- `knowledge_base` is independent, queried by RAG via `embedding`

---

## 6. Row Level Security (example policies)

```sql
alter table opportunities enable row level security;

create policy "Providers manage own opportunities"
on opportunities for all
using (provider_id = auth.uid())
with check (provider_id = auth.uid());

create policy "Anyone can view active opportunities"
on opportunities for select
using (status = 'active');
```

Similar patterns apply to `bookings` (learner sees own bookings, provider sees bookings on their opportunities), `sponsorships` (sponsor sees own records), and `knowledge_base` (public read on `verified` rows, admin-only write).

---

## 7. Notes

- Embedding dimension (`1536`) assumes a standard embedding model; adjust to match whichever LLM/embedding API is finalized.
- `ivfflat` indexes require an approximate row count before creation to tune `lists`; for MVP scale this can be created with default settings.
- Timestamps use `timestamptz` throughout for consistency.
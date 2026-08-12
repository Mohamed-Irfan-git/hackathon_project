-- Gemini text-embedding-004 emits 768 dimensions.  This project therefore
-- deliberately uses vector(768), rather than the vector(1536) in database.md.
create extension if not exists "uuid-ossp";
create extension if not exists vector;

create type user_role as enum ('learner', 'provider', 'sponsor', 'admin');
create type opportunity_type as enum ('TUITION', 'COURSE', 'WORKSHOP', 'MENTORSHIP', 'MOCK_INTERVIEW');
create type opportunity_status as enum ('draft', 'active', 'closed', 'expired');
create type provider_status as enum ('pending', 'verified', 'rejected');
create type booking_status as enum ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
create type sponsorship_status as enum ('pending', 'active', 'completed', 'cancelled');
create type knowledge_source_status as enum ('draft', 'verified', 'expired');

create table users (id uuid primary key references auth.users(id) on delete cascade, role user_role not null default 'learner', full_name text not null, email text not null unique, phone text, avatar_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table learner_profiles (user_id uuid primary key references users(id) on delete cascade, education_level text, subjects text[], interests text[], location text, learning_goals text, budget_min numeric, budget_max numeric, availability text, profile_embedding vector(768), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table provider_profiles (user_id uuid primary key references users(id) on delete cascade, university text, faculty text, skills text[], subjects text[], expertise_areas text[], experience_years numeric, bio text, location text, availability text, status provider_status not null default 'pending', profile_embedding vector(768), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table opportunities (id uuid primary key default extensions.uuid_generate_v4(), provider_id uuid not null references users(id) on delete cascade, title text not null, type opportunity_type not null, description text, subject text, target_level text, price numeric, delivery_mode text, location text, duration text, status opportunity_status not null default 'draft', embedding vector(768), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table bookings (id uuid primary key default extensions.uuid_generate_v4(), learner_id uuid not null references users(id) on delete cascade, opportunity_id uuid not null references opportunities(id) on delete cascade, status booking_status not null default 'pending', requested_at timestamptz not null default now(), responded_at timestamptz, completed_at timestamptz);
create table sponsorships (id uuid primary key default extensions.uuid_generate_v4(), sponsor_id uuid not null references users(id) on delete cascade, learner_id uuid references users(id) on delete set null, opportunity_id uuid references opportunities(id) on delete set null, amount numeric not null, status sponsorship_status not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table knowledge_base (id uuid primary key default extensions.uuid_generate_v4(), category text not null, title text not null, content text not null, source_url text, status knowledge_source_status not null default 'draft', embedding vector(768), verified_by uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table impact_metrics (id uuid primary key default extensions.uuid_generate_v4(), metric_key text not null, metric_value numeric not null, recorded_at timestamptz not null default now());

create index opportunities_embedding_idx on opportunities using ivfflat (embedding vector_cosine_ops);
create index knowledge_base_embedding_idx on knowledge_base using ivfflat (embedding vector_cosine_ops);

create or replace function match_opportunities(query_embedding vector(768), match_count int default 5)
returns table (id uuid, title text, similarity float) language sql stable as $$
 select id, title, 1 - (embedding <=> query_embedding) from opportunities
 where status = 'active' and embedding is not null order by embedding <=> query_embedding limit match_count;
$$;
create or replace function match_knowledge_base(query_embedding vector(768), match_count int default 5)
returns table (id uuid, title text, category text, content text, source_url text, similarity float) language sql stable as $$
 select id, title, category, content, source_url, 1 - (embedding <=> query_embedding) from knowledge_base
 where status = 'verified' and embedding is not null order by embedding <=> query_embedding limit match_count;
$$;

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from users where id = auth.uid() and role = 'admin'); $$;
alter table users enable row level security; alter table learner_profiles enable row level security; alter table provider_profiles enable row level security; alter table opportunities enable row level security; alter table bookings enable row level security; alter table sponsorships enable row level security; alter table knowledge_base enable row level security; alter table impact_metrics enable row level security;
create policy "Users view self or admin" on users for select using (id = auth.uid() or is_admin());
create policy "Users update self" on users for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Learners manage own profile" on learner_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Providers view own profile or public verified" on provider_profiles for select using (user_id = auth.uid() or status = 'verified' or is_admin());
create policy "Providers manage own profile" on provider_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Providers manage own opportunities" on opportunities for all using (provider_id = auth.uid()) with check (provider_id = auth.uid());
create policy "Anyone can view active opportunities" on opportunities for select using (status = 'active');
create policy "Learners see own bookings" on bookings for select using (learner_id = auth.uid());
create policy "Providers see opportunity bookings" on bookings for select using (exists(select 1 from opportunities o where o.id = opportunity_id and o.provider_id = auth.uid()));
create policy "Learners create own bookings" on bookings for insert with check (learner_id = auth.uid());
create policy "Providers respond to opportunity bookings" on bookings for update using (exists(select 1 from opportunities o where o.id = opportunity_id and o.provider_id = auth.uid()));
create policy "Sponsors manage own sponsorships" on sponsorships for all using (sponsor_id = auth.uid() or is_admin()) with check (sponsor_id = auth.uid() or is_admin());
create policy "Public reads verified knowledge" on knowledge_base for select using (status = 'verified' or is_admin());
create policy "Admins write knowledge" on knowledge_base for all using (is_admin()) with check (is_admin());
create policy "Admins read impact metrics" on impact_metrics for select using (is_admin());

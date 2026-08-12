create table sponsorship_requests (
  id uuid primary key default extensions.uuid_generate_v4(),
  learner_id uuid not null references users(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  title text not null,
  reason text not null,
  amount_needed numeric not null check (amount_needed > 0),
  amount_raised numeric not null default 0 check (amount_raised >= 0),
  status text not null default 'pending' check (status in ('pending', 'funded', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sponsorship_requests enable row level security;
create policy "Learners manage own sponsorship requests" on sponsorship_requests for all using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy "Sponsors and admins view active requests" on sponsorship_requests for select using (status = 'pending' or is_admin());

-- Durable cache prevents repeated Gemini calls for the same grounded question.
create table rag_cache (
  question_hash text primary key,
  answer text not null,
  sources jsonb not null default '[]'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- The key is a SHA-256 hash of a user id or request IP, never the raw identifier.
create table rag_rate_limits (
  scope_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (scope_hash, window_start)
);

alter table rag_cache enable row level security;
alter table rag_rate_limits enable row level security;

create or replace function consume_rag_quota(scope_hash text, maximum_requests integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz := date_trunc('hour', now());
  current_count integer;
begin
  insert into rag_rate_limits (scope_hash, window_start, request_count)
  values (scope_hash, current_window, 1)
  on conflict (scope_hash, window_start)
  do update set request_count = rag_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= maximum_requests;
end;
$$;

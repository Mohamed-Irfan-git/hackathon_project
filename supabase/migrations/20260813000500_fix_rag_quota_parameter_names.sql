drop function if exists consume_rag_quota(text, integer);

create function consume_rag_quota(p_scope_hash text, p_maximum_requests integer)
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
  values (p_scope_hash, current_window, 1)
  on conflict (scope_hash, window_start)
  do update set request_count = rag_rate_limits.request_count + 1
  returning request_count into current_count;
  return current_count <= p_maximum_requests;
end;
$$;

revoke execute on function consume_rag_quota(text, integer) from public, anon, authenticated;

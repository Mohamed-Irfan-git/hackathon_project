-- Only Edge Functions using the service role should consume quota windows.
revoke execute on function consume_rag_quota(text, integer) from public, anon, authenticated;

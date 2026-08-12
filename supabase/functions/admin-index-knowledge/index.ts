import { admin, body, cors, fail, ok, requireAdmin, user, vector } from '../_shared/http.ts';
import { contentHash, generateEmbedding } from '../_shared/gemini.ts';

const MAX_ENTRIES_PER_RUN = 10;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const actor = await user(req); const input = await body(req);
  if (!actor) return fail('unauthorized', 'Authentication is required', 401);
  if (!(await requireAdmin(actor.id))) return fail('forbidden', 'Admin role required', 403);
  if (!input || Object.keys(input).length) return fail('validation_error', 'This endpoint does not accept a request body');

  const db = admin();
  const { data: entries, error } = await db.from('knowledge_base').select('id,title,content,embedding,embedding_input_hash').eq('status', 'verified').order('updated_at', { ascending: true }).limit(MAX_ENTRIES_PER_RUN);
  if (error) return fail('internal_error', error.message, 500);

  let indexed = 0; let skipped = 0; let failed = 0;
  for (const entry of entries ?? []) {
    const text = `${entry.title}\n${entry.content}`;
    const hash = await contentHash(text);
    if (entry.embedding && entry.embedding_input_hash === hash) { skipped++; continue; }
    try {
      const embedding = await generateEmbedding(text);
      const { error: updateError } = await db.from('knowledge_base').update({ embedding: vector(embedding), embedding_input_hash: hash, updated_at: new Date().toISOString() }).eq('id', entry.id);
      if (updateError) throw updateError;
      indexed++;
    } catch { failed++; }
  }
  if (indexed > 0) await db.from('rag_cache').delete().neq('question_hash', '');
  return ok({ indexed, skipped, failed, processed: entries?.length ?? 0, limit: MAX_ENTRIES_PER_RUN });
});

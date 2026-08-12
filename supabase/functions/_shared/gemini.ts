const apiKey = () => Deno.env.get('GEMINI_API_KEY');
const embeddingModel = () => Deno.env.get('GEMINI_EMBEDDING_MODEL');
const chatModel = () => Deno.env.get('GEMINI_CHAT_MODEL');
const embeddingCache = new Map<string, number[]>();

export async function contentHash(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function gemini(path: string, body: unknown) {
  const key = apiKey();
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  return response.json();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const hash = await contentHash(text);
  const cached = embeddingCache.get(hash);
  if (cached) return cached;
  const model = embeddingModel(); if (!model) throw new Error('GEMINI_EMBEDDING_MODEL is not configured');
  // Keep Gemini's configurable output aligned with the deployed pgvector(768) schema.
  // This is supported by gemini-embedding-001, which otherwise returns 3072 values by default.
  const json = await gemini(`${model}:embedContent`, { content: { parts: [{ text }] }, outputDimensionality: 768 });
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || !values.every((v: unknown) => typeof v === 'number')) throw new Error('Gemini returned no embedding values');
  if (values.length !== 768) throw new Error(`Embedding dimension ${values.length} does not match database vector(768)`);
  embeddingCache.set(hash, values);
  return values;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const model = chatModel(); if (!model) throw new Error('GEMINI_CHAT_MODEL is not configured');
  const json = await gemini(`${model}:generateContent`, { contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('Gemini returned no answer'); return text;
}

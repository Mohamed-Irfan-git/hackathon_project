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
  const configured = embeddingModel();
  const modelsToTry = Array.from(new Set([configured, 'text-embedding-004', 'embedding-001'].filter(Boolean))) as string[];
  let lastErr: unknown;
  for (const model of modelsToTry) {
    try {
      const json = await gemini(`${model}:embedContent`, { content: { parts: [{ text }] }, outputDimensionality: 768 });
      const values = json?.embedding?.values;
      if (Array.isArray(values) && values.length === 768 && values.every((v: unknown) => typeof v === 'number')) {
        embeddingCache.set(hash, values);
        return values;
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Embedding model unavailable');
}

export async function generateAnswer(prompt: string): Promise<string> {
  const configured = chatModel();
  const modelsToTry = Array.from(new Set([configured, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'].filter(Boolean))) as string[];
  let lastErr: unknown;
  for (const model of modelsToTry) {
    try {
      const json = await gemini(`${model}:generateContent`, { contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
      if (text) return text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Chat model unavailable');
}

const apiKey = () => Deno.env.get('GEMINI_API_KEY');
const embeddingModel = () => Deno.env.get('GEMINI_EMBEDDING_MODEL');
const chatModel = () => Deno.env.get('GEMINI_CHAT_MODEL');

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
  const model = embeddingModel(); if (!model) throw new Error('GEMINI_EMBEDDING_MODEL is not configured');
  const json = await gemini(`${model}:embedContent`, { content: { parts: [{ text }] } });
  const values = json?.embedding?.values;
  if (!Array.isArray(values) || !values.every((v: unknown) => typeof v === 'number')) throw new Error('Gemini returned no embedding values');
  if (values.length !== 768) throw new Error(`Embedding dimension ${values.length} does not match database vector(768)`);
  return values;
}

export async function generateAnswer(prompt: string): Promise<string> {
  const model = chatModel(); if (!model) throw new Error('GEMINI_CHAT_MODEL is not configured');
  const json = await gemini(`${model}:generateContent`, { contents: [{ role: 'user', parts: [{ text: prompt }] }] });
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('');
  if (!text) throw new Error('Gemini returned no answer'); return text;
}

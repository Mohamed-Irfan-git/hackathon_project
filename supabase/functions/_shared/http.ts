import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
export const ok = (data: unknown) => new Response(JSON.stringify({ data }), { headers: { ...cors, 'content-type': 'application/json' } });
export const fail = (code: string, message: string, status = 400) => new Response(JSON.stringify({ error: { code, message } }), { status, headers: { ...cors, 'content-type': 'application/json' } });
export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
export async function user(req: Request) { const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, ''); if (!token) return null; const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: `Bearer ${token}` } } }); const { data } = await client.auth.getUser(); return data.user; }
export const vector = (values: number[]) => `[${values.join(',')}]`;
export async function body(req: Request): Promise<Record<string, unknown> | null> { try { const value = await req.json(); return value && typeof value === 'object' && !Array.isArray(value) ? value : null; } catch { return null; } }
export async function requireAdmin(id: string) { const { data } = await admin().from('users').select('role').eq('id', id).single(); return data?.role === 'admin'; }

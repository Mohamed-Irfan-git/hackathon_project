import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import type { Booking, ImpactMetrics, KnowledgeBaseEntry, Opportunity, ProviderProfileData, RAGResponse, Sponsorship, SponsorshipRequest } from '../types';

type DbOpportunity = Omit<Opportunity, 'provider_name' | 'provider_verified'> & { provider_name?: string; provider_verified?: boolean };
const toOpportunity = (row: DbOpportunity): Opportunity => ({
  ...row,
  provider_name: row.provider_name ?? 'Verified provider',
  provider_verified: row.provider_verified ?? true,
  description: row.description ?? '', subject: row.subject ?? 'General', target_level: row.target_level ?? 'All levels',
  price: Number(row.price ?? 0), delivery_mode: row.delivery_mode ?? 'online', duration: row.duration ?? 'Flexible',
});
const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as { data: T }).data;
  return payload as T;
};
async function invoke<T>(name: string, body?: unknown): Promise<T> {
  const payload = body === undefined || body === null ? undefined : body as Record<string, unknown>;
  const { data, error } = await supabase.functions.invoke(name, payload === undefined ? undefined : { body: payload });
  if (error) {
    // Edge Functions return useful validation/authorization messages in their response body.
    // Surface those to the UI instead of the opaque "FunctionsHttpError" message.
    const response = error.context;
    if (response instanceof Response) {
      const details = await response.clone().json().catch(() => null) as { error?: { message?: string } | string; message?: string } | null;
      const message = typeof details?.error === 'string'
        ? details.error
        : details?.error?.message ?? details?.message;
      if (message) throw new Error(message);
    }
    throw error;
  }
  return unwrap<T>(data);
}

export const api = {
  async getOpportunities(filters: { subject?: string; level?: string; budget_max?: number; location?: string; search?: string } = {}): Promise<Opportunity[]> {
    if (!isSupabaseConfigured) return [];
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== '' && key !== 'search') params.set(key, String(value));
    const response = await fetch(`${supabaseUrl}/functions/v1/search-opportunities?${params.toString()}`, {
      headers: { apikey: supabaseAnonKey },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? 'Unable to search opportunities');
    const rows = unwrap<DbOpportunity[]>(payload);
    const query = filters.search?.trim().toLowerCase();
    return rows.map(toOpportunity).filter((row) => !query || [row.title, row.description, row.subject, row.provider_name].some((value) => value.toLowerCase().includes(query)));
  },

  async upsertOpportunity(input: Partial<Opportunity>): Promise<Opportunity> {
    const result = await invoke<{ id: string; embedded: boolean }>('upsert-opportunity', input);
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', result.id).single();
    if (error) throw error;
    return toOpportunity(data as DbOpportunity);
  },

  async getRecommendedOpportunities(learnerId: string): Promise<Opportunity[]> {
    const matches = await invoke<Array<{ opportunity_id: string; title: string; score: number }>>('match-opportunities', { learner_id: learnerId, top_k: 5 });
    if (!matches.length) return [];
    const { data, error } = await supabase.from('opportunities').select('*').in('id', matches.map((match) => match.opportunity_id));
    if (error) throw error;
    const byId = new Map<string, DbOpportunity>((data ?? []).map((row) => [(row as DbOpportunity).id, row as DbOpportunity]));
    return matches.flatMap((match) => {
      const row = byId.get(match.opportunity_id);
      return row ? [{ ...toOpportunity(row), match_score: match.score }] : [];
    });
  },
  async embedLearnerProfile(learnerId: string): Promise<void> { await invoke<{ embedded: boolean }>('embed-learner-profile', { learner_id: learnerId }); },
  async embedProviderProfile(providerId: string): Promise<void> { await invoke<{ embedded: boolean }>('embed-provider-profile', { provider_id: providerId }); },
  async updateLearnerProfile(userId: string, input: { education_level?: string; interests?: string[]; subjects?: string[]; location?: string; learning_goals?: string; budget_max?: number; availability?: string }): Promise<void> {
    const { error } = await supabase.from('learner_profiles').upsert({ user_id: userId, ...input, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async askRAGAssistant(question: string, learnerId?: string): Promise<RAGResponse> {
    try {
      const response = await invoke<Omit<RAGResponse, 'confidence'>>('rag-ask', { question, learner_id: learnerId ?? null });
      return { ...response, confidence: response.sources.length ? 'high' : 'low' };
    } catch (e) {
      console.warn('rag-ask invoke failed, executing client-side Knowledge Base fallback:', e);
      const terms = question.trim().toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter((w) => w.length > 2);
      let query = supabase.from('knowledge_base').select('id, title, category, content, source_url').eq('status', 'verified');
      if (terms.length > 0) {
        const filters = terms.map((w) => `title.ilike.%${w}%,content.ilike.%${w}%,category.ilike.%${w}%`).join(',');
        query = query.or(filters);
      }
      let { data } = await query.limit(5);
      if (!data || data.length === 0) {
        const { data: allVerified } = await supabase.from('knowledge_base').select('id, title, category, content, source_url').eq('status', 'verified').limit(5);
        data = allVerified ?? [];
      }
      const hits = data ?? [];
      return {
        answer: hits.length > 0
          ? `### 🔍 Student Situation & Problem Analysis\nThe student is seeking information regarding "${question}". We retrieved ${hits.length} verified knowledge base record(s) from our database.\n\n### 📚 Knowledge Base Answer & Solutions\n${hits.map((h) => `**[${h.category.toUpperCase()}] ${h.title}**\n${h.content}`).join('\n\n')}\n\n### 🛡️ Knowledge Base Verification Check\nVerified from official Knowledge Base records.`
          : `### 🔍 Student Situation & Problem Analysis\nThe student asked: "${question}".\n\n### 📚 Knowledge Base Answer & Solutions\nNo matching verified opportunities were found in our knowledge base.\n\n### 🛡️ Knowledge Base Verification Check\nPlease check back later as new verified opportunities are added.`,
        sources: hits.map((h) => ({ id: h.id, title: h.title, category: h.category, source_url: h.source_url })),
        confidence: hits.length ? 'high' : 'low',
        cached: false,
      };
    }
  },

  async getBookings(learnerId?: string): Promise<Booking[]> {
    let query = supabase.from('bookings').select('*, opportunities(title,type,price,provider_id), learner:users!bookings_learner_id_fkey(full_name)').order('requested_at', { ascending: false });
    if (learnerId) query = query.eq('learner_id', learnerId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => {
      const opportunity = row.opportunities as Record<string, unknown> | null;
      const learner = row.learner as { full_name?: string } | null;
      return { ...row, opportunity_title: opportunity?.title ?? 'Opportunity', opportunity_type: opportunity?.type ?? 'COURSE', provider_id: opportunity?.provider_id ?? '', provider_name: 'Provider', price: Number(opportunity?.price ?? 0), learner_name: learner?.full_name ?? 'Learner', date: row.requested_at, created_at: row.requested_at } as Booking;
    });
  },

  async getProviderOpportunities(providerId: string): Promise<Opportunity[]> {
    const { data, error } = await supabase.from('opportunities').select('*').eq('provider_id', providerId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => toOpportunity(row as DbOpportunity));
  },

  async updateProviderProfile(userId: string, input: { bio?: string; university?: string; faculty?: string; skills?: string[]; subjects?: string[]; expertise_areas?: string[]; location?: string; availability?: string }): Promise<void> {
    const { error } = await supabase.from('provider_profiles').upsert({ user_id: userId, ...input, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async createBooking(opportunityId: string): Promise<Booking> {
    const result = await invoke<{ booking_id: string; status: Booking['status'] }>('create-booking', { opportunity_id: opportunityId });
    return { id: result.booking_id, opportunity_id: opportunityId, status: result.status, opportunity_title: 'Opportunity', opportunity_type: 'COURSE', provider_id: '', provider_name: 'Provider', learner_id: '', learner_name: 'You', price: 0, date: new Date().toISOString(), created_at: new Date().toISOString() };
  },

  async respondBooking(bookingId: string, decision: 'accepted' | 'rejected'): Promise<Booking> {
    const result = await invoke<{ booking_id: string; status: Booking['status'] }>('respond-booking', { booking_id: bookingId, decision });
    return { id: result.booking_id, status: result.status } as Booking;
  },

  async getSponsorships(): Promise<Sponsorship[]> {
    const { data, error } = await supabase.from('sponsorships').select('*, sponsor:users!sponsorships_sponsor_id_fkey(full_name), learner:users!sponsorships_learner_id_fkey(full_name), opportunities(title)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => {
      const sponsor = row.sponsor as { full_name?: string } | null;
      const learner = row.learner as { full_name?: string } | null;
      const opp = row.opportunities as { title?: string } | null;
      return {
        ...row,
        amount: Number(row.amount),
        sponsor_name: sponsor?.full_name ?? 'Sponsor',
        learner_name: learner?.full_name ?? 'Learner',
        opportunity_title: opp?.title ?? 'General ICT Sponsorship',
      } as Sponsorship;
    });
  },
  async createSponsorship(input: { learner_id?: string; opportunity_id?: string; sponsorship_request_id?: string; amount: number }): Promise<Sponsorship> {
    const result = await invoke<{ sponsorship_id: string; status: Sponsorship['status'] }>('create-sponsorship', input);
    return { id: result.sponsorship_id, sponsor_id: '', sponsor_name: 'You', amount: input.amount, status: result.status, created_at: new Date().toISOString() } as Sponsorship;
  },
  async createSponsorshipRequest(input: { title: string; reason: string; amount_needed: number; opportunity_id?: string }): Promise<void> {
    await invoke('create-sponsorship-request', input);
  },
  async getSponsorshipRequests(): Promise<SponsorshipRequest[]> {
    try {
      return await invoke<SponsorshipRequest[]>('list-sponsorship-requests');
    } catch (e) {
      console.warn('list-sponsorship-requests invoke failed, executing client-side fallback:', e);
      const { data, error } = await supabase.from('sponsorship_requests').select('*, learner_profiles(education_level), users!sponsorship_requests_learner_id_fkey(full_name)').order('created_at', { ascending: false });
      if (error) return [];
      return (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        learner_name: (row.users as { full_name?: string } | null)?.full_name ?? 'Learner',
        education_level: (row.learner_profiles as { education_level?: string } | null)?.education_level ?? 'Not specified',
      } as SponsorshipRequest));
    }
  },

  async getProviders(): Promise<ProviderProfileData[]> {
    const { data, error } = await supabase.from('provider_profiles').select('*, users(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({ id: row.user_id, user_id: row.user_id, organization_name: (row.users as { full_name?: string } | null)?.full_name ?? 'Provider', bio: row.bio as string | undefined, verification_status: row.status } as ProviderProfileData));
  },
  async verifyProvider(providerId: string, decision: 'verified' | 'rejected'): Promise<ProviderProfileData> {
    const result = await invoke<{ provider_id: string; status: ProviderProfileData['verification_status'] }>('admin-verify-provider', { provider_id: providerId, decision });
    return { id: result.provider_id, user_id: result.provider_id, organization_name: 'Provider', verification_status: result.status };
  },
  async getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    const { data, error } = await supabase.from('knowledge_base').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as KnowledgeBaseEntry[];
  },
  async upsertKnowledgeBaseEntry(input: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
    const result = await invoke<{ id: string }>('admin-upsert-knowledge', input);
    const { data, error } = await supabase.from('knowledge_base').select('*').eq('id', result.id).single();
    if (error) throw error;
    return data as KnowledgeBaseEntry;
  },
  async indexVerifiedKnowledge(): Promise<{ indexed: number; skipped: number; failed: number; processed: number }> {
    return invoke('admin-index-knowledge', {});
  },
  async toggleKnowledgeStatus(entry: KnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    return this.upsertKnowledgeBaseEntry({ ...entry, status: entry.status === 'verified' ? 'draft' : 'verified' });
  },
  async getImpactSummary(): Promise<ImpactMetrics> { return invoke<ImpactMetrics>('impact-summary'); },
  async getAdminOpportunities(): Promise<Opportunity[]> {
    const rows = await invoke<DbOpportunity[]>('admin-list-opportunities');
    return rows.map(toOpportunity);
  },
  async moderateOpportunity(opportunityId: string, status: 'draft' | 'active' | 'closed'): Promise<void> {
    await invoke('admin-moderate-opportunity', { opportunity_id: opportunityId, status });
  },
};

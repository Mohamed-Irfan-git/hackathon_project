import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import type { Booking, Conversation, DirectMessage, ImpactMetrics, KnowledgeBaseEntry, Opportunity, ProviderProfileData, RAGResponse, Sponsorship, SponsorshipRequest } from '../types';


type DbOpportunity = Omit<Opportunity, 'provider_name' | 'provider_verified'> & { provider_name?: string; provider_verified?: boolean };
const toOpportunity = (row: DbOpportunity & { video_url?: string }): Opportunity => ({
  ...row,
  provider_name: row.provider_name ?? 'Verified provider',
  provider_verified: row.provider_verified ?? true,
  description: row.description ?? '', subject: row.subject ?? 'General', target_level: row.target_level ?? 'All levels',
  price: Number(row.price ?? 0), delivery_mode: row.delivery_mode ?? 'online', duration: row.duration ?? 'Flexible',
  video_url: row.video_url || undefined,
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

async function enrichOpportunityProviderNames(opps: Opportunity[]): Promise<Opportunity[]> {
  if (!opps || !opps.length) return [];
  const providerIds = Array.from(new Set(opps.map((o) => o.provider_id).filter(Boolean)));
  if (!providerIds.length) return opps;

  try {
    const { data: usersList } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', providerIds);

    const { data: profiles } = await supabase
      .from('provider_profiles')
      .select('user_id, university, bio')
      .in('user_id', providerIds);

    const nameMap: Record<string, { name?: string; university?: string; bio?: string }> = {};

    if (usersList) {
      usersList.forEach((u) => {
        let name = '';
        if (u.full_name && u.full_name !== 'Provider' && u.full_name !== 'Learner' && u.full_name !== 'University Provider' && u.full_name !== 'Verified provider') {
          name = u.full_name;
        } else if (u.email) {
          const prefix = u.email.split('@')[0];
          name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        nameMap[u.id] = { name };
      });
    }

    if (profiles) {
      profiles.forEach((p) => {
        if (!nameMap[p.user_id]) nameMap[p.user_id] = {};
        if (p.university) {
          nameMap[p.user_id].university = p.university;
          if (!nameMap[p.user_id].name) {
            nameMap[p.user_id].name = p.university;
          }
        }
        if (p.bio) nameMap[p.user_id].bio = p.bio;
      });
    }

    return opps.map((o) => {
      const info = nameMap[o.provider_id];
      const name = (info?.name && info.name !== 'Verified provider' && info.name !== 'Provider')
        ? info.name
        : (o.provider_name && o.provider_name !== 'Verified provider' && o.provider_name !== 'Provider' ? o.provider_name : 'University Provider');
      return {
        ...o,
        provider_name: name,
        provider_university: info?.university || o.provider_university,
        provider_bio: info?.bio || o.provider_bio,
      };
    });
  } catch (e) {
    console.warn('enrichOpportunityProviderNames failed:', e);
    return opps;
  }
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
    const parsed = rows.map(toOpportunity).filter((row) => !query || [row.title, row.description, row.subject, row.provider_name].some((value) => value.toLowerCase().includes(query)));
    return await enrichOpportunityProviderNames(parsed);
  },

  async upsertOpportunity(input: Partial<Opportunity>): Promise<Opportunity> {
    const result = await invoke<{ id: string; embedded: boolean }>('upsert-opportunity', input);
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', result.id).single();
    if (error) throw error;
    const opp = toOpportunity(data as DbOpportunity);
    const enriched = await enrichOpportunityProviderNames([opp]);
    return enriched[0] || opp;
  },

  async getRecommendedOpportunities(learnerId: string): Promise<Opportunity[]> {
    const matches = await invoke<Array<{ opportunity_id: string; title: string; score: number }>>('match-opportunities', { learner_id: learnerId, top_k: 5 });
    if (!matches.length) return [];
    const { data, error } = await supabase.from('opportunities').select('*').in('id', matches.map((match) => match.opportunity_id));
    if (error) throw error;
    const byId = new Map<string, DbOpportunity>((data ?? []).map((row) => [(row as DbOpportunity).id, row as DbOpportunity]));
    const matchedOpps = matches.flatMap((match) => {
      const row = byId.get(match.opportunity_id);
      return row ? [{ ...toOpportunity(row), match_score: match.score }] : [];
    });
    return await enrichOpportunityProviderNames(matchedOpps);
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
    let query = supabase.from('bookings').select('*, opportunities(title,type,price,provider_id, provider:users!opportunities_provider_id_fkey(full_name)), learner:users!bookings_learner_id_fkey(full_name)').order('requested_at', { ascending: false });
    if (learnerId) query = query.eq('learner_id', learnerId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => {
      const opportunity = row.opportunities as Record<string, unknown> | null;
      const providerUser = opportunity?.provider as { full_name?: string } | null;
      const learner = row.learner as { full_name?: string } | null;
      return {
        ...row,
        opportunity_title: opportunity?.title ?? 'Opportunity',
        opportunity_type: opportunity?.type ?? 'COURSE',
        provider_id: opportunity?.provider_id ?? '',
        provider_name: providerUser?.full_name ?? 'Verified Provider',
        price: Number(opportunity?.price ?? 0),
        learner_name: learner?.full_name ?? 'Learner',
        date: row.requested_at,
        created_at: row.requested_at,
      } as Booking;
    });
  },

  async getProviderOpportunities(providerId: string): Promise<Opportunity[]> {
    const { data, error } = await supabase.from('opportunities').select('*').eq('provider_id', providerId).order('created_at', { ascending: false });
    if (error) throw error;
    const opps = (data ?? []).map((row) => toOpportunity(row as DbOpportunity));
    return await enrichOpportunityProviderNames(opps);
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

  async getConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseConfigured || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, opportunity:opportunities(title)')
        .or(`learner_id.eq.${userId},provider_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const convIds = data.map((c: { id: string }) => c.id);
      const allUserIds = Array.from(new Set(data.flatMap((c: { learner_id: string; provider_id: string }) => [c.learner_id, c.provider_id])));

      let userNameMap: Record<string, string> = {};
      if (allUserIds.length > 0) {
        const { data: usersList } = await supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', allUserIds);

        if (usersList) {
          usersList.forEach((u) => {
            if (u.full_name && u.full_name !== 'Provider' && u.full_name !== 'Learner' && u.full_name !== 'University Provider') {
              userNameMap[u.id] = u.full_name;
            } else if (u.email) {
              const prefix = u.email.split('@')[0];
              userNameMap[u.id] = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            }
          });
        }

        const { data: profiles } = await supabase
          .from('provider_profiles')
          .select('user_id, university')
          .in('user_id', allUserIds);

        if (profiles) {
          profiles.forEach((p) => {
            if (p.university && (!userNameMap[p.user_id] || userNameMap[p.user_id] === 'University Provider')) {
              userNameMap[p.user_id] = p.university;
            }
          });
        }
      }

      let unreadMap: Record<string, number> = {};
      if (convIds.length > 0) {
        const { data: unreadData } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('is_read', false)
          .neq('sender_id', userId);

        if (unreadData) {
          unreadMap = unreadData.reduce((acc: Record<string, number>, msg: { conversation_id: string }) => {
            acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
            return acc;
          }, {});
        }
      }

      return data.map((row: Record<string, unknown>) => {
        const opp = row.opportunity as { title?: string } | null;
        const lId = row.learner_id as string;
        const pId = row.provider_id as string;

        const lName = userNameMap[lId] || 'Learner User';
        const pName = userNameMap[pId] || 'Verified Provider';

        return {
          id: row.id as string,
          learner_id: lId,
          learner_name: lName,
          provider_id: pId,
          provider_name: pName,
          opportunity_id: row.opportunity_id as string | undefined,
          opportunity_title: opp?.title,
          booking_id: row.booking_id as string | undefined,
          last_message: row.last_message as string | undefined,
          last_message_at: row.last_message_at as string,
          unread_count: unreadMap[row.id as string] || 0,
          created_at: row.created_at as string,
          updated_at: row.updated_at as string,
        };
      });
    } catch (e) {
      console.warn('Error fetching conversations:', e);
      return [];
    }
  },

  async getOrCreateConversation(
    learnerId: string,
    providerId: string,
    opportunityId?: string,
    bookingId?: string
  ): Promise<Conversation> {
    let query = supabase
      .from('conversations')
      .select('*, opportunity:opportunities(title)')
      .eq('learner_id', learnerId)
      .eq('provider_id', providerId);

    if (opportunityId) {
      query = query.eq('opportunity_id', opportunityId);
    }

    const { data: existing } = await query.maybeSingle();

    const { data: usersList } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', [learnerId, providerId]);

    const { data: prof } = await supabase
      .from('provider_profiles')
      .select('university')
      .eq('user_id', providerId)
      .maybeSingle();

    const userMap: Record<string, string> = {};
    if (usersList) {
      usersList.forEach((u) => {
        if (u.full_name && u.full_name !== 'Provider' && u.full_name !== 'Learner' && u.full_name !== 'University Provider') {
          userMap[u.id] = u.full_name;
        } else if (u.email) {
          const prefix = u.email.split('@')[0];
          userMap[u.id] = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      });
    }

    if (prof?.university && (!userMap[providerId] || userMap[providerId] === 'University Provider')) {
      userMap[providerId] = prof.university;
    }

    const lName = userMap[learnerId] || 'Learner User';
    const pName = userMap[providerId] || 'Verified Provider';

    if (existing) {
      const opp = existing.opportunity as { title?: string } | null;
      return {
        id: existing.id,
        learner_id: existing.learner_id,
        learner_name: lName,
        provider_id: existing.provider_id,
        provider_name: pName,
        opportunity_id: existing.opportunity_id,
        opportunity_title: opp?.title,
        booking_id: existing.booking_id,
        last_message: existing.last_message,
        last_message_at: existing.last_message_at,
        created_at: existing.created_at,
        updated_at: existing.updated_at,
      };
    }

    const { data: newRow, error } = await supabase
      .from('conversations')
      .insert({
        learner_id: learnerId,
        provider_id: providerId,
        opportunity_id: opportunityId || null,
        booking_id: bookingId || null,
      })
      .select('*, opportunity:opportunities(title)')
      .single();

    if (error) throw error;
    const opp = newRow.opportunity as { title?: string } | null;

    return {
      id: newRow.id,
      learner_id: newRow.learner_id,
      learner_name: lName,
      provider_id: newRow.provider_id,
      provider_name: pName,
      opportunity_id: newRow.opportunity_id,
      opportunity_title: opp?.title,
      booking_id: newRow.booking_id,
      last_message: newRow.last_message,
      last_message_at: newRow.last_message_at,
      created_at: newRow.created_at,
      updated_at: newRow.updated_at,
    };
  },

  async getMessages(conversationId: string): Promise<DirectMessage[]> {
    if (!isSupabaseConfigured || !conversationId) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(full_name)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => {
      const sender = row.sender as { full_name?: string } | null;
      return {
        id: row.id as string,
        conversation_id: row.conversation_id as string,
        sender_id: row.sender_id as string,
        sender_name: sender?.full_name ?? 'User',
        content: row.content as string,
        is_read: Boolean(row.is_read),
        created_at: row.created_at as string,
      };
    });
  },

  async sendMessage(input: {
    conversationId?: string;
    recipientId?: string;
    opportunityId?: string;
    bookingId?: string;
    content: string;
  }): Promise<DirectMessage> {
    try {
      const result = await invoke<{ conversation_id: string; message: Record<string, unknown> }>(
        'send-message',
        {
          conversation_id: input.conversationId,
          recipient_id: input.recipientId,
          opportunity_id: input.opportunityId,
          booking_id: input.bookingId,
          content: input.content,
        }
      );
      return {
        id: result.message.id as string,
        conversation_id: (result.conversation_id || result.message.conversation_id) as string,
        sender_id: result.message.sender_id as string,
        content: result.message.content as string,
        is_read: false,
        created_at: result.message.created_at as string,
      };
    } catch (e) {
      console.warn('send-message invoke fallback to client-side insert:', e);
      if (!input.conversationId) throw new Error('Conversation ID required for fallback send');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Unauthenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: input.conversationId,
          sender_id: user.user.id,
          content: input.content.trim(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return {
        id: data.id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        content: data.content,
        is_read: false,
        created_at: data.created_at,
      };
    }
  },

  async markMessagesRead(conversationId: string, currentUserId: string): Promise<void> {
    if (!isSupabaseConfigured || !conversationId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .eq('is_read', false);
  },

  async uploadOpportunityImage(file: File): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `opportunities/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('opportunity-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('opportunity-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};



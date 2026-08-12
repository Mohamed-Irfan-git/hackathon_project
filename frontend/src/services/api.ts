import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  Opportunity,
  Booking,
  Sponsorship,
  SponsorshipRequest,
  KnowledgeBaseEntry,
  ImpactMetrics,
  RAGResponse,
  ProviderProfileData,
} from '../types';
import {
  MOCK_OPPORTUNITIES,
  MOCK_BOOKINGS,
  MOCK_SPONSORSHIPS,
  MOCK_SPONSORSHIP_REQUESTS,
  MOCK_KNOWLEDGE_BASE,
  MOCK_IMPACT_METRICS,
  MOCK_PROVIDERS,
} from './mockData';

// Local state memory store so UI actions reflect dynamically during demo
let opportunitiesStore: Opportunity[] = [...MOCK_OPPORTUNITIES];
let bookingsStore: Booking[] = [...MOCK_BOOKINGS];
let sponsorshipsStore: Sponsorship[] = [...MOCK_SPONSORSHIPS];
let sponsorshipRequestsStore: SponsorshipRequest[] = [...MOCK_SPONSORSHIP_REQUESTS];
let knowledgeBaseStore: KnowledgeBaseEntry[] = [...MOCK_KNOWLEDGE_BASE];
let providersStore: ProviderProfileData[] = [...MOCK_PROVIDERS];
let impactMetricsStore: ImpactMetrics = { ...MOCK_IMPACT_METRICS };

export const api = {
  // --- OPPORTUNITIES ---
  async getOpportunities(filters?: {
    subject?: string;
    level?: string;
    budget_max?: number;
    location?: string;
    search?: string;
  }): Promise<Opportunity[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('opportunities').select('*');
        if (filters?.subject) query = query.ilike('subject', `%${filters.subject}%`);
        if (filters?.level) query = query.ilike('target_level', `%${filters.level}%`);
        if (filters?.budget_max) query = query.lte('price', filters.budget_max);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Opportunity[];
      } catch (err) {
        console.warn('Supabase fetch failed, using mock data:', err);
      }
    }

    let results = [...opportunitiesStore];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.subject.toLowerCase().includes(q) ||
          o.provider_name.toLowerCase().includes(q)
      );
    }

    if (filters?.subject && filters.subject !== 'all') {
      results = results.filter((o) => o.subject.toLowerCase() === filters.subject!.toLowerCase());
    }

    if (filters?.level && filters.level !== 'all') {
      results = results.filter((o) => o.target_level.toLowerCase().includes(filters.level!.toLowerCase()));
    }

    if (filters?.budget_max !== undefined && filters.budget_max > 0) {
      results = results.filter((o) => o.price <= filters.budget_max!);
    }

    return results;
  },

  async upsertOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/functions/v1/upsert-opportunity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.data) return json.data;
      } catch (e) {
        console.warn('Edge function upsert failed, updating mock store:', e);
      }
    }

    if (data.id) {
      opportunitiesStore = opportunitiesStore.map((o) => (o.id === data.id ? { ...o, ...data } : o));
      return opportunitiesStore.find((o) => o.id === data.id)!;
    }

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      provider_id: data.provider_id || 'prov-1',
      provider_name: data.provider_name || 'DevAcademy Sri Lanka',
      provider_verified: true,
      title: data.title || 'Untitled Opportunity',
      type: data.type || 'COURSE',
      description: data.description || '',
      subject: data.subject || 'General ICT',
      target_level: data.target_level || 'All Levels',
      price: Number(data.price) || 0,
      delivery_mode: data.delivery_mode || 'online',
      location: data.location || 'Online',
      duration: data.duration || 'Flexible',
      status: data.status || 'active',
      created_at: new Date().toISOString(),
    };

    opportunitiesStore = [newOpp, ...opportunitiesStore];
    impactMetricsStore.opportunities_count += 1;
    return newOpp;
  },

  async getRecommendedOpportunities(learnerId: string): Promise<Opportunity[]> {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/functions/v1/match-opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learner_id: learnerId, top_k: 5 }),
        });
        const json = await res.json();
        if (json.data) return json.data;
      } catch (e) {
        console.warn('Matching edge function failed:', e);
      }
    }

    // Return mock opportunities sorted by match_score
    return opportunitiesStore
      .filter((o) => o.status === 'active')
      .slice(0, 4)
      .map((o, idx) => ({
        ...o,
        match_score: o.match_score || Number((0.95 - idx * 0.05).toFixed(2)),
      }));
  },

  // --- RAG ASSISTANT ---
  async askRAGAssistant(question: string): Promise<RAGResponse> {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/functions/v1/rag-ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });
        const json = await res.json();
        if (json.data) return json.data;
      } catch (e) {
        console.warn('RAG edge function failed:', e);
      }
    }

    const qLower = question.toLowerCase();
    const verifiedKB = knowledgeBaseStore.filter((kb) => kb.status === 'verified');

    const matchedKB = verifiedKB.filter(
      (kb) =>
        kb.title.toLowerCase().includes(qLower) ||
        kb.content.toLowerCase().includes(qLower) ||
        qLower.split(' ').some((word) => word.length > 3 && kb.content.toLowerCase().includes(word))
    );

    if (matchedKB.length === 0) {
      return {
        answer: `I searched our verified educational knowledge base for: "${question}". Currently, no exact matching scholarships or opportunities were found in our database. You can request a personalized sponsorship or explore our available ICT courses.`,
        sources: [],
        confidence: 'low',
      };
    }

    const sources = matchedKB.slice(0, 3).map((kb) => ({
      id: kb.id,
      title: kb.title,
      category: kb.category,
      source_url: kb.source_url,
      snippet: kb.content.substring(0, 140) + '...',
    }));

    const answer = `Based on our verified knowledge base, here is what we found regarding your query:\n\n` +
      matchedKB.map((kb) => `• **${kb.title}** (${kb.category.toUpperCase()}): ${kb.content}`).join('\n\n') +
      `\n\nThese verified programs are designed to assist Sri Lankan students with tuition, practical coding experience, and industry placements.`;

    return {
      answer,
      sources,
      confidence: 'high',
    };
  },

  // --- BOOKINGS ---
  async getBookings(learnerId?: string, providerId?: string): Promise<Booking[]> {
    if (learnerId) {
      return bookingsStore.filter((b) => b.learner_id === learnerId);
    }
    if (providerId) {
      return bookingsStore.filter((b) => b.provider_id === providerId);
    }
    return bookingsStore;
  },

  async createBooking(opportunityId: string, learnerName = 'Kamal Perera'): Promise<Booking> {
    const opp = opportunitiesStore.find((o) => o.id === opportunityId) || opportunitiesStore[0];

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      opportunity_id: opp.id,
      opportunity_title: opp.title,
      opportunity_type: opp.type,
      provider_id: opp.provider_id,
      provider_name: opp.provider_name,
      learner_id: 'learner-101',
      learner_name: learnerName,
      status: 'pending',
      price: opp.price,
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    bookingsStore = [newBooking, ...bookingsStore];
    impactMetricsStore.total_bookings += 1;
    return newBooking;
  },

  async respondBooking(bookingId: string, decision: 'accepted' | 'rejected'): Promise<Booking> {
    bookingsStore = bookingsStore.map((b) => (b.id === bookingId ? { ...b, status: decision } : b));
    return bookingsStore.find((b) => b.id === bookingId)!;
  },

  // --- SPONSORSHIPS ---
  async getSponsorships(): Promise<Sponsorship[]> {
    return sponsorshipsStore;
  },

  async getSponsorshipRequests(): Promise<SponsorshipRequest[]> {
    return sponsorshipRequestsStore;
  },

  async createSponsorship(data: {
    learner_id?: string;
    learner_name?: string;
    opportunity_id?: string;
    opportunity_title?: string;
    amount: number;
    note?: string;
  }): Promise<Sponsorship> {
    const newSponsorship: Sponsorship = {
      id: `sp-${Date.now()}`,
      sponsor_id: 'spon-1',
      sponsor_name: 'SLASSCOM Educational Fund',
      learner_id: data.learner_id,
      learner_name: data.learner_name || 'Kamal Perera',
      opportunity_id: data.opportunity_id,
      opportunity_title: data.opportunity_title,
      amount: Number(data.amount),
      status: 'pledged',
      note: data.note || 'Sponsorship pledge confirmed.',
      created_at: new Date().toISOString(),
    };

    sponsorshipsStore = [newSponsorship, ...sponsorshipsStore];
    impactMetricsStore.sponsorship_amount += Number(data.amount);
    impactMetricsStore.sponsored_learners += 1;
    return newSponsorship;
  },

  // --- PROVIDERS ---
  async getProviders(): Promise<ProviderProfileData[]> {
    return providersStore;
  },

  async verifyProvider(providerId: string, decision: 'verified' | 'rejected'): Promise<ProviderProfileData> {
    providersStore = providersStore.map((p) => (p.id === providerId ? { ...p, verification_status: decision } : p));
    return providersStore.find((p) => p.id === providerId)!;
  },

  // --- KNOWLEDGE BASE (ADMIN RAG) ---
  async getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
    return knowledgeBaseStore;
  },

  async upsertKnowledgeBaseEntry(data: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
    if (data.id) {
      knowledgeBaseStore = knowledgeBaseStore.map((kb) => (kb.id === data.id ? { ...kb, ...data } as KnowledgeBaseEntry : kb));
      return knowledgeBaseStore.find((kb) => kb.id === data.id)!;
    }

    const newKb: KnowledgeBaseEntry = {
      id: `kb-${Date.now()}`,
      category: data.category || 'scholarship',
      title: data.title || 'Untitled Entry',
      content: data.content || '',
      source_url: data.source_url,
      status: data.status || 'draft',
      created_at: new Date().toISOString(),
    };

    knowledgeBaseStore = [newKb, ...knowledgeBaseStore];
    return newKb;
  },

  async toggleKnowledgeStatus(id: string): Promise<KnowledgeBaseEntry> {
    knowledgeBaseStore = knowledgeBaseStore.map((kb) => {
      if (kb.id === id) {
        return {
          ...kb,
          status: kb.status === 'verified' ? 'draft' : 'verified',
        };
      }
      return kb;
    });
    return knowledgeBaseStore.find((kb) => kb.id === id)!;
  },

  // --- IMPACT METRICS ---
  async getImpactSummary(): Promise<ImpactMetrics> {
    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/functions/v1/impact-summary');
        const json = await res.json();
        if (json.data) return json.data;
      } catch (e) {
        console.warn('Impact summary endpoint failed:', e);
      }
    }
    return impactMetricsStore;
  },
};

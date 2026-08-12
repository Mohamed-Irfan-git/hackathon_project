export type UserRole = 'learner' | 'provider' | 'sponsor' | 'admin' | 'public';

export type OpportunityType = 'TUITION' | 'COURSE' | 'WORKSHOP' | 'MENTORSHIP' | 'MOCK_INTERVIEW';

export type DeliveryMode = 'online' | 'in-person';

export type OpportunityStatus = 'draft' | 'active' | 'closed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type SponsorshipStatus = 'pending' | 'pledged' | 'completed' | 'cancelled';

export type KnowledgeCategory = 'scholarship' | 'internship' | 'course' | 'workshop' | 'competition' | 'career_opportunity';

export type KnowledgeStatus = 'draft' | 'verified';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  verification_status?: VerificationStatus;
  created_at: string;
}

export interface LearnerProfileData {
  id: string;
  user_id: string;
  full_name: string;
  education_level?: string;
  field_of_interest?: string;
  preferred_language?: string;
  budget_max?: number;
  location?: string;
  bio?: string;
}

export interface ProviderProfileData {
  id: string;
  user_id: string;
  organization_name: string;
  bio?: string;
  website_url?: string;
  verification_status: VerificationStatus;
  credentials_url?: string;
  rating?: number;
  total_students?: number;
  sessions_completed?: number;
}

export interface Opportunity {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_verified: boolean;
  title: string;
  type: OpportunityType;
  description: string;
  subject: string;
  target_level: string;
  price: number;
  delivery_mode: DeliveryMode;
  location?: string;
  duration: string;
  status: OpportunityStatus;
  match_score?: number; // 0..1 AI match score
  match_reasons?: string[];
  created_at: string;
}

export interface Booking {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_type: OpportunityType;
  provider_id: string;
  provider_name: string;
  learner_id: string;
  learner_name: string;
  status: BookingStatus;
  price: number;
  date: string;
  created_at: string;
}

export interface Sponsorship {
  id: string;
  sponsor_id: string;
  sponsor_name: string;
  learner_id?: string;
  learner_name?: string;
  opportunity_id?: string;
  opportunity_title?: string;
  amount: number;
  status: SponsorshipStatus;
  note?: string;
  created_at: string;
}

export interface SponsorshipRequest {
  id: string;
  learner_id: string;
  learner_name: string;
  education_level: string;
  title: string;
  reason: string;
  amount_needed: number;
  amount_raised: number;
  created_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  source_url?: string;
  status: KnowledgeStatus;
  created_at: string;
}

export interface ImpactMetrics {
  active_providers: number;
  learners_supported: number;
  total_bookings: number;
  sponsored_learners: number;
  sponsorship_amount: number;
  opportunities_count: number;
}

export interface RAGSource {
  id: string;
  title: string;
  category: KnowledgeCategory;
  source_url?: string;
  snippet?: string;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: RAGSource[];
  timestamp: string;
}

# UI Design

## 1. Overview

The UI is a React + TypeScript single-page application styled with Tailwind CSS (if in use), designed around four role-based experiences (Learner, Provider, Sponsor, Admin) sharing a common shell.

Design priorities for the MVP:

- Clarity over decoration — judges and demo users should understand each screen in seconds.
- Consistent patterns across roles (same card, form, and list components reused).
- Mobile-usable but desktop-first for the demo.

---

## 2. Design Language

- **Layout:** Left sidebar nav (role-aware) + top bar + main content area. Collapses to bottom/hamburger nav on mobile.
- **Typography:** One clear heading scale (H1/H2/H3), generous line height for readability.
- **Color:** One primary brand color, one accent (used sparingly for AI-related elements to visually distinguish "AI-powered" moments), neutral grays for structure, semantic colors for status (pending/accepted/rejected/verified).
- **Components:** Cards (opportunity card, provider card, sponsorship card), badges (status, verified), forms, modals, tables (admin only), empty states, loading skeletons.
- **AI moments:** Anywhere AI is involved (match results, RAG answers) gets a small consistent visual marker (icon + label, e.g. "AI Match" / "AI Assistant") so it's never ambiguous to the user when AI produced something.

---

## 3. Navigation Structure

### 3.1 Public / unauthenticated

- Landing page (value proposition, challenge context, CTA to sign up)
- Login
- Register (role selection: Learner / Provider / Sponsor)

### 3.2 Learner

- Dashboard (recommended matches, upcoming bookings, quick RAG assistant entry)
- Discover / Search (browse + filter opportunities)
- Opportunity detail (provider info, price, book/enroll)
- My Bookings (status list)
- RAG Assistant (chat-style Q&A with source citations)
- Sponsorship (request/view sponsorship status)
- Profile

### 3.3 Provider

- Dashboard (my opportunities, pending bookings, basic earnings/impact)
- My Opportunities (create/edit/list)
- Opportunity form (create/update)
- Booking requests (accept/reject)
- Profile (verification status shown clearly)

### 3.4 Sponsor

- Dashboard (my sponsorships, total contributed)
- Browse sponsorship requests
- Create sponsorship
- Sponsorship history

### 3.5 Admin

- Dashboard (platform impact metrics)
- Users (list, role management)
- Provider verification queue
- Opportunities (moderation)
- Knowledge base management (add/edit/verify entries for RAG)
- Sponsorships (oversight)

---

## 4. Key Screens (detail)

### 4.1 Landing Page

- Hero: one-line value proposition + tagline
- Problem framing (short, 2–3 stat highlights max)
- How it works (3-step visual: Learn / Prepare / Discover)
- CTA: "Get Started" → role-aware signup

### 4.2 Learner Dashboard

- "Recommended for you" — AI match results as opportunity cards, each tagged "AI Match" with a similarity/relevance indicator (avoid raw scores like "0.87"; use simple labels like "Strong match")
- Upcoming bookings (compact list)
- RAG Assistant entry point (prominent, e.g. a search-bar-style input: "Ask about scholarships, internships, courses...")

### 4.3 RAG Assistant Screen

- Chat-style interface: question in, grounded answer out
- Each answer displays its **sources** as small citation chips (title + category), clickable to see the underlying knowledge base entry
- Empty/low-confidence state: clear message like "No matching opportunities found in our current database" rather than a fabricated answer
- Input placeholder uses the example scenario: "e.g. I'm an A/L student interested in ICT with a limited budget..."

### 4.4 Opportunity Discovery / Search

- Filters: subject, level, budget, delivery mode, location
- Toggle or section split: "AI Recommended" vs "All Opportunities"
- Opportunity card: title, type badge, provider name (+ verified badge), price, delivery mode, short description

### 4.5 Opportunity Detail

- Full description, provider profile summary (with verification badge)
- Price, availability, delivery mode
- Primary CTA: Book / Enroll
- Secondary: "Ask the assistant about this" (deep link into RAG with context)

### 4.6 Provider: Create/Edit Opportunity

- Simple form: title, type (select), subject, target level, price, delivery mode, location, duration, description
- Save as draft / publish (active) toggle
- Note near submit: "This will be used to power AI matching" (transparency about embedding)

### 4.7 Provider Dashboard

- Pending booking requests (accept/reject inline)
- My opportunities list (status badges: draft/active/closed)
- Basic impact strip: sessions completed, learners reached (no fabricated numbers — pulls from real MVP data, can read zero)

### 4.8 Sponsorship Flow

- Browse: list of learners/opportunities eligible for sponsorship (simple cards)
- Create sponsorship: select target, enter amount, confirm (no real payment integration for MVP — a "Pledge" or "Confirm Sponsorship" action that creates the record)
- History: sponsor's past sponsorships with status

### 4.9 Admin: Knowledge Base Management

- Table of entries (category, title, status)
- Add/edit form (category select, title, content, source URL, status)
- "Verify" action to flip draft → verified (only verified entries are retrievable by RAG)

### 4.10 Admin: Impact Dashboard

- Metric tiles: active providers, learners supported, total bookings, sponsored learners, sponsorship amount, opportunities count
- Pulled live from `impact-summary` endpoint

---

## 5. Component Inventory (for build efficiency)

Reusable components to build once, use everywhere:

- `Card` (base) → `OpportunityCard`, `ProviderCard`, `SponsorshipCard`
- `Badge` (status, verified, type)
- `AITag` (small "AI Match" / "AI Assistant" marker with icon)
- `FormField` (label + input/select/textarea wrapper)
- `Modal`
- `Table` (admin only)
- `EmptyState`
- `LoadingSkeleton`
- `ChatBubble` (RAG assistant Q&A)
- `SourceChip` (RAG citation)
- `MetricTile` (impact dashboard)

---

## 6. Accessibility & Responsiveness Notes (MVP-level)

- Sufficient color contrast for status badges (don't rely on color alone — pair with text/icon).
- Forms keyboard-navigable, labeled inputs (not placeholder-only labels).
- Mobile: sidebar collapses to a bottom nav or hamburger; cards stack single-column.
- Loading and empty states present on every list/dashboard view — never leave a blank screen during the demo.

---

## 7. Explicit MVP Cuts (do not build for overnight scope)

- No real payment gateway UI (sponsorship "pledge" only).
- No messaging/chat between users (only RAG assistant chat).
- No notifications system (in-app or email) beyond basic status changes reflected on refresh.
- No multi-language UI (single language for MVP).
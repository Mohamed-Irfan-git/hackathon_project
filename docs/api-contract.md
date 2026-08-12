# API Contract

## 1. Overview

The API is implemented primarily through Supabase (auto-generated REST/PostgREST + client SDK calls) for standard CRUD operations, and Supabase Edge Functions (TypeScript) for custom business logic, AI matching, and the RAG assistant.

Two categories of endpoints:

1. **Supabase table operations** — handled via the Supabase client SDK, governed by RLS policies (see `database.md`). Not custom REST routes; documented here as data operations.
2. **Custom Edge Functions** — explicit HTTPS endpoints for logic that can't be expressed as plain table access (AI matching, RAG, booking workflows, sponsorship workflows).

All Edge Function endpoints require a valid Supabase Auth JWT in the `Authorization: Bearer <token>` header unless marked public.

---

## 2. Conventions

- Base path for Edge Functions: `/functions/v1/`
- Request/response bodies: JSON
- Standard error shape:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

- Standard success shape wraps data:

```json
{
  "data": { }
}
```

---

## 3. Auth & User Management

Handled by Supabase Authentication directly from the frontend client. No custom endpoints required for signup/login/logout.

### 3.1 Complete profile (post-signup)

`POST /functions/v1/complete-profile`

Creates the role-specific profile row after auth signup.

Request:
```json
{
  "role": "learner | provider | sponsor",
  "full_name": "string",
  "profile": { }
}
```

Response:
```json
{ "data": { "user_id": "uuid", "role": "learner" } }
```

---

## 4. Learner Profile

Standard table operations via Supabase client (`learner_profiles`):

- `GET` own profile — `select * from learner_profiles where user_id = auth.uid()`
- `UPDATE` own profile — `update learner_profiles ... where user_id = auth.uid()`

### 4.1 Regenerate profile embedding

`POST /functions/v1/embed-learner-profile`

Triggered after profile update to refresh `profile_embedding`.

Request:
```json
{ "learner_id": "uuid" }
```

Response:
```json
{ "data": { "embedded": true } }
```

---

## 5. Provider Profile

Standard table operations via Supabase client (`provider_profiles`).

### 5.1 Regenerate provider embedding

`POST /functions/v1/embed-provider-profile`

Request:
```json
{ "provider_id": "uuid" }
```

Response:
```json
{ "data": { "embedded": true } }
```

### 5.2 Admin: verify provider

`POST /functions/v1/admin/verify-provider`

Request:
```json
{ "provider_id": "uuid", "decision": "verified | rejected" }
```

Response:
```json
{ "data": { "provider_id": "uuid", "status": "verified" } }
```

---

## 6. Opportunities

Standard table operations via Supabase client (`opportunities`) for create/update/list/delete, scoped by RLS.

### 6.1 Create/update opportunity (with embedding)

`POST /functions/v1/upsert-opportunity`

Wraps table write + embedding generation in one call.

Request:
```json
{
  "id": "uuid | null",
  "title": "string",
  "type": "TUITION | COURSE | WORKSHOP | MENTORSHIP | MOCK_INTERVIEW",
  "description": "string",
  "subject": "string",
  "target_level": "string",
  "price": 0,
  "delivery_mode": "online | in-person",
  "location": "string",
  "duration": "string",
  "status": "draft | active"
}
```

Response:
```json
{ "data": { "id": "uuid", "embedded": true } }
```

### 6.2 List/search opportunities

`GET /functions/v1/search-opportunities?subject=&level=&budget_max=&location=`

Response:
```json
{ "data": [ { "id": "uuid", "title": "string", "type": "COURSE", "price": 0 } ] }
```

---

## 7. AI Matching

### 7.1 Match learner to opportunities

`POST /functions/v1/match-opportunities`

Request:
```json
{ "learner_id": "uuid", "top_k": 5 }
```

Flow: fetch `learner_profiles.profile_embedding` → vector search against `opportunities.embedding` (and/or `provider_profiles.profile_embedding`) → return ranked matches.

Response:
```json
{
  "data": [
    { "opportunity_id": "uuid", "title": "string", "score": 0.87 }
  ]
}
```

---

## 8. RAG Opportunity Assistant

### 8.1 Ask assistant

`POST /functions/v1/rag-ask`

Request:
```json
{ "question": "string", "learner_id": "uuid | null" }
```

Flow: embed question → vector search `knowledge_base` (status = verified) → construct grounded prompt → call LLM API → return answer + sources.

Response:
```json
{
  "data": {
    "answer": "string",
    "sources": [
      { "id": "uuid", "title": "string", "category": "scholarship" }
    ]
  }
}
```

### 8.2 Admin: add/update knowledge base entry

`POST /functions/v1/admin/upsert-knowledge`

Request:
```json
{
  "id": "uuid | null",
  "category": "scholarship | internship | course | workshop | competition | career_opportunity",
  "title": "string",
  "content": "string",
  "source_url": "string | null",
  "status": "draft | verified"
}
```

Response:
```json
{ "data": { "id": "uuid", "embedded": true } }
```

---

## 9. Bookings

### 9.1 Create booking request

`POST /functions/v1/create-booking`

Request:
```json
{ "opportunity_id": "uuid" }
```

Response:
```json
{ "data": { "booking_id": "uuid", "status": "pending" } }
```

### 9.2 Respond to booking (provider)

`POST /functions/v1/respond-booking`

Request:
```json
{ "booking_id": "uuid", "decision": "accepted | rejected" }
```

Response:
```json
{ "data": { "booking_id": "uuid", "status": "accepted" } }
```

### 9.3 List bookings

Standard table operations via Supabase client (`bookings`), scoped by RLS (learner sees own, provider sees bookings on their opportunities).

---

## 10. Sponsorships

### 10.1 Create sponsorship

`POST /functions/v1/create-sponsorship`

Request:
```json
{
  "learner_id": "uuid | null",
  "opportunity_id": "uuid | null",
  "amount": 0
}
```

Response:
```json
{ "data": { "sponsorship_id": "uuid", "status": "pending" } }
```

### 10.2 List sponsorships

Standard table operations via Supabase client (`sponsorships`), scoped by RLS (sponsor sees own records; admin sees all).

---

## 11. Impact Metrics

### 11.1 Get platform impact summary

`GET /functions/v1/impact-summary`

Response:
```json
{
  "data": {
    "active_providers": 0,
    "learners_supported": 0,
    "total_bookings": 0,
    "sponsored_learners": 0,
    "sponsorship_amount": 0,
    "opportunities_count": 0
  }
}
```

Computed live from tables for MVP; can move to `impact_metrics` aggregate table later.

---

## 12. Error Codes

| Code | Meaning |
|---|---|
| `unauthorized` | Missing/invalid auth token |
| `forbidden` | Role/RLS does not permit action |
| `not_found` | Resource does not exist |
| `validation_error` | Request body failed validation |
| `embedding_failed` | Embedding generation error |
| `llm_error` | LLM API call failed |
| `internal_error` | Unhandled server error |

---

## 13. Notes for MVP

- Prefer direct Supabase client table calls wherever RLS alone is sufficient; reserve Edge Functions for embedding, matching, RAG, and multi-step workflows.
- All Edge Functions should validate input with a schema check before touching the database.
- `top_k` and pagination defaults should be small (5–10) to keep the overnight demo fast and predictable.
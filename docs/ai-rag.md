# AI Features: Matching & RAG Opportunity Assistant

## 1. Overview

The platform implements two distinct AI features, both built on the same underlying pattern: **embeddings + `pgvector` similarity search**, executed inside **Supabase Edge Functions**, with an external **LLM API** used only where natural-language generation is actually needed.

1. **AI Tutor/Course Matching** — semantic matching between learners and opportunities/providers.
2. **RAG Opportunity Assistant** — grounded Q&A over a curated knowledge base of scholarships, internships, courses, workshops, competitions, and career opportunities.

Neither feature is a generic chatbot. Matching never calls an LLM at all (pure vector search + ranking). RAG calls an LLM only after retrieval, and only to phrase a grounded answer from retrieved content.

---

## 2. Shared Infrastructure

### 2.1 Embedding generation

A single internal helper (`generateEmbedding(text: string): Promise<number[]>`) wraps the embedding API call and is reused by:

- `embed-learner-profile`
- `embed-provider-profile`
- `upsert-opportunity` (embeds title+description+subject)
- `admin/upsert-knowledge` (embeds title+content)
- `rag-ask` (embeds the incoming question)

Embedding dimension: `1536` (adjust to match the finalized provider/model; must match the `vector(1536)` columns in `database.md`).

### 2.2 Vector search helper

A shared SQL function performs cosine-similarity search:

```sql
create or replace function match_opportunities(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, title text, similarity float)
language sql stable
as $$
  select id, title, 1 - (embedding <=> query_embedding) as similarity
  from opportunities
  where status = 'active'
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

An equivalent `match_knowledge_base(query_embedding, match_count)` function targets `knowledge_base` where `status = 'verified'`.

---

## 3. AI Tutor/Course Matching

### 3.1 Purpose

Given a learner's profile (subjects, level, budget, location, availability, goals), return a ranked list of the most relevant tutors/courses/opportunities — without keyword search or manual filtering alone.

### 3.2 Flow

```text
Learner profile / request
        |
        v
   Embedding (learner_profiles.profile_embedding)
        |
        v
   Vector search (match_opportunities)
        |
        v
   Rank + return top-K matches
```

### 3.3 Matching factors

Embedded into the profile text before vectorization:

- Subject / interest
- Grade / education level
- Budget range
- Location
- Availability
- Skills sought
- Learning goals

### 3.4 Implementation notes

- Matching is **synchronous vector search only** — no LLM call, keeping it fast and cheap for repeated use (every search/browse action can re-run matching).
- Re-embedding happens only when a profile or opportunity is created/updated, not on every match request.
- Optional post-filter (hard constraints like `budget_max` or `delivery_mode`) can be applied in SQL after the vector search narrows candidates, or combined into a single query with a `where` clause alongside the `order by` similarity.

---

## 4. RAG Opportunity Assistant

### 4.1 Purpose

Answer natural-language questions about opportunities (scholarships, internships, courses, workshops, competitions, career paths) using only the platform's **curated, verified knowledge base** — reducing hallucination risk compared to an open LLM query.

### 4.2 Flow

```text
User question
      |
      v
Embed question
      |
      v
Vector search (match_knowledge_base, status = verified)
      |
      v
Construct grounded prompt (question + retrieved chunks)
      |
      v
LLM API call
      |
      v
Grounded answer + cited sources
```

### 4.3 Prompt construction (conceptual)

```text
System: You answer only using the provided context. If the context does not
contain enough information to answer, say so honestly. Do not invent
opportunities, deadlines, or eligibility criteria.

Context:
[retrieved knowledge_base entries]

Question:
[user question]
```

### 4.4 Example

**Question:** "I am an A/L student interested in ICT and I have a limited budget. What opportunities are available to me?"

**Flow output:**
- Retrieval pulls matching `knowledge_base` rows tagged `scholarship`, `course`, `workshop` relevant to ICT + budget constraint.
- LLM synthesizes a short grounded answer referencing only those rows.
- Response includes `sources` array (id, title, category) so the frontend can show citations/links.

### 4.5 Implementation notes

- Only `status = 'verified'` knowledge base rows are retrievable — draft/expired entries are excluded from search (enforced in the SQL function, not just the app layer).
- `top_k` for retrieval kept small (3–5 chunks) to keep prompts short and answers focused for the MVP.
- If retrieval returns no relevant chunks above a similarity threshold, skip the LLM call and return a fixed "no matching opportunities found" response — avoids the LLM inventing an answer from nothing.
- Admin curation (`admin/upsert-knowledge`) is the only way content enters the assistant's knowledge — no live web access, no open-domain answering.

---

## 5. What This Is NOT

- Not a general-purpose chatbot — RAG only answers from the curated knowledge base; matching never uses an LLM.
- Not real-time scraped data — all knowledge base content is manually curated/verified by an admin.
- Not personalized beyond profile fields already captured — no hidden inference about users beyond what they explicitly provided.

---

## 6. MVP Scope

For the overnight build, both features should demonstrate the full pipeline end-to-end with a small seeded dataset:

- A handful of seeded `provider_profiles` / `opportunities` with embeddings, to demonstrate matching.
- A handful of seeded `knowledge_base` entries (verified), to demonstrate RAG with at least one working example question (e.g. the A/L ICT student scenario above).
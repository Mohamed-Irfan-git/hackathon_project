# System Architecture

## 1. Architecture Overview

The system follows a modern web application architecture using:

- React + TypeScript for the frontend.
- Supabase as the backend platform.
- PostgreSQL as the primary database.
- Supabase Authentication for user authentication.
- Supabase Storage for file storage where required.
- Supabase Edge Functions for server-side business logic and AI operations.
- PostgreSQL `pgvector` for semantic search and AI matching.
- An external LLM/AI API for natural-language generation.
- RAG for retrieving verified educational and career opportunities.

The architecture should remain simple enough for the overnight MVP while allowing the platform to scale later.

---

## 2. High-Level Architecture

```text
                         USERS
                           |
                           v
                 +--------------------+
                 |   React Frontend   |
                 |    TypeScript      |
                 +--------------------+
                           |
                           v
                 +--------------------+
                 |      Supabase      |
                 +--------------------+
                    /      |       \
                   /       |        \
                  v        v         v
             Auth      PostgreSQL   Storage
                         |
                   +-----+------+
                   |            |
                   v            v
               Application   pgvector
                  Data       Embeddings
                   |
                   v
          +-----------------------+
          | Supabase Edge         |
          | Functions (TypeScript)|
          +-----------------------+
                   |
             +-----+------+
             |            |
             v            v
       AI Matching       RAG
             |            |
             v            v
         Embeddings      Retrieval
             \            /
              \          /
               v        v
                 LLM API
                   |
                   v
              AI Response
                   |
                   v
             React Frontend
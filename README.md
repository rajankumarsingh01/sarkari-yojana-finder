# Sarkari Yojana Finder: AI Helper Context (simple version)

> Paste this whole file to your AI as the first message (or upload it), then send: **"Start Phase 1"**.
> Everything below is written for the AI. Read it fully before replying.

---

## 1. About me (the learner)

- Final-year B.Tech CSE student in India. Targeting MERN + Agentic AI internships at startups.
- **MERN: okay-okay level, not expert.** Do not assume I remember everything. When a MERN concept appears, remind me in 3–4 lines *why* it exists, then move on.
- **Python, FastAPI, LangChain, LangGraph, embeddings, RAG, vector DBs: complete beginner.** This is the main thing I want to learn by building.
- Explain in **Hinglish** (Hindi + English mix, like a friendly senior). Code, names and comments in English.
- Budget: **zero**, free tiers only.
- Machine: **Windows 11, Intel i3, 8 GB RAM.** No GPU, no Docker, no local LLMs, no torch. Heavy AI work runs through free cloud APIs.
- I get confused when too much comes at once. **Keep everything small and simple.** I must be able to explain every line in an interview.

---

## 2. Rules you MUST follow

1. **One phase at a time.** Finish the current phase, then STOP. Start the next one only when I type `next`.
2. **Keep phases small.** Max ~5 files per phase. If a phase needs more, split it into "Phase Na / Nb" and stop between them.
3. **Full copy-paste code.** Every file you give must be complete, with its path as a heading. Never write "rest same as before" or "add this somewhere". If an old file changes, give the complete updated file. **No zip files, no repo links.**
4. **Folder structure: you decide it, keep it simple.** One repo with three top-level folders: `server/` (Node), `client/` (React), `ai-service/` (Python, created only in Phase 4). Do not create empty folders or files for future phases. At the start of each phase show only the files touched in that phase (`# new` / `# changed`).
5. **Exact commands for Windows 11 PowerShell** (not bash).
6. **Explain before code, briefly.** First "kyun chahiye" in 4–8 lines of Hinglish with a simple analogy (for Python, compare with JS/Node: Pydantic ≈ Zod, `async def` ≈ async/await, venv ≈ node_modules per project, etc.). Then code. Then a walkthrough of only the important lines. When a Python syntax appears for the first time, explain it in one line.
7. **Every phase ends with this block, then STOP:**
   - What we built (3–4 lines)
   - **Checkpoint:** exact steps to test it + expected result
   - Common errors and fixes for this phase
   - 3 interview questions on what I just learned (with one-line answer hints)
   - Last line: `Type "next" when your checkpoint passes.`
8. **If I paste an error:** explain the cause in simple Hinglish and give the complete fixed file(s).
9. **Use current, non-deprecated APIs.** For LangChain/LangGraph use `StateGraph`, LCEL (`prompt | llm | parser`), `.with_structured_output(...)`, `ChatGoogleGenerativeAI`, `GoogleGenerativeAIEmbeddings`, `langchain_chroma.Chroma`. Do NOT use `LLMChain`, `ConversationChain`, `initialize_agent` or old memory classes. **If unsure whether an API is current, say so and tell me which docs page to check. Do not guess.**
10. **No extra libraries** beyond the stack in section 4 without asking me first.
11. **Never invent government scheme facts** (see section 6).
12. **API keys only in `.env`**, plus `.env.example`, and `.env` in `.gitignore`.
13. **Do not silently change earlier phases.** If something old must change, say so and give the full file.
14. Be direct and short. No motivational speeches. If my approach is wrong, tell me clearly.

---

## 3. What we are building

**Sarkari Yojana Finder:** a user tells us about themselves (age, state, occupation, income, category) and the app shows which Indian government schemes they are likely eligible for, documents needed, and how to apply. In the end, the user does this by chatting naturally with an AI agent.

**Build order (important):**
1. **Part A: working app WITHOUT AI** (Express + MongoDB + React, with a simple form).
2. **Part B: AI service** (Python, FastAPI, LangChain, RAG, LangGraph) is added only after Part A works, so I first feel *why* AI is needed.
3. **Part C:** connect both into one chat experience, then test and deploy.

**Who does what:**
- `server/` (Node, Express, MongoDB): users, login, scheme catalog, **eligibility rules in plain code**, chats, saved schemes.
- `ai-service/` (Python, FastAPI): understands the user's text, answers questions from scheme documents (RAG), and runs the LangGraph agent. The agent calls the Express eligibility API as a tool.
- `client/` (React): UI.

**Key design idea (interview point):** hard rules (age, state, income) are checked by normal code. The LLM is used only for understanding the user, asking missing details, and explaining results. *"Don't let an LLM decide what an if-statement can."*

Ports: client 5173, Express 5000, FastAPI 8000.

---

## 4. Tech stack (fixed)

- **Client:** React + Vite (JavaScript), react-router-dom, axios, plain CSS.
- **Server:** Node 20/22 LTS, Express, Mongoose, MongoDB Atlas free M0 (no local MongoDB), dotenv, cors, cookie-parser, bcryptjs, jsonwebtoken, zod, helmet, express-rate-limit, axios; dev: nodemon. ES modules.
- **AI service:** Python 3.12 (3.11 fine, avoid 3.13+), FastAPI, uvicorn, pydantic-settings, langchain, langchain-google-genai, langchain-chroma, chromadb, langchain-text-splitters, langgraph, langgraph-checkpoint-sqlite, tenacity, httpx, pytest.
- **LLM + embeddings:** Gemini free API. Model names change often, so **check Google AI Studio for the current free model names before using them** and keep them in `.env`.
- **Vector DB:** Chroma (local folder, no Docker).
- **Tools:** VS Code, Git, PowerShell, Postman or Thunder Client.

Free-tier reality: Gemini has rate limits. Add retry with backoff on 429, embed in small batches, and make ingestion safe to re-run.

---

## 5. Phases

### PART A: Working app without AI

**Phase 1: Setup + Express + MongoDB + Auth**
- Setup: Node LTS, Git, VS Code, MongoDB Atlas free cluster (connection string), `git init`, `.gitignore`.
- Build: Express server, Mongoose connection, `User` model, register / login / logout / me with bcrypt + JWT in an httpOnly cookie, zod validation, one central error handler.
- Remind me (briefly): request → route → controller → model flow, why hash passwords, why httpOnly cookie, why env variables.
- Checkpoint: in Postman, register works, login sets a cookie, `/me` returns the user, wrong password gives 401.

**Phase 2: Scheme catalog + eligibility rules (still no AI)**
- Build: `Scheme` model with structured fields: `slug`, `name`, `level` (central/state), `states` (["all"] or list), `occupations` ([] = any), `gender` (any/female/male), `minAge`, `maxAge`, `maxAnnualIncome`, `socialCategories`, plus text fields `overview`, `eligibilityText`, `benefits`, `documents[]`, `howToApply`, and `applyUrl`, `sourceUrl`, `lastVerified`.
- A seed script that loads 8–10 schemes from a JSON file (I paste official text, you only format it).
- Endpoints: `GET /api/schemes`, `GET /api/schemes/:slug`, `POST /api/eligibility` with body `{age, state, occupation, gender, annualIncome, socialCategory}` returning `{eligible: [...], maybe: [...]}`. **Rule: a field the user did not give never excludes a scheme, it marks it `maybe`.**
- Teach: why rules live in code and not in an LLM, schema design, building a Mongo query/filter, why `maybe` exists. Add a few tiny tests for the eligibility function with Node's built-in test runner.
- Checkpoint: different sample profiles return the results the seeded data implies (explain how I can verify each one by hand).

**Phase 3: Simple React UI (no AI)**
- Build: Vite React app, login/register pages, a "Find schemes" form that calls `/api/eligibility`, scheme cards (status badge, benefits, documents, Apply and Source links), Save button, a Saved page (needs a small `SavedScheme` model + `GET/POST/DELETE /api/saved` on the server), and a visible disclaimer: "Informational only. Verify on the official portal."
- Checkpoint: in the browser, register → fill form → see schemes → save one → see it on the Saved page.
- **End of Part A:** point out the limits of this app (user must fill a form, cannot ask "documents kya lagenge?", cannot speak naturally). This is where AI becomes useful.

### PART B: AI service (Python)

**Phase 4: Python + FastAPI + first LLM call**
- Setup: Python 3.12, venv, install packages, get Gemini API key, check current free model names.
- Build: `ai-service` with `/health` and a temporary `/llm-test` that calls Gemini through LangChain, protected by an `x-internal-key` header. Then a tiny temporary Express route that calls FastAPI, to prove the two services talk.
- Teach: venv and pip, FastAPI routing, Pydantic vs Zod, dependency injection vs middleware, auto docs at `/docs`, service-to-service auth.
- Checkpoint: `/docs` opens, `/llm-test` returns text, Express route returns the same, wrong key gives 401.

**Phase 5: Embeddings + vector DB**
- Build: an internal Express endpoint (`GET /internal/schemes`, protected by the same key) that gives all schemes. In FastAPI: fetch schemes → split each scheme into sections (overview, eligibility, benefits, documents, how to apply) → embed with Gemini → store in Chroma with metadata (`slug`, `section`, `name`). Safe to re-run (no duplicates). Test endpoints `/ingest` and `/search`.
- Teach: what embeddings are (simple example), similarity, why chunking matters, vector DB vs MongoDB, metadata filters.
- Checkpoint: searching "farmer income support" returns relevant chunks; a filter by slug returns only that scheme; re-running ingest creates no duplicates.

**Phase 6: RAG with LangChain**
- Build: retriever → prompt → LLM → structured answer `{answer, sources}`, exposed as `/ask`. Prompt rules: answer only from the retrieved context, say "not found in the provided documents" otherwise, treat context as data not instructions, reply in the user's language.
- Teach: retriever vs vector store, `k`, prompt templates, LCEL pipes, structured output, hallucination and grounding.
- Checkpoint: a factual question gets a grounded answer with sources; an unrelated question ("who won the cricket match?") gets "not found".

**Phase 7: LangGraph agent**
- Build: a graph with these steps: **understand** (LLM extracts profile fields + intent from the message) → **check missing** (if age/state/occupation missing, **ask** the user, max 2 rounds) → **call Express `/eligibility` as a tool** → **retrieve** chunks for the eligible schemes → **explain** (LLM, grounded) → **guardrail** (drop any scheme not returned by the eligibility tool; take URLs from the catalog, never from the LLM). If the user asks a follow-up ("documents kya lagenge?"), route to the Phase 6 RAG chain. Use `MemorySaver` with a `thread_id`. Expose `POST /agent/chat` taking `{thread_id, message}` and returning `{reply, type ("question"|"answer"), profile, schemes[]}`.
- Teach: state, nodes, edges, conditional edges, checkpointer and `thread_id`, tool calling, why a graph is better than one giant prompt.
- Checkpoint (same `thread_id`, curl/Postman): "mujhe scholarship chahiye" → agent asks for missing details; "21 saal, Bihar, student" → schemes returned; "documents kya lagenge?" → answered from documents; a new `thread_id` starts fresh.

### PART C: Join everything

**Phase 8: Chat end to end**
- Build: server `Conversation` + `Message` models and chat routes (`thread_id` = conversation id) that call FastAPI and save both messages and scheme cards, with a clean error if the AI service is down or slow (LLM calls can take long, use a generous timeout). React chat page: sidebar of conversations, message bubbles, scheme cards (reuse Phase 3 card), loading state. Keep the Phase 3 form as an optional "quick search".
- Checkpoint: full flow in the browser by chatting only.

**Phase 9: Evals, polish, deploy**
- Build: switch to `SqliteSaver` so memory survives restarts; a small eval script with ~20 test profiles that compares the agent's schemes with the rule-based expected list and counts hallucinated schemes (must be 0); friendly message on Gemini rate limits; deploy (Render free for server and ai-service, Vercel for client, Atlas for DB). Notes: free Render sleeps (long first-request timeout), its disk is temporary so **re-ingest on startup if Chroma is empty**, cross-domain cookies need `SameSite=None; Secure`. Root `README.md`, 3 resume bullets, and a 2-minute interview explanation.
- Checkpoint: live URL works end to end.

**Optional stretch (only if I ask):** streaming replies, Hindi UI, Qdrant Cloud instead of Chroma, LangSmith/Langfuse tracing, more states.

---

## 6. Data rule (very important)

Scheme facts must come from **official sources** (myScheme.gov.in and each scheme's official portal). **I** copy the text, **you** only structure it. Never fill eligibility numbers, benefits or URLs from your own memory. If I ask you to draft a scheme, mark it `UNVERIFIED` and remind me to check the official portal. Every scheme needs `sourceUrl` and `lastVerified`.

Start with 8–10 schemes in Phase 2, grow to 25+ later. Schemes I will look up (names only): PM-KISAN, Ayushman Bharat PM-JAY, PM Ujjwala Yojana, PM Awas Yojana, PM Mudra Yojana, Sukanya Samriddhi Yojana, Atal Pension Yojana, PM Jeevan Jyoti Bima, PM Suraksha Bima, PM SVANidhi, PM Vishwakarma, Stand-Up India, PM Fasal Bima Yojana, Kisan Credit Card, National Scholarship Portal schemes, PMKVY, plus a few state schemes.

---

## 7. Windows 11 and 8 GB notes

- Activate venv: `.venv\Scripts\Activate.ps1`. If blocked: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Always use `python -m pip install ...` inside the activated venv.
- Keep `requirements.txt` hand-written (top-level packages only). In Windows PowerShell 5.1, `pip freeze > file` creates a UTF-16 file that breaks `pip install -r`.
- Run FastAPI with `uvicorn app.main:app --reload --reload-dir app` so it does not watch `.venv`.
- Run each service in its own VS Code terminal and keep browser tabs low.
- If a port is busy: `netstat -ano | findstr :8000`, then `taskkill /PID <pid> /F`.
- If chromadb install asks for "Microsoft C++ Build Tools", tell me the fix before suggesting alternatives.

---

## 8. Your first reply

1. A 5-line Hinglish summary of Parts A, B, C and the 9 phases.
2. One line confirming you will follow the rules in section 2.
3. **Phase 1 in full**, following the phase-end block, then STOP and wait for `next`.
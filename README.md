# NeoSamvaad 🌐💬
### Context-Aware Customer Support Agent (Neo4j Graph-RAG + React Frontend)

**NeoSamvaad** is an enterprise-grade, context-aware customer support platform powered by a **Neo4j Knowledge Graph** and **Grounded LLM Reasoning**. Rather than treating customer support queries as isolated interactions or generic semantic searches, NeoSamvaad traces structured historical ticket paths, recorded troubleshooting attempts, and verifiable outcomes directly from a knowledge graph to eliminate hallucinations and prevent repeated failed troubleshooting cycles.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────────────────┐
                    │      React Frontend (Member B)           │
                    │  • Customer Persona & Session Selector   │
                    │  • Chat Experience & Composer            │
                    │  • Neo4j Relationship Path Visualizer     │
                    │  • Authoritative Evidence Panel          │
                    └─────────────────────┬────────────────────┘
                                          │ REST API (/api/v1/chat)
                                          ▼
                    ┌──────────────────────────────────────────┐
                    │      FastAPI Backend (Member A)          │
                    │  • Cypher Graph Query Engine             │
                    │  • Ticket & Customer Service Layer       │
                    └──────────────┬───────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Neo4j Knowledge Graph       │   │   LLM Grounding Adapter         │
│  • Customer -> Ticket -> Issue  │   │  • System Prompt & Schema Gate  │
│  • Issue -> Attempt -> Outcome  │   │  • Anti-Hallucination Validator │
│  • Real Cypher Path Traversal   │   │  • Injection Attack Containment │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 🚀 Key Features

* **Authoritative Graph Grounding:** Claims about customer history, previous tickets, and troubleshooting attempts are backed exclusively by Neo4j graph records.
* **Cycle Prevention:** Detects when an action (e.g. password reset) previously failed and recommends investigative alternatives rather than repeating the same failed step.
* **Truthful Absence of Evidence:** Explicitly acknowledges when history is unavailable or unrecorded; never invents synthetic tickets.
* **Truthful Relationship Path:** Visualizes the actual graph chain from `Customer` $\rightarrow$ `Ticket` $\rightarrow$ `Issue` $\rightarrow$ `Attempt` $\rightarrow$ `Outcome` $\rightarrow$ `Recommendation`.
* **Prompt Injection Defense:** Strict structural boundary protection and untrusted customer input containment.

---

## 📂 Project Structure

* **`CONTRACT_MEMBER_A_MEMBER_B.md`**: Canonical API & schema contract between Member A (Backend) and Member B (Frontend/Adapter).
* **`llm_adapter/`**: Python grounding engine, Pydantic schemas, system prompts, validator, and provider-neutral generator.
* **`frontend/`**: Modern React 19 + TypeScript + Vite application with custom tokens, WCAG accessible styling, and interactive evidence visualization.
* **`tests/`**: Automated test suite for LLM grounding and scenario verification.
* **`README_MEMBER_B.md`**: Detailed Member B implementation guide and scenario demo walkthrough.

---

## 🧪 Testing & Validation

### Run Python Grounding Tests
```bash
python -m pytest
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Build Frontend
```bash
cd frontend
npm run build
```

---

## 💻 Running Locally

### 1. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

# CLAUDE.md — QP Maker

## Purpose
Single-session question paper generator. User uploads a document, configures difficulty/question types, generates a paper via Gemini AI, edits inline, and downloads as PDF.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + TypeScript + Vite         |
| Styling   | Bootstrap 5 + react-bootstrap     |
| Backend   | Node.js + Express                 |
| AI        | Google Gemini (`gemini-1.5-flash`)|
| PDF export| html2canvas + jsPDF               |

---

## Project Structure

```
qp-maker/
├── frontend/src/
│   ├── components/     # One file per UI responsibility
│   ├── services/api.ts # All backend calls (no fetch scattered in components)
│   ├── types/index.ts  # Shared TypeScript interfaces
│   └── App.tsx         # Top-level state orchestrator
├── backend/
│   ├── routes/         # upload.js, generate.js
│   ├── middleware/     # multer.js (file upload config)
│   ├── utils/          # extractText.js (pdf/docx/txt/image parsing)
│   └── server.js       # Entry point, CORS, route mounting
└── CLAUDE.md
```

---

## Build & Run Commands

### Frontend
```bash
cd frontend
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run lint       # ESLint
```

### Backend
```bash
cd backend
npm install
node server.js     # listens on http://localhost:5000
```

### Environment
Copy `backend/.env.example` → `backend/.env` and fill in:
```
GEMINI_API_KEY=your_key_here
PORT=5000
```

---

## Key Constraints
- **One document at a time** — no multi-file sessions
- **Max 20 questions total** — enforced on both frontend and backend
- **Strict document grounding** — Gemini prompt instructs it to use only uploaded content
- **MCQ always has 4 options** — labeled A, B, C, D
- **Answer key is opt-in** — only shown/included when user requests it

---

## Architecture Decisions
- Vite proxy (`/api → localhost:5000`) avoids CORS issues in dev; see `frontend/vite.config.ts`
- Text extraction happens on the backend so the frontend never touches raw binaries
- Gemini returns structured JSON; backend validates and retries once on malformed output
- PDF export captures the `QuestionEditor` DOM node — no server-side PDF rendering needed

---

## Detailed Docs
See `.claude/docs/` for topic-specific references:
- `.claude/docs/gemini-prompt.md` — prompt template and JSON schema
- `.claude/docs/file-extraction.md` — per-format extraction notes (pdf-parse, mammoth, tesseract)
- `.claude/docs/pdf-export.md` — html2canvas + jsPDF export flow

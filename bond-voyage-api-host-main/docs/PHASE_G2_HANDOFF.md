# PHASE G2 HANDOFF — Gemini Chatbots + FAQ RAG + Booking Ownership

## Env Vars
- `GEMINI_API_KEY` (required for chatbots; 501 returned if missing)
- `GEMINI_MODEL` (optional, default `gemini-1.5-flash`)

## Migration
- `20260210120000_phase_g2_faq_entry` — adds `faq_entries` table
- Deploy to Supabase: `npx prisma migrate deploy`
- Seed FAQs (optional): `npm run db:seed`

## Endpoints
- `POST /api/v1/chatbots/roameo`
  - Request: `{ "question": "How do I ...?" }`
  - Response: `{ "answer": string, "confidence": "high|medium|low", "sources": [{"id":string,"question":string,"order":number}] }`
  - Behavior: Gemini answers ONLY from active FAQ entries (keyword search). If no match, returns fallback with `sources: []`.
  - Errors: 501 if `GEMINI_API_KEY` missing; 400 on validation; 500 on provider failure.

- `POST /api/v1/chatbots/roaman`
  - Request: `{ "prompt": string, "preferences"?: { destination?, startDate?, endDate?, travelers?, tourType?, budget?, pace? } }`
  - Response: `{ "message": string, "draft": { type: "SMART_TRIP", destination: string, startDate?: string|null, endDate?: string|null, travelers: number, tourType?: "JOINER"|"PRIVATE", days: [{ dayNumber, date?, activities: [{ time, title, description?, location?, order }] }] } }`
  - Behavior: Gemini produces friendly text plus SMART_TRIP draft; best-effort JSON repair; no DB writes.
  - Errors: 501 if `GEMINI_API_KEY` missing; 400 on validation; 502 if returned JSON cannot be repaired.

- `GET /api/v1/faqs`
  - Returns DB-backed FAQs (ordered) with stub fallback if table empty.

- Booking creation rule
  - Only itinerary owners (or admins) can create bookings from an itinerary. Collaborators may edit itineraries but cannot create bookings.

## Curl Samples
- Roameo
```bash
curl -X POST http://localhost:8087/api/v1/chatbots/roameo \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I upload a payment receipt?"}'
```

- Roaman
```bash
curl -X POST http://localhost:8087/api/v1/chatbots/roaman \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Plan a 2-day Cebu trip","preferences":{"travelers":2,"pace":"balanced"}}'
```

- FAQ list
```bash
curl http://localhost:8087/api/v1/faqs
```

## Limitations / TODOs
- No embeddings/vector search; keyword match only for FAQ RAG.
- Gemini env is required; returns 501 without it.
- Upload endpoint still returns placeholder URL; no storage backend.

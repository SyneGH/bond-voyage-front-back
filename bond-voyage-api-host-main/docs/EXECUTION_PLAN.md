# Execution Plan

Operational plan for maintaining the BondVoyage backend in its final Phase J state.

## Current Stack & Entry Points
- Express + TypeScript with service/controller pattern under `src/` mounted at `/api/v1`.
- Prisma ORM targeting Postgres (Supabase-compatible); migrations in `prisma/migrations/`.
- Shared response helpers (`createResponse`, `throwError`) and ISO serializers for dates/decimals.
- Booking code generator in `src/services/booking.service.ts` uses `booking_sequence` per year.

## Day-to-Day Workflow
1. Install dependencies: `npm install`.
2. Generate Prisma client: `npx prisma generate`.
3. Apply migrations: `npx prisma migrate deploy` (optional `npm run db:seed` for FAQ/chatbots).
4. Build: `npm run build` (must pass before release).
5. Start locally: `npm start` (expects env vars set).
6. Run lint/tests as needed (`npm test` if/when present).

## Release Readiness Checks
- Health: `curl -s http://localhost:8087/api/v1/health` returns `{ status: 'ok' }`.
- Auth: login + refresh body-first; verify ISO date fields and `yearsInOperation` in profile.
- Itinerary/Booking flow: create itinerary → add collaborator → booking as owner (BV-YYYY-NNN) → payment submission → notification presence.
- AI endpoints: Roameo rejects out-of-scope; Roaman returns SMART_TRIP draft JSON.
- Audit filtering: `dateFrom` works; action filter is substring-based (legacy string mismatch expected).

## Deployment Steps (Render/Supabase)
1. `npm install`
2. `npx prisma migrate deploy`
3. `npm run db:seed` (optional for FAQ entries)
4. `npm run build`
5. Start service (`npm start` or Render command)
6. Confirm logs + `/api/v1/health`

## Risk/Compatibility Notes
- Do not remove legacy inline booking creation until clients fully migrated to itinerary-first flow.
- Requested itinerary send/confirm remain stubbed; document to stakeholders.
- Gemini API key absence returns 501 for chatbot endpoints; treat as non-fatal.
- Legacy audit action strings may not match enum filters; substring behavior is expected.

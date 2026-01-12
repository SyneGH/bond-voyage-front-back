# MIGRATION_NOTES

Use this log to apply/verify Prisma migrations and related backfills.

## Apply Steps (all environments)
1. Install deps: `npm install`
2. Generate client: `npx prisma generate`
3. Apply migrations: `npx prisma migrate deploy`
4. Seed (optional, for FAQ/chatbots): `npm run db:seed`
5. Build to ensure type safety: `npm run build`

## Migration History

### 20250204120000_phase_b_itinerary_booking_refactor
- **Change set:**
  - Added `RequestStatus` enum for requested itinerary tracking.
  - Itinerary gains `requestedStatus`, `sentAt`, `confirmedAt`.
  - `ItineraryCollaborator` tracks `invitedById`.
  - Booking snapshots `destination/startDate/endDate/travelers`; booking sequences store last issued code.
- **Verification:**
  ```bash
  npx prisma db pull
  npx prisma studio # inspect itineraries/bookings/booking_sequences
  ```
- **Backfill:**
  - Populate booking snapshot fields from linked itinerary.
  - Seed `invitedById` with owner for existing collaborators.
  - Align `booking_sequences.lastIssuedCode` with latest BV-YYYY-NNN per year.

### 20260210120000_phase_g2_faq_entry
- **Change set:** Adds `faq_entries` table for Roameo RAG.
- **Verification:**
  ```bash
  npx prisma db pull
  npx prisma studio # confirm faq_entries rows
  ```
- **Backfill:** Run `npm run db:seed` to upsert default FAQ entries (`isActive` true).

### 20260214000000_phase_h_years_in_operation
- **Change set:** Adds nullable `yearsInOperation` integer to `users`.
- **Verification:**
  ```bash
  npx prisma db pull
  npx prisma studio # confirm users.yearsInOperation exists
  ```
- **Backfill:** Optionally populate `yearsInOperation`; allow null if unknown.

### Phase F (Notifications)
- **Change set:** Structured payload validation for notifications; no schema change.
- **Verification:**
  ```bash
  npx prisma db pull
  npx prisma studio # ensure notifications appear after booking/payment actions
  ```
- **Backfill:** None required.

## Operational Notes
- Booking codes use calendar-year sequences; if importing historical bookings, update `booking_sequences` accordingly.
- Chatbot endpoints return 501 when Gemini env vars are absent; not a migration blocker.
- No destructive migrations are present in this log; if adding future migrations, document downgrade/rollback expectations here.

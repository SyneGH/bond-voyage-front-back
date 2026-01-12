# Phase H Handoff — Years in Operation + User Date Serialization

## Schema Change
- Added optional `yearsInOperation Int?` to `User` (column: `yearsInOperation`).
- Migration: `20260214000000_phase_h_years_in_operation` adds the column to `users`.

## Updated Endpoints
- `PATCH /api/v1/users/profile` (auth required): accepts `yearsInOperation` (integer, min 0) along with existing profile fields.
- `GET /api/v1/auth/profile` and any responses that include the authenticated user now return:
  - `yearsInOperation` (nullable number)
  - ISO 8601 strings for `createdAt`, `updatedAt`, `birthday`, and `lastLogin` when present.

## Validation Rules
- `yearsInOperation`: integer, minimum 0, nullable/optional. Empty string treated as null.

## Example Response (`GET /api/v1/auth/profile`)
```json
{
  "user": {
    "id": "...",
    "email": "demo@example.com",
    "firstName": "Demo",
    "lastName": "User",
    "mobile": "09171234567",
    "role": "USER",
    "companyName": null,
    "customerRating": null,
    "yearsInOperation": 3,
    "birthday": "1990-01-01T00:00:00.000Z",
    "lastLogin": "2026-02-14T00:00:00.000Z",
    "createdAt": "2026-02-14T00:00:00.000Z",
    "updatedAt": "2026-02-14T00:00:00.000Z"
  }
}
```

## Migration / Apply Steps (Supabase/Postgres)
1. Generate client (optional):
   ```bash
   npx prisma generate
   ```
2. Apply migrations (Supabase):
   ```bash
   npx prisma migrate deploy
   ```
3. (Optional) Seed data:
   ```bash
   npm run db:seed
   ```
4. Verify column:
   ```bash
   npx prisma studio
   ```

## Notes
- No notification or chatbot changes were made in this phase.
- Booking/itinerary logic is unchanged; this phase is limited to user profile and serialization.

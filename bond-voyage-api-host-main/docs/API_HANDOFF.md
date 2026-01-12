# API_HANDOFF

This handoff summarizes the BondVoyage backend for frontend consumers. The API is Express + TypeScript + Prisma (Postgres) and is mounted at `/api/v1`.

## Base URLs & CORS
- Local backend: `http://localhost:8087/api/v1`
- Cloud backend: `https://bond-voyage-api-host.onrender.com/api/v1`
- Frontend origins: `http://localhost:3000`, `https://bond-voyage.vercel.app` (configure via `CORS_ORIGINS` or `FRONTEND_URL`).

## Auth Flow
- `POST /auth/register` — Register user (email/password profile fields) and return tokens.
- `POST /auth/login` — `{ email, password }` → `{ user, accessToken, refreshToken }` (sets refresh cookie).
- `POST /auth/refresh-token` — Body `{ refreshToken }` preferred; cookie fallback → `{ accessToken }`.
- `POST /auth/reset-password` — Initiate password reset email (credentials required in envs).
- `POST /auth/send-otp` / `POST /auth/verify-otp` — OTP email flow (SMTP/API email creds required).
- `POST /auth/logout` / `POST /auth/logout-all` — Invalidate session(s); require auth.
- `GET /auth/profile` — Returns caller profile (includes `yearsInOperation`, ISO date strings).

## Core Domains & Key Endpoints
- **Users:** Self update profile/change password, self stats/activity logs; admin CRUD/deactivate/delete with filters.
- **Itineraries:** CRUD + collaborator add/list/remove; versions list/detail/restore; send/confirm stubs. Owners/collaborators can edit.
- **Bookings:** Owner-only creation from itinerary (BV-YYYY-NNN codes, itinerary snapshot); list mine/shared; submit/cancel/delete draft; collaborator CRUD; admin list/status transitions.
- **Payments:** Submit payment for booking, fetch proof, list payments, admin verify/reject; notifications emitted.
- **Notifications:** Paginated list, mark single read, mark all read.
- **FAQs:** Public list/search; Admin CRUD to maintain Roameo knowledge base.
- **AI:**
  - **Roameo:** FAQ RAG assistant (Gemini key required; 501 if missing).
  - **Roaman:** "Smart Trip" assistant returning friendly text + `draft` itinerary JSON.
  - **Smart Trip generator:** `/ai/itinerary` deterministic itinerary builder (no Gemini dependency).
- **Audits:** `/activity-logs` (admin) and `/users/me/activity-logs` (self) with substring action filter; legacy action strings may not match enums.
- **Routing/Weather/Places:** Route calculate/optimize (auth), weather current/forecast (public), place search (public).
- **Inquiries/Feedback:** Authenticated inquiry threads (create/list/message) and feedback submit/admin respond.
- **Tour packages:** Public list/detail; admin CRUD.
- **Dashboard:** Admin stats snapshot.
- **Uploads:** `/upload/itinerary-thumbnail` placeholder URL responder (no storage yet).

## Response Envelope & Serialization
- Success: `{ success: true, message: string, data?: any, meta?: Pagination }`
- Errors: `{ success: false, message, details? }` with proper HTTP status.
- Dates returned as ISO 8601 strings; Prisma Decimal values serialized to numbers.

## Required Environment
- Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
- Common optional: `DIRECT_URL`, `JWT_ACCESS_EXPIRE`, `JWT_REFRESH_EXPIRE`, `FRONTEND_URL`, `CORS_ORIGINS`, `BODY_LIMIT`, `PORT`, `NODE_ENV`, `BCRYPT_SALT_ROUNDS`, `REDIS_URL`, `REDIS_PORT`, `OPENWEATHER_API_KEY`, `GEOAPIFY_API_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `BREVO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`.

## Models & Notable Behaviors
- **Booking codes:** Generated in booking service as `BV-YYYY-NNN` with 3-digit padding (yearly sequence table).
- **Itinerary ownership:** Collaborators can edit itineraries; only owner/admin can create bookings.
- **Requested/SMART_TRIP flows:** Requested send/confirm remain stubbed; SMART_TRIP draft comes from Roaman or /ai/itinerary.
- **Notifications:** Structured payloads for booking/payment/inquiry actions; pagination supported.
- **ISO dates:** Serializers ensure ISO strings for all date fields across DTOs.

## Smoke Test (short)
```bash
export BASE="http://localhost:8087/api/v1"
curl -s "$BASE/health"
curl -i -c cookies.txt -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}'
curl -b cookies.txt -X POST "$BASE/auth/refresh-token" -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<token>"}'
curl -b cookies.txt -X POST "$BASE/itineraries" -H 'Content-Type: application/json' \
  -d '{"destination":"Paris","travelers":2,"startDate":"2025-01-10","endDate":"2025-01-15","days":[{"dayNumber":1,"activities":[{"time":"10:00","title":"Check in","order":1}]}]}'
curl -b cookies.txt "$BASE/itineraries/<itineraryId>/versions"
curl -b cookies.txt -X POST "$BASE/bookings" -H 'Content-Type: application/json' \
  -d '{"itineraryId":"<itineraryId>","totalPrice":1200}'
curl -b cookies.txt -X POST "$BASE/payments/<bookingId>" -H 'Content-Type: application/json' \
  -d '{"amount":1200,"method":"BANK_TRANSFER","reference":"TX123"}'
curl "$BASE/weather?city=Paris"
curl -X POST "$BASE/routes/optimize" -H 'Authorization: Bearer <accessToken>' -H 'Content-Type: application/json' \
  -d '{"stops":[],"mode":"drive"}'
```

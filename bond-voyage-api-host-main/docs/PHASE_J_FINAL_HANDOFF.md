# Phase J Final Backend Handoff — BondVoyage API Host

## 1) Executive Summary
- BondVoyage API Host is an Express + TypeScript + Prisma backend that powers user authentication, itinerary creation/collaboration, booking issuance, payments, notifications, audits, FAQ/assistant chatbots, and supporting utilities (places, weather, uploads).
- End-to-end flow: Authenticated users build itineraries (solo or collaborative), owners confirm and proceed to bookings (BV-YYYY-NNN codes), submit payments, and receive notifications; admins can review bookings/payments and query audit trails; chatbots handle FAQ (Roameo) and travel-draft assistance (Roaman).

## 2) Tech Stack & Architecture
- **Platform:** Node.js/Express, TypeScript, Prisma ORM targeting Postgres (Supabase-compatible).
- **Pattern:** Service + Controller with DTO validation (Zod validators), shared response helpers (`createResponse`/`AppError`).
- **Routing:** Mounted at `/api/v1` with health check at `/api/v1/health`.
- **Response envelope:** `{ success: boolean, message: string, data?, meta? }`; errors thrown with `AppError`/`throwError` are handled by global error middleware.
- **Serialization:** Dates emitted as ISO 8601 strings; Prisma Decimal converted to numbers in serializers.
- **Environment variables:**
  - **Required:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
  - **Optional/common:** `DIRECT_URL`, `JWT_ACCESS_EXPIRE`, `JWT_REFRESH_EXPIRE`, `FRONTEND_URL`, `CORS_ORIGINS`, `BODY_LIMIT`, `PORT`, `NODE_ENV`, `BCRYPT_SALT_ROUNDS`, `REDIS_URL`, `REDIS_PORT`, `OPENWEATHER_API_KEY`, `GEOAPIFY_API_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `BREVO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`.
- **Base URLs:**
  - Backend local: `http://localhost:8087/api/v1`
  - Backend cloud (Render): `https://bond-voyage-api-host.onrender.com/api/v1`
  - Frontend local origin: `http://localhost:3000`
  - Frontend cloud origin: `https://bond-voyage.vercel.app`
- **CORS:** Origins resolved from `CORS_ORIGINS` (comma-separated) or fallback to `FRONTEND_URL`/`http://localhost:3000`; credentials enabled.

## 3) Data / Schema Highlights
- **User:** Auth profile with role, contact fields, optional `yearsInOperation`, ISO date fields (birthday, lastLogin, created/updated).
- **Itinerary:** Contains destination, dates, travelers, status fields, days/activities; collaborators via `ItineraryCollaborator` with inviter, role, timestamps.
- **ItineraryDay/Activity:** Day-by-day planned activities with ordering and metadata.
- **Booking:** Snapshot of itinerary destination/dates/travelers, `bookingCode` (BV-YYYY-NNN padded to 3 digits), type/tourType/status/paymentStatus, optional customer and rejection details, ownership derived for viewers.
- **BookingSequence:** Tracks per-year counters for booking codes.
- **Payment:** Linked to booking; supports proof upload/review and notification hooks.
- **Notification:** User-facing alerts (booking/payment/etc.) with JSON payload.
- **ActivityLog (Auditing):** Records action string + JSON details (entityType/id/metadata/message) with timestamp.
- **FaqEntry:** FAQ knowledge base used by Roameo.
- **ISO Dates:** `serialize*` helpers convert Date fields to ISO strings for API responses.
- **Booking code generation:** Incremental per-year sequence via `buildBookingCode(YYYY, NNN)` inside booking service.

## 4) Endpoint Catalog (Frontend Integration Contract)
_Auth required unless noted; all responses wrapped in the standard envelope. Pagination meta: `{ page, limit, total, totalPages }` when applicable._

### Auth
- **POST /auth/login** — Body `{ email, password }`; returns `{ user, accessToken, refreshToken }` and sets `refreshToken` cookie.
- **POST /auth/refresh-token** — Body `{ refreshToken }` preferred; falls back to `refreshToken` cookie; returns `{ accessToken }`.
- **GET /auth/profile** — Requires auth; returns current user profile.

### Users (Self scope)
- **PATCH /users/profile** — Update profile (includes `yearsInOperation`); body matches profile DTO.
- **PUT /users/change-password** — `{ currentPassword, newPassword }`.
- **GET /users/me/stats** — Self stats snapshot.
- **GET /users/me/activity-logs** — Paginated self audit logs.

### Users (Admin scope)
- **POST /users** — Create user; admin only.
- **GET /users** — Paginated list with filters (search, role, isActive, date range); excludes admins.
- **GET /users/:id** — Admin fetch single user.
- **PATCH /users/:id** — Admin update.
- **PATCH /users/:id/deactivate** — Soft deactivate.
- **DELETE /users/:id** — Delete.

### Itineraries
- **POST /itineraries** — Create itinerary.
- **GET /itineraries** — List caller-owned itineraries with pagination.
- **GET /itineraries/:id** — Fetch itinerary (includes collaborators/days/activities).
- **PATCH /itineraries/:id** — Update itinerary (owner/collaborator rules enforced).
- **DELETE /itineraries/:id** — Archive/delete.
- **PATCH /itineraries/:id/send** — Mark sent to customer.
- **PATCH /itineraries/:id/confirm** — Owner confirm.
- **GET /itineraries/:id/versions** | **GET /itineraries/:id/versions/:versionId** | **POST /itineraries/:id/versions/:versionId/restore** — Version history and restore.
- **POST /itineraries/:id/collaborators** — Add collaborator `{ userId }`.
- **GET /itineraries/:id/collaborators** — List collaborators.
- **DELETE /itineraries/:id/collaborators/:userId** — Remove collaborator.

### Bookings
- **POST /bookings** — Owner-only booking creation from itinerary; generates BV-YYYY-NNN code; accepts inline itinerary fallback for legacy clients.
  - Minimal body: `{ itineraryId, totalPrice, type?, tourType? }`.
- **GET /bookings/:id** — Owner/admin; collaborators can view if attached itinerary collaborator or requested owner.
- **PUT /bookings/:id** — Update booking itinerary details (draft/collaborator rules enforced).
- **PATCH /bookings/:id/submit** — Submit booking for review.
- **PATCH /bookings/:id/cancel** — Cancel.
- **DELETE /bookings/:id** — Delete draft.
- **GET /bookings/my-bookings** — Paginated caller bookings; optional `status` filter.
- **GET /bookings/shared-with-me** — Bookings where caller is collaborator.
- **POST /bookings/:id/payments** — Attach payment proof (delegates to payment controller).
- **GET /bookings/:id/payments** — List payments for booking.
- **POST /bookings/:id/collaborators** | **GET /bookings/:id/collaborators** | **DELETE /bookings/:id/collaborators/:collaboratorUserId** — Booking-level collaborators.
- **PATCH /bookings/:id/status** — Admin update status (approve/reject/resolution fields).
- **GET /bookings/admin/bookings** — Admin list with filters (status, pagination).

### Payments
- **POST /payments/:id** — Create payment for booking `id`.
- **GET /payments** — List payments (auth; admin filtering available in service layer).
- **GET /payments/:id/proof** — Fetch proof asset (auth required).
- **PATCH /payments/:id/status** — Admin verify/reject; triggers notifications.

### Notifications
- **GET /notifications** — Paginated notifications for caller.
- **PATCH /notifications/:id/read** — Mark single read.
- **PATCH /notifications/read-all** — Mark all read.

### AI Chatbots
- **POST /chatbots/roameo** — Body `{ question }`; answers only from FAQ DB (no internet; returns strict in-scope responses).
- **POST /chatbots/roaman** — Body `{ prompt, preferences? }`; responds with friendly text plus JSON draft itinerary (type `SMART_TRIP`), no DB writes.
- **POST /ai/itinerary** — Body `{ destination, startDate, endDate, travelers, budget, travelPace, preferences?[] }`; deterministic smart-trip builder (no Gemini required).

### Audits
- **GET /activity-logs** — Admin-wide audit query with filters (`actorId`, `action` substring match, `entityType`, `entityId`, `dateFrom`, `dateTo`).
- **GET /activity-logs/:id** — Admin detail.
- **GET /users/me/activity-logs** — Caller-only audit view.
- _Action filter note:_ Substring matching means legacy strings like "Created Booking" will not match enum constants such as "BOOKING_CREATED" unless stored consistently; this is expected for Phase I.

### Other Supporting Endpoints
- **Weather:** `GET /weather` (current) and `GET /weather/forecast` (5-step forecast), public; uses OpenWeather if key present, mock otherwise.
- **Routes:** `POST /routes/calculate` and `POST /routes/optimize`, require auth; Geoapify-backed when key configured.
- **Places:** `GET /places/search` public Geoapify-powered lookup.
- **Inquiries:** `GET /inquiries`, `POST /inquiries`, `POST /inquiries/:id/messages` (auth required) for threaded booking questions.
- **Feedback:** `POST /feedback` (auth), `GET /feedback` and `PATCH /feedback/:id/respond` (admin).
- **Tour packages:** `GET /tour-packages`/`:id` public; admin create/update/delete.
- **Dashboard:** `GET /dashboard/stats` admin-only snapshot.
- **Uploads:** `POST /upload/itinerary-thumbnail` placeholder URL responder (no storage).

#### Minimal Request/Response Shapes (examples)
- Success envelope: `{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }`
- Error envelope: `{ "success": false, "message": "Error message", "details"?: any }` (status-dependent via `AppError`).
- Pagination meta reused across list endpoints.

## 5) Contracts / DTO Rules
- **Dates:** Always returned as ISO 8601 strings via serializers.
- **Money:** Prisma Decimal converted to numbers in responses.
- **Pagination:** Lists return `data: [...]` plus `meta` with `page`, `limit`, `total`, `totalPages`.
- **Errors:** Thrown via `throwError(status, message, details)`; global handler ensures JSON envelope with `success: false` and HTTP status codes (400/401/403/404/409/500 common).

## 6) Deployment Checklist (Render + Supabase)
1. Install deps: `npm install`
2. Generate client: `npx prisma generate`
3. Apply migrations: `npx prisma migrate deploy`
4. Seed (for FAQ/chatbot data as needed): `npm run db:seed`
5. Build: `npm run build`
6. Start service (Render uses `npm start` or configured command)

## 7) Smoke Test Script (copy/paste)
Assumes `BASE=https://bond-voyage-api-host.onrender.com/api/v1` and user credentials are available.

```bash
export BASE="http://localhost:8087/api/v1"
# 1) Health
curl -s "$BASE/health"

# 2) Login
curl -i -c cookies.txt -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}'

# 3) Refresh (body-first, cookie fallback)
curl -b cookies.txt -X POST "$BASE/auth/refresh-token" -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<from-login-if-needed>"}'

# 4) Create itinerary
curl -b cookies.txt -X POST "$BASE/itineraries" -H 'Content-Type: application/json' \
  -d '{"destination":"Paris","travelers":2,"startDate":"2025-01-10","endDate":"2025-01-15","days":[{"dayNumber":1,"activities":[{"time":"10:00","title":"Check in","order":1}]}]}'

# 5) Add collaborator
curl -b cookies.txt -X POST "$BASE/itineraries/<itineraryId>/collaborators" -H 'Content-Type: application/json' \
  -d '{"userId":"<collaboratorUserId>"}'

# 6) Attempt booking as collaborator (should be forbidden)
curl -b cookies.txt -X POST "$BASE/bookings" -H 'Content-Type: application/json' \
  -d '{"itineraryId":"<itineraryId>","totalPrice":1000}'

# 7) Booking as owner (should succeed; check bookingCode BV-YYYY-NNN)
curl -b cookies.txt -X POST "$BASE/bookings" -H 'Content-Type: application/json' \
  -d '{"itineraryId":"<itineraryId>","totalPrice":1200}'

# 8) Submit payment & check notifications
curl -b cookies.txt -X POST "$BASE/payments/<bookingId>" -H 'Content-Type: application/json' \
  -d '{"amount":1200,"method":"BANK_TRANSFER","reference":"TX123"}'
curl -b cookies.txt "$BASE/notifications"

# 9) Roameo out-of-scope question (moon) should return refusal/redirect to FAQ
test "$(curl -s -X POST "$BASE/chatbots/roameo" -H 'Content-Type: application/json' -d '{"question":"How far is the moon?"}')" != ""

# 10) Roaman JSON output
curl -s -X POST "$BASE/chatbots/roaman" -H 'Content-Type: application/json' \
  -d '{"prompt":"Plan a 3-day trip to Tokyo","preferences":{"budget":"mid"}}'

# 11) Audit dateFrom filter
curl -b cookies.txt "$BASE/activity-logs?dateFrom=2024-01-01"
```

## 8) Known Limitations
- FAQ RAG is keyword/search-based; no embeddings/vector DB.
- Roaman returns draft itinerary JSON without persisting to DB; informational only.
- Some "requested itinerary" flows remain stubbed; collaborators cannot proceed to booking (owner/admin only).
- Audit `action` filter uses substring matching, so legacy strings (e.g., "Created Booking") will not match new enum-style constants unless logs are standardized.


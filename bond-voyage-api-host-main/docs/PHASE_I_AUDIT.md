# Phase I — Audit Logging

## Scope
- Capture key security and lifecycle events across auth, itineraries, bookings, payments, inquiries, and admin user management.
- Reuse the existing `ActivityLog` table (no new migrations).
- Ensure no sensitive artifacts (passwords, access tokens, refresh tokens, raw payment proof binaries) are logged.

## Base URLs
- Backend (local): `http://localhost:8087/api/v1`
- Backend (cloud): `https://bond-voyage-api-host.onrender.com/api/v1`
- Frontend (local): `http://localhost:3000`
- Frontend (cloud): `https://bond-voyage.vercel.app/home`

## Audit Capture Matrix
| Domain | Actions Logged | Metadata Notes |
| --- | --- | --- |
| Auth | login success, refresh rotation, logout (single + all sessions) | email only; never tokens or passwords |
| Itinerary | create, update, send, confirm, collaborator add/remove | itinerary + collaborator identifiers only |
| Booking | create, submit, cancel, status transitions, collaborator add/remove | bookingId/bookingCode, destination/status where relevant |
| Payment | submit, admin verify/reject | bookingId/bookingCode, amount/method/status only |
| Inquiry | create, message sent | bookingId, isAdmin flag |
| Users (admin) | create/update/deactivate/delete | target user id/email |
| FAQ (admin) | create, update, delete | question snippet |

## Endpoints
- **Self logs:** `GET /api/v1/users/me/activity-logs?page=&limit=&action=&entityType=&entityId=&dateFrom=&dateTo=`
  - Authenticated user scope only; filters optional.
- **Admin audit logs:**
  - `GET /api/v1/admin/audit-logs?page=&limit=&actorId=&action=&entityType=&entityId=&dateFrom=&dateTo=`
  - `GET /api/v1/admin/audit-logs/:id`
  - Includes pagination meta `{ page, limit, total, totalPages }` and user identity (id, firstName, lastName, email).

## Response Shape (example)
```json
{
  "success": true,
  "message": "Activity logs retrieved",
  "data": [
    {
      "id": "log-id",
      "userId": "actor-id",
      "action": "PAYMENT_VERIFIED",
      "entityType": "PAYMENT",
      "entityId": "payment-id",
      "metadata": { "bookingCode": "BV-2024-001" },
      "message": "Payment ...",
      "timestamp": "2024-07-10T12:00:00.000Z",
      "user": { "id": "actor-id", "firstName": "Admin", "lastName": "User", "email": "admin@example.com" }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

## Filtering Notes
- `action` and `entityType` comparisons are case-insensitive and substring-friendly.
- `dateFrom`/`dateTo` accept ISO timestamps.
- Legacy `type` query param remains supported for backward compatibility.

## Non-goals
- No schema changes or separate audit table for this phase.
- No storage of binary artifacts or token materials in audit metadata.

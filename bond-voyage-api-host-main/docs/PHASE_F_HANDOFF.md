# Phase F Handoff — Notifications

## What changed
- Added structured notification payload validation and serialization.
- Emitted notifications for booking creation/status changes, payment submission/status changes, and inquiry creation/replies.
- Added notification endpoints with pagination and mark-read/read-all actions.

## Endpoints
- `GET /api/v1/notifications?page=1&limit=10&isRead=true|false`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`

## Notification payload shape
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "BOOKING|PAYMENT|INQUIRY|SYSTEM|FEEDBACK",
  "title": "string|null",
  "message": "string",
  "data": { "bookingId": "uuid", "bookingCode": "BV-2025-001", "status": "PENDING" },
  "isRead": false,
  "createdAt": "2025-02-14T00:00:00.000Z"
}
```

## Sample flows
- **Booking created** → BOOKING notification to owner; admin copy for review.
- **Booking status update** → BOOKING notification to owner (status + rejection reason embedded in message).
- **Payment submitted** → PAYMENT notification to owner; admin copy for verification.
- **Payment verified/rejected** → PAYMENT notification to owner.
- **Inquiry created/replied** → INQUIRY notification to owner; admin notified on creation.

## Validation rules
- Payloads validated per type (booking/payment/inquiry/system/feedback) before insert; invalid payloads throw `INVALID_NOTIFICATION_PAYLOAD`.

## Deployment/migration notes
- No new DB schema for Phase F; run standard deploy:
  - `npx prisma migrate deploy`
  - `npm run build`

## Smoke checks
- Create a booking, submit payment, and verify payment; confirm notifications via `GET /api/v1/notifications` with your token.
- Mark as read via `PATCH /api/v1/notifications/:id/read` or `PATCH /api/v1/notifications/read-all`.

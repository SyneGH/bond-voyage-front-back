# Phase D Handoff

## Endpoints (mounted at `/api/v1`)
- Auth: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh-token`, `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/reset-password`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/profile`.
- Users: `PATCH /users/profile`, `PUT /users/change-password`, `GET /users/me/stats`, `GET /users/me/activity-logs`; admin CRUD (`POST/GET/PATCH/DELETE /users`, `PATCH /users/:id/deactivate`).
- Itineraries: `POST /itineraries`, `GET /itineraries`, `GET /itineraries/:id`, `PATCH /itineraries/:id`, `DELETE /itineraries/:id`, `PATCH /itineraries/:id/send`, `PATCH /itineraries/:id/confirm`, collaborator add/list/remove, versions list/detail/restore.
- Bookings: `POST /bookings`, `GET /bookings/:id`, `PUT /bookings/:id`, `PATCH /bookings/:id/submit`, `PATCH /bookings/:id/cancel`, `DELETE /bookings/:id`, `GET /bookings/my-bookings`, `GET /bookings/shared-with-me`, collaborator add/list/remove, admin status update + admin list.
- Payments: `POST /bookings/:id/payments` or `POST /payments/:id`, `GET /payments`, `GET /payments/:id/proof`, `PATCH /payments/:id/status`.
- Discovery/Utilities: `GET /weather`, `GET /weather/forecast`, `POST /routes/calculate`, `POST /routes/optimize`, `GET /places/search`.
- FAQs/Chatbots: `GET/POST/PUT/DELETE /faqs`, `POST /chatbots/roameo`, `POST /chatbots/roaman`, `POST /ai/itinerary`.
- Uploads: `POST /upload/itinerary-thumbnail`.
- Notifications & Audits: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET /activity-logs`, `GET /activity-logs/:id`.
- Misc: `GET /dashboard/stats`, `POST/GET /inquiries`, `POST /inquiries/:id/messages`, `POST /feedback`, `GET /feedback`, `PATCH /feedback/:id/respond`, `GET/POST/PUT/DELETE /tour-packages`, `GET /health`.

## Samples
- **POST /api/v1/bookings**
```json
{
  "itineraryId": "<itinerary-id>",
  "totalPrice": 45000,
  "type": "CUSTOMIZED"
}
```
Response snippet:
```json
{
  "bookingCode": "BV-2025-001",
  "paymentStatus": "PENDING",
  "itinerarySnapshot": { "destination": "Paris", "startDate": "2025-02-10T00:00:00.000Z" }
}
```

- **GET /api/v1/itineraries**
```json
{
  "data": [
    { "id": "...", "destination": "Cebu", "days": [] }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

- **GET /api/v1/itineraries/:id/versions**
```json
{
  "data": [
    { "id": "ver-1", "itineraryId": "...", "createdAt": "2025-02-10T00:00:00.000Z" }
  ]
}
```

- **GET /api/v1/faqs**
```json
{
  "data": [
    { "id": "faq-1", "question": "How do I create an itinerary?", "order": 1 }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

- **GET /api/v1/weather/forecast**
```json
{
  "data": {
    "unit": "metric",
    "forecast": [
      { "date": "2025-02-10T00:00:00.000Z", "temperatureC": 26, "description": "Sunny" }
    ]
  }
}
```

- **POST /api/v1/upload/itinerary-thumbnail**
```json
{ "url": "https://example.com/thumbnail.png" }
```
Response:
```json
{ "data": { "url": "https://example.com/thumbnail.png" } }
```

- **GET /api/v1/users/me/stats**
```json
{
  "data": {
    "cards": { "totalBookings": 0, "pendingApprovals": 0, "activeBookings": 0, "completedTrips": 0, "faqsCard": 0 },
    "distributions": { "status": { "completed": 0, "pending": 0, "active": 0, "cancelled": 0 }, "type": { "standard": 0, "requested": 0, "customized": 0 } },
    "trends": { "year": 2025, "labels": ["Jan 2025"], "historical": [0,0,0,0,0,0,0,0,0,0,0,0], "predicted": [0,0,0,0,0,0] }
  }
}
```

- **GET /api/v1/users/me/activity-logs**
```json
{
  "data": [
    { "id": "log-1", "action": "CREATE_BOOKING", "timestamp": "2025-02-10T00:00:00.000Z" }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

## Known Stubs / TODOs
- Requested itinerary send/confirm flows remain minimal (state toggles only).
- Upload endpoint returns provided/placeholder URL (no storage backend).
- Weather and routing depend on external keys; deterministic mocks are used when keys are missing.

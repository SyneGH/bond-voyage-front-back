# RESPONSE_AUDIT

Representative responses for frontend contract validation. All examples use the standard envelope and ISO 8601 date strings.

## Auth
**POST /auth/login**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123",
      "email": "test@example.com",
      "name": "Test User",
      "role": "USER",
      "yearsInOperation": 5,
      "lastLogin": "2025-02-15T12:00:00.000Z",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-02-15T12:00:00.000Z"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**POST /auth/refresh-token**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": { "accessToken": "..." }
}
```

## Users
**PATCH /users/profile**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "user_123",
    "yearsInOperation": 6,
    "createdAt": "2025-01-10T08:00:00.000Z",
    "updatedAt": "2025-02-16T09:30:00.000Z"
  }
}
```

## Itineraries
**POST /itineraries**
```json
{
  "success": true,
  "message": "Itinerary created",
  "data": {
    "id": "itn_123",
    "destination": "Paris",
    "travelers": 2,
    "startDate": "2025-01-10T00:00:00.000Z",
    "endDate": "2025-01-15T00:00:00.000Z",
    "type": "STANDARD",
    "days": [
      {
        "dayNumber": 1,
        "activities": [
          { "order": 1, "time": "10:00", "title": "Check in" }
        ]
      }
    ],
    "collaborators": []
  }
}
```

## Bookings
**POST /bookings** (owner)
```json
{
  "success": true,
  "message": "Booking created",
  "data": {
    "id": "bk_123",
    "bookingCode": "BV-2025-001",
    "status": "PENDING",
    "type": "STANDARD",
    "paymentStatus": "UNPAID",
    "itinerary": {
      "id": "itn_123",
      "destination": "Paris",
      "startDate": "2025-01-10T00:00:00.000Z",
      "endDate": "2025-01-15T00:00:00.000Z",
      "travelers": 2
    },
    "createdAt": "2025-02-16T10:00:00.000Z"
  }
}
```

**PATCH /bookings/:id/status** (admin approve)
```json
{
  "success": true,
  "message": "Booking status updated",
  "data": {
    "id": "bk_123",
    "bookingCode": "BV-2025-001",
    "status": "APPROVED",
    "rejectionReason": null,
    "rejectionResolution": null,
    "updatedAt": "2025-02-16T11:00:00.000Z"
  }
}
```

## Payments
**POST /payments/:id**
```json
{
  "success": true,
  "message": "Payment submitted",
  "data": {
    "id": "pay_123",
    "bookingId": "bk_123",
    "amount": 1200,
    "method": "BANK_TRANSFER",
    "reference": "TX123",
    "status": "PENDING",
    "createdAt": "2025-02-16T11:15:00.000Z"
  }
}
```

## Notifications
**GET /notifications**
```json
{
  "success": true,
  "message": "Notifications fetched",
  "data": [
    {
      "id": "ntf_123",
      "type": "BOOKING_CREATED",
      "payload": { "bookingCode": "BV-2025-001" },
      "isRead": false,
      "createdAt": "2025-02-16T10:00:05.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

## Chatbots
**POST /chatbots/roameo** (out-of-scope question)
```json
{
  "success": true,
  "message": "Answer generated",
  "data": {
    "answer": "I can only answer questions from our FAQ database. Please ask something related to BondVoyage services.",
    "confidence": 0.0,
    "sources": []
  }
}
```

**POST /chatbots/roaman**
```json
{
  "success": true,
  "message": "Here is a draft itinerary",
  "data": {
    "message": "Happy to help! Here is a 3-day SMART_TRIP draft for Tokyo.",
    "draftItinerary": {
      "type": "SMART_TRIP",
      "destination": "Tokyo",
      "travelers": 2,
      "days": [
        { "dayNumber": 1, "activities": [{ "order": 1, "time": "09:00", "title": "Arrive and check-in" }] }
      ]
    }
  }
}
```

## Audits
**GET /activity-logs?dateFrom=2024-01-01**
```json
{
  "success": true,
  "message": "Activity logs fetched",
  "data": [
    {
      "id": "log_123",
      "actorId": "user_123",
      "action": "BOOKING_CREATED",
      "entityType": "BOOKING",
      "entityId": "bk_123",
      "metadata": { "bookingCode": "BV-2025-001" },
      "createdAt": "2025-02-16T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

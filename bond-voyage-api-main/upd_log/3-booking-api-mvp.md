## 📘 Booking API – Frontend Handoff Documentation

Project: Travel Booking System
Status: MVP – Backend Ready for Integration
Auth: Bearer Token (JWT)

# 1️⃣ API Contract Freeze (Important)
What “API Contract Freeze” Means
The shape of requests and responses defined in this document must not change during frontend integration.

This guarantees:

No surprise UI breakage
No rework when backend changes internally
Predictable frontend typing & state management

⚠️ Backend may optimize internals, but:

Field names
Field types
Enum values
Response structure
➡️ Must remain the same

# 2️⃣ Enums Reference (Exact Values)

Frontend must match these exactly.

BookingStatus = 
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

BookingType = 
  | "STANDARD"
  | "CUSTOMIZED"
  | "REQUESTED";

TourType =
  | "JOINER"
  | "PRIVATE";

# 3️⃣ Create Booking (Save Draft)
Endpoint
**POST /api/bookings**

Description

Creates a booking draft with full itinerary (days + activities).
User ID is derived from token
Atomic write (all or nothing)

**Request Payload**
{
  "destination": "El Nido, Palawan",
  "startDate": "2024-12-15T00:00:00.000Z",
  "endDate": "2024-12-20T00:00:00.000Z",
  "travelers": 4,
  "totalPrice": 32000,

  "type": "CUSTOMIZED",
  "tourType": "PRIVATE",

  "itinerary": [
    {
      "dayNumber": 1,
      "date": "2024-12-15T00:00:00.000Z",
      "activities": [
        {
          "time": "08:00 AM",
          "title": "Airport Pickup",
          "description": "Van waiting at terminal",
          "icon": "Van",
          "order": 1
        }
      ]
    }
  ]
}

**Success Response**
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "status": "DRAFT",
    "destination": "El Nido, Palawan",
    "itinerary": [
      {
        "dayNumber": 1,
        "activities": [
          {
            "title": "Airport Pickup",
            "order": 1
          }
        ]
      }
    ]
  }
}

# 4️⃣ Get My Bookings (List View)
Endpoint
**GET /api/bookings/my-bookings?page=1&limit=10**

Description

Returns summary list only (no itinerary).

**Sample Response**
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "booking-uuid",
        "destination": "El Nido, Palawan",
        "startDate": "2024-12-15T00:00:00.000Z",
        "endDate": "2024-12-20T00:00:00.000Z",
        "totalPrice": 32000,
        "status": "DRAFT",
        "type": "CUSTOMIZED"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}

# 5️⃣ Get Booking Details
Endpoint
**GET /api/bookings/:id**

Description

Fetches full booking details including itinerary and activities.

**Sample Response**
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "destination": "El Nido, Palawan",
    "status": "DRAFT",
    "tourType": "PRIVATE",
    "itinerary": [
      {
        "dayNumber": 1,
        "activities": [
          {
            "time": "08:00 AM",
            "title": "Airport Pickup",
            "order": 1
          }
        ]
      }
    ]
  }
}

# 6️⃣ Update Booking (Edit Draft / Rejected)
Endpoint
**PUT /api/bookings/:id**

Rules

Replaces entire itinerary
Allowed only if status = DRAFT or REJECTED
Uses nuke & rebuild strategy

**Payload**

{
  "destination": "El Nido, Palawan",
  "startDate": "2024-12-15T00:00:00.000Z",
  "endDate": "2024-12-20T00:00:00.000Z",
  "travelers": 4,
  "totalPrice": 32000,

  "itinerary": [
    {
      "dayNumber": 1,
      "date": "2024-12-15T00:00:00.000Z",
      "activities": [
        {
          "time": "08:00 AM",
          "title": "Airport Pickup",
          "description": "Van waiting at terminal",
          "icon": "Van",
          "order": 1
        }
      ]
    }
  ]
}

Same structure as Create Booking, except:

No type
No tourType

# 7️⃣ Submit Booking for Approval
Endpoint
**PATCH /api/bookings/:id/submit**

Effect
DRAFT → PENDING

**Response**
{
  "success": true,
  "message": "Booking submitted for approval"
}

# 8️⃣ Admin: Approve / Reject Booking
Endpoint
**PATCH /api/bookings/:id/status**

**Approve Payload**
{
  "status": "CONFIRMED"
}

**Reject Payload**
{
  "status": "REJECTED",
  "rejectionReason": "Fully booked",
  "rejectionResolution": "Please select different dates"
}

# 9️⃣ Delete Draft Booking
Endpoint
**DELETE /api/bookings/:id**

Rule

Only owner
Only DRAFT status



## 🔜 Next Steps Roadmap (Backend Planned)
1️⃣ TourPackage Admin CRUD (Next Priority)

Create reusable itinerary templates
Clone into bookings
Independent from booking lifecycle

2️⃣ AI Chatbot (Gemini API)

Booking assistance
Destination suggestions
FAQ + itinerary help

3️⃣ Google Maps Route Optimization

Optimize activity order
Backend computes routes
Frontend updates itinerary before saving

4️⃣ Collaborative Booking Editing (Post-MVP)

Multiple editors
Owner-only submission
Permission-based editing

✅ MVP Status Summary

✔ Booking creation & editing
✔ Admin approval workflow
✔ Pagination
✔ Activity logs ready
✔ Frontend can fully integrate

✅ Backend Booking MVP is complete and stable
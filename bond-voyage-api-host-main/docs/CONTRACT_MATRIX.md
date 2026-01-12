# CONTRACT_MATRIX

Canonical request/response contracts for frontend integration. All responses use the envelope `{ success, message, data?, meta? }` with ISO date strings and numeric decimals.

| Endpoint | Auth | Request (minimal) | Response (minimal) | Notes |
| --- | --- | --- | --- | --- |
| POST `/auth/register` | None | `{ email, password, firstName?, lastName? }` | `{ user, accessToken, refreshToken }` | Sets refresh cookie. |
| POST `/auth/login` | None | `{ email, password }` | `{ user, accessToken, refreshToken }` | Sets `refreshToken` cookie; user includes `yearsInOperation` and ISO dates. |
| POST `/auth/refresh-token` | Optional cookie | `{ refreshToken }` (body preferred) | `{ accessToken }` | Body token takes precedence over cookie. |
| POST `/auth/reset-password` | None | `{ email }` | `{ message }` | Requires email creds in env. |
| POST `/auth/send-otp` | None | `{ email }` | `{ message }` | Sends OTP via email provider. |
| POST `/auth/verify-otp` | None | `{ email, otp }` | `{ message }` | Verifies OTP. |
| POST `/auth/logout` | Bearer | — | `{ message }` | Invalidates current session. |
| POST `/auth/logout-all` | Bearer | — | `{ message }` | Invalidates all sessions. |
| GET `/auth/profile` | Bearer | — | `{ user }` | Self profile. |
| PATCH `/users/profile` | Bearer | Profile fields incl. `yearsInOperation` | `{ user }` | Self update. |
| PUT `/users/change-password` | Bearer | `{ currentPassword, newPassword }` | `{ message }` | Self change password. |
| GET `/users/me/stats` | Bearer | — | `{ cards, trends, distributions }` | Cards currently zeroed per product request. |
| GET `/users/me/activity-logs` | Bearer | `?page&limit&action&dateFrom&dateTo` | `{ items: ActivityLogDTO[], meta }` | Self-scope logs. |
| POST `/users` | Admin | `{ name?,firstName?,lastName?,email,password,role }` | `{ user }` | Admin create. |
| GET `/users` | Admin | `?search&role&isActive&dateFrom&dateTo&page&limit` | `{ items: UserDTO[], meta }` | Excludes admin users by design. |
| GET `/users/:id` | Admin | — | `{ user }` | Admin fetch. |
| PATCH `/users/:id` | Admin | Partial user fields | `{ user }` | — |
| PATCH `/users/:id/deactivate` | Admin | — | `{ user }` | Soft deactivate. |
| DELETE `/users/:id` | Admin | — | `{ message }` | Hard delete. |
| POST `/itineraries` | Bearer | `{ destination, travelers, startDate, endDate, days[] }` | `{ itinerary }` | Days include ordered activities; dates ISO. |
| GET `/itineraries` | Bearer | `?page&limit&search&status&type` | `{ items: ItineraryDTO[], meta }` | Caller-owned itineraries. |
| GET `/itineraries/:id` | Bearer | — | `{ itinerary }` | Includes collaborators/days/activities. |
| PATCH `/itineraries/:id` | Bearer | Partial itinerary fields | `{ itinerary }` | Owner/collaborator access control. |
| DELETE `/itineraries/:id` | Bearer | — | `{ message }` | Archive/delete per service rules. |
| PATCH `/itineraries/:id/send` | Bearer | `{ sentAt? }` | `{ itinerary }` | Requested flow stub; marks sent. |
| PATCH `/itineraries/:id/confirm` | Bearer | `{ confirmedAt? }` | `{ itinerary }` | Requested flow stub; owner confirm. |
| GET `/itineraries/:id/versions` | Bearer | — | `{ items: ItineraryVersionDTO[], meta? }` | Lists saved versions. |
| GET `/itineraries/:id/versions/:versionId` | Bearer | — | `{ itineraryVersion }` | Version detail. |
| POST `/itineraries/:id/versions/:versionId/restore` | Bearer | — | `{ itinerary }` | Restores a prior version. |
| POST `/itineraries/:id/collaborators` | Bearer | `{ userId }` | `{ collaborator }` | Inviter recorded; collaborator can edit itinerary. |
| GET `/itineraries/:id/collaborators` | Bearer | — | `{ items: CollaboratorDTO[] }` | — |
| DELETE `/itineraries/:id/collaborators/:userId` | Bearer | — | `{ message }` | Removes collaborator. |
| POST `/bookings` | Bearer (owner/admin) | `{ itineraryId, totalPrice, type?, tourType? }` (legacy inline itinerary allowed) | `{ booking }` | Generates `bookingCode` BV-YYYY-NNN; captures itinerary snapshot. |
| GET `/bookings/:id` | Bearer | — | `{ booking }` | Owner/admin; collaborators see if attached/requested. |
| PUT `/bookings/:id` | Bearer | Partial booking/itinerary fields | `{ booking }` | Draft edits with collaborator rules. |
| PATCH `/bookings/:id/submit` | Bearer | — | `{ booking }` | Submits booking. |
| PATCH `/bookings/:id/cancel` | Bearer | — | `{ booking }` | Cancels booking. |
| DELETE `/bookings/:id` | Bearer | — | `{ message }` | Deletes draft. |
| GET `/bookings/my-bookings` | Bearer | `?page&limit&status` | `{ items: BookingDTO[], meta }` | Caller-owned bookings. |
| GET `/bookings/shared-with-me` | Bearer | `?page&limit` | `{ items: BookingDTO[], meta }` | Collaborator-shared bookings. |
| POST `/bookings/:id/collaborators` | Bearer | `{ userId }` | `{ collaborator }` | Booking-level collaborators. |
| GET `/bookings/:id/collaborators` | Bearer | — | `{ items: CollaboratorDTO[] }` | — |
| DELETE `/bookings/:id/collaborators/:collaboratorUserId` | Bearer | — | `{ message }` | — |
| PATCH `/bookings/:id/status` | Admin | `{ status, rejectionReason?, rejectionResolution? }` | `{ booking }` | Admin approve/reject; notifications emitted. |
| GET `/bookings/admin/bookings` | Admin | `?status&page&limit&search` | `{ items: BookingDTO[], meta }` | Flattened admin view. |
| POST `/bookings/:id/payments` | Bearer | `{ amount, method, reference?, attachmentUrl? }` | `{ payment }` | Delegates to payment controller. |
| GET `/bookings/:id/payments` | Bearer | — | `{ items: PaymentDTO[] }` | — |
| POST `/payments/:id` | Bearer | `{ amount, method, reference?, attachmentUrl? }` | `{ payment }` | Equivalent payment submit. |
| GET `/payments` | Bearer | `?bookingId&page&limit` | `{ items: PaymentDTO[], meta }` | Admin filters available in service. |
| GET `/payments/:id/proof` | Bearer | — | File/stream or `{ url }` | Proof retrieval. |
| PATCH `/payments/:id/status` | Admin | `{ status, rejectionReason? }` | `{ payment }` | Verify/reject; emits notifications. |
| GET `/notifications` | Bearer | `?isRead&page&limit` | `{ items: NotificationDTO[], meta }` | Pagination meta reused. |
| PATCH `/notifications/:id/read` | Bearer | — | `{ notification }` | Mark read. |
| PATCH `/notifications/read-all` | Bearer | — | `{ count }` | Mark all read. |
| GET `/faqs` | None (public) | `?search&page&limit` | `{ items: FaqDTO[], meta }` | Used by Roameo RAG and User FAQ UI. |
| POST `/faqs` | Admin | `{ question, answer, tags[], ... }` | `{ faq }` | Creates new FAQ entry. |
| PUT `/faqs/:id` | Admin | Partial FAQ fields | `{ faq }` | Updates content. |
| DELETE `/faqs/:id` | Admin | — | `{ message }` | Hard deletes entry. |
| POST `/chatbots/roameo` | None (public) | `{ question }` | `{ answer, confidence, sources[] }` | FAQ-only; returns 501 if Gemini key missing; rejects out-of-scope. |
| POST `/chatbots/roaman` | None (public) | `{ prompt, preferences? }` | `{ message, draftItinerary }` | SMART_TRIP draft JSON, no DB write; 501 if Gemini key missing. |
| POST `/ai/itinerary` | None (public) | `{ destination, startDate, endDate, travelers, budget, travelPace, preferences?[] }` | `{ itinerary[], metadata }` | Deterministic smart-trip builder (no Gemini). |
| GET `/activity-logs` | Admin | `?actorId&action&entityType&entityId&dateFrom&dateTo&page&limit` | `{ items: ActivityLogDTO[], meta }` | Action filter is substring-based; legacy strings may not match enums. |
| GET `/activity-logs/:id` | Admin | — | `{ activityLog }` | — |
| GET `/inquiries` | Bearer | `?page&limit` | `{ items: InquiryDTO[], meta }` | Authenticated list. |
| POST `/inquiries` | Bearer | `{ bookingId?, message, title? }` | `{ inquiry }` | Creates inquiry. |
| POST `/inquiries/:id/messages` | Bearer | `{ message }` | `{ inquiry }` | Adds thread message. |
| POST `/feedback` | Bearer | `{ rating, message }` | `{ feedback }` | User feedback submit. |
| GET `/feedback` | Admin | `?page&limit` | `{ items: FeedbackDTO[], meta }` | Admin list. |
| PATCH `/feedback/:id/respond` | Admin | `{ response }` | `{ feedback }` | Admin response. |
| GET `/tour-packages` | None (public) | `?page&limit&search&isFeatured` | `{ items: TourPackageDTO[], meta }` | Public catalog. |
| GET `/tour-packages/:id` | None (public) | — | `{ tourPackage }` | Public detail. |
| POST `/tour-packages` | Admin | Tour package payload | `{ tourPackage }` | Admin create. |
| PUT `/tour-packages/:id` | Admin | Partial payload | `{ tourPackage }` | Admin update. |
| DELETE `/tour-packages/:id` | Admin | — | `{ message }` | Admin remove. |
| GET `/weather` | None (public) | `?city` or `?lat&lon` | `{ weather }` | Uses OpenWeather if key set; mock fallback. |
| GET `/weather/forecast` | None (public) | `?city` or `?lat&lon` | `{ forecast[] }` | 5-entry forecast from provider or mock. |
| POST `/routes/calculate` | Bearer | `{ origin, destination, mode }` | `{ route }` | Geoapify-backed when key set; auth required. |
| POST `/routes/optimize` | Bearer | `{ stops[], mode }` | `{ optimizedRoute }` | Geoapify-backed; auth required. |
| GET `/places/search` | None (public) | `?query` | `{ places[] }` | Geoapify-backed; open/public. |
| GET `/dashboard/stats` | Admin | — | `{ stats }` | Admin KPIs. |
| POST `/upload/itinerary-thumbnail` | None (public) | `{ url? }` | `{ url }` | Returns provided or placeholder URL (no storage). |
| GET `/health` | None | — | `{ status: 'ok' }` | Liveness. |

## Sample Payloads & Responses (All Endpoints)
Copy/paste-ready examples with the standard response envelope `{ success, message, data?, meta? }`. Replace IDs/tokens with real values.

### Auth
- **POST `/auth/register`**
  - Request
    ```json
    {"email":"sara@example.com","password":"Password123!","firstName":"Sara","lastName":"Lee"}
    ```
  - Response
    ```json
    {"success":true,"message":"Registered","data":{"user":{"id":"usr_123","email":"sara@example.com","role":"USER"},"accessToken":"<jwt>","refreshToken":"<jwt>"}}
    ```
- **POST `/auth/login`**
  - Request
    ```json
    {"email":"sara@example.com","password":"Password123!"}
    ```
  - Response
    ```json
    {"success":true,"message":"Logged in","data":{"user":{"id":"usr_123","email":"sara@example.com"},"accessToken":"<jwt>","refreshToken":"<jwt>"}}
    ```
- **POST `/auth/refresh-token`**
  - Request
    ```json
    {"refreshToken":"<jwt>"}
    ```
  - Response
    ```json
    {"success":true,"message":"Token refreshed","data":{"accessToken":"<jwt>"}}
    ```
- **POST `/auth/reset-password`**
  - Request
    ```json
    {"email":"sara@example.com"}
    ```
  - Response
    ```json
    {"success":true,"message":"Reset email sent"}
    ```
- **POST `/auth/send-otp`** / **POST `/auth/verify-otp`**
  - Request (send)
    ```json
    {"email":"sara@example.com"}
    ```
  - Request (verify)
    ```json
    {"email":"sara@example.com","otp":"123456"}
    ```
  - Response
    ```json
    {"success":true,"message":"OTP verified"}
    ```
- **POST `/auth/logout`** / **POST `/auth/logout-all`**
  - Response
    ```json
    {"success":true,"message":"Logged out"}
    ```
- **GET `/auth/profile`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"id":"usr_123","email":"sara@example.com","yearsInOperation":2}}
    ```

### Users
- **PATCH `/users/profile`**
  - Request
    ```json
    {"firstName":"Sara","lastName":"Lee","yearsInOperation":3}
    ```
  - Response
    ```json
    {"success":true,"message":"Profile updated","data":{"id":"usr_123","firstName":"Sara","yearsInOperation":3}}
    ```
- **PUT `/users/change-password`**
  - Request
    ```json
    {"currentPassword":"Password123!","newPassword":"NewPass123!"}
    ```
  - Response
    ```json
    {"success":true,"message":"Password updated"}
    ```
- **GET `/users/me/stats`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"cards":{"bookings":0,"itineraries":0},"trends":[],"distributions":[]}}
    ```
- **GET `/users/me/activity-logs`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"log_1","action":"LOGIN","createdAt":"2024-06-01T10:00:00.000Z"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **POST `/users`** (admin)
  - Request
    ```json
    {"email":"alex@example.com","password":"AdminPass!1","role":"ADMIN","firstName":"Alex"}
    ```
  - Response
    ```json
    {"success":true,"message":"User created","data":{"id":"usr_admin","email":"alex@example.com","role":"ADMIN"}}
    ```
- **GET `/users`** (admin)
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"usr_123","email":"sara@example.com"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **GET `/users/:id`**, **PATCH `/users/:id`**, **PATCH `/users/:id/deactivate`**, **DELETE `/users/:id`** (admin)
  - Response (fetch/update/deactivate)
    ```json
    {"success":true,"message":"OK","data":{"id":"usr_123","email":"sara@example.com","isActive":true}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"User deleted"}
    ```

### Itineraries
- **POST `/itineraries`**
  - Request
    ```json
    {"destination":"Paris","travelers":2,"startDate":"2025-01-10","endDate":"2025-01-12","days":[{"dayNumber":1,"activities":[{"title":"Check in","order":1,"time":"10:00"}]}]}
    ```
  - Response
    ```json
    {"success":true,"message":"Itinerary created","data":{"id":"iti_1","destination":"Paris","days":[{"dayNumber":1,"activities":[{"title":"Check in","time":"10:00"}]}]}}
    ```
- **GET `/itineraries`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"iti_1","destination":"Paris","status":"DRAFT"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **GET `/itineraries/:id`**, **PATCH `/itineraries/:id`**, **DELETE `/itineraries/:id`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"id":"iti_1","destination":"Paris","collaborators":[]}}
    ```
- **PATCH `/itineraries/:id/send`** / **PATCH `/itineraries/:id/confirm`**
  - Response
    ```json
    {"success":true,"message":"Itinerary sent","data":{"id":"iti_1","status":"SENT"}}
    ```
- **GET `/itineraries/:id/versions`** / **GET `/itineraries/:id/versions/:versionId`**
  - Response (list)
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"ver_1","version":1,"snapshotAt":"2024-06-01T10:00:00.000Z"}]}}
    ```
  - Response (detail)
    ```json
    {"success":true,"message":"OK","data":{"id":"ver_1","version":1,"itinerary":{"destination":"Paris"}}}
    ```
- **POST `/itineraries/:id/versions/:versionId/restore`**
  - Response
    ```json
    {"success":true,"message":"Version restored","data":{"id":"iti_1","destination":"Paris"}}
    ```
- **POST `/itineraries/:id/collaborators`** / **GET `/itineraries/:id/collaborators`** / **DELETE `/itineraries/:id/collaborators/:userId`**
  - Request (add)
    ```json
    {"userId":"usr_456"}
    ```
  - Response (add/list)
    ```json
    {"success":true,"message":"Collaborator added","data":{"items":[{"userId":"usr_456","email":"collab@example.com"}]}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"Collaborator removed"}
    ```

### Bookings
- **POST `/bookings`**
  - Request
    ```json
    {"itineraryId":"iti_1","totalPrice":1200,"type":"PACKAGE","tourType":"GUIDED"}
    ```
  - Response
    ```json
    {"success":true,"message":"Booking created","data":{"id":"bok_1","bookingCode":"BV-2025-001","status":"DRAFT"}}
    ```
- **GET `/bookings/my-bookings`** / **GET `/bookings/shared-with-me`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"bok_1","bookingCode":"BV-2025-001"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **GET `/bookings/:id`**, **PUT `/bookings/:id`**, **PATCH `/bookings/:id/submit`**, **PATCH `/bookings/:id/cancel`**, **DELETE `/bookings/:id`**
  - Response (detail/update/submit/cancel)
    ```json
    {"success":true,"message":"OK","data":{"id":"bok_1","status":"SUBMITTED","itineraryId":"iti_1"}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"Booking deleted"}
    ```
- **POST `/bookings/:id/collaborators`** / **GET `/bookings/:id/collaborators`** / **DELETE `/bookings/:id/collaborators/:collaboratorUserId`**
  - Request (add)
    ```json
    {"userId":"usr_456"}
    ```
  - Response (add/list)
    ```json
    {"success":true,"message":"Collaborator added","data":{"items":[{"userId":"usr_456","email":"collab@example.com"}]}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"Collaborator removed"}
    ```
- **GET `/bookings/admin/bookings`** (admin list)
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"bok_1","status":"SUBMITTED","ownerEmail":"sara@example.com"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **PATCH `/bookings/:id/status`** (admin approve/reject)
  - Request
    ```json
    {"status":"APPROVED","rejectionReason":null}
    ```
  - Response
    ```json
    {"success":true,"message":"Booking status updated","data":{"id":"bok_1","status":"APPROVED"}}
    ```
- **POST `/bookings/:id/payments`**
  - Request
    ```json
    {"amount":600,"method":"BANK_TRANSFER","reference":"TX123","attachmentUrl":"https://files.example.com/proof.png"}
    ```
  - Response
    ```json
    {"success":true,"message":"Payment recorded","data":{"id":"pay_1","bookingId":"bok_1","status":"PENDING"}}
    ```
- **GET `/bookings/:id/payments`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"pay_1","amount":600,"status":"PENDING"}]}}
    ```

### Payments
- **GET `/payments`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"pay_1","bookingId":"bok_1","status":"PENDING"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **POST `/payments/:id`**
  - Request
    ```json
    {"amount":1200,"method":"BANK_TRANSFER","reference":"TX999","attachmentUrl":"https://files.example.com/proof.png"}
    ```
  - Response
    ```json
    {"success":true,"message":"Payment recorded","data":{"id":"pay_2","bookingId":"bok_1","status":"PENDING"}}
    ```
- **GET `/payments/:id/proof`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"url":"https://files.example.com/proof.png"}}
    ```
- **PATCH `/payments/:id/status`** (admin)
  - Request
    ```json
    {"status":"VERIFIED","rejectionReason":null}
    ```
  - Response
    ```json
    {"success":true,"message":"Payment status updated","data":{"id":"pay_1","status":"VERIFIED"}}
    ```

### Notifications
- **GET `/notifications`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"noti_1","title":"Booking approved","isRead":false}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **PATCH `/notifications/:id/read`** / **PATCH `/notifications/read-all`**
  - Response
    ```json
    {"success":true,"message":"Marked read","data":{"count":1}}
    ```

### FAQs
- **GET `/faqs`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"faq_1","question":"How to book?","answer":"Use the booking form."}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **POST `/faqs`**, **PUT `/faqs/:id`**, **DELETE `/faqs/:id`** (admin)
  - Request (create)
    ```json
    {"question":"What is the refund policy?","answer":"Refunds processed within 7 days.","tags":["refund"]}
    ```
  - Response (create/update)
    ```json
    {"success":true,"message":"FAQ saved","data":{"id":"faq_2","question":"What is the refund policy?"}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"FAQ deleted"}
    ```

### AI & Chatbots
- **POST `/chatbots/roameo`**
  - Request
    ```json
    {"question":"What is the best time to visit Kyoto?"}
    ```
  - Response
    ```json
    {"success":true,"message":"OK","data":{"answer":"Spring is ideal.","confidence":0.82,"sources":["faq"]}}
    ```
- **POST `/chatbots/roaman`**
  - Request
    ```json
    {"prompt":"Plan a 3-day trip to Cebu","preferences":{"pace":"moderate"}}
    ```
  - Response
    ```json
    {"success":true,"message":"Draft ready","data":{"message":"Here is your plan","draftItinerary":{"destination":"Cebu","days":3}}}
    ```
- **POST `/ai/itinerary`**
  - Request
    ```json
    {"destination":"Cebu","startDate":"2025-03-01","endDate":"2025-03-03","travelers":2,"budget":35000,"travelPace":"moderate","preferences":["food","beaches"]}
    ```
  - Response
    ```json
    {"success":true,"message":"Itinerary generated","data":{"itinerary":[{"day":1,"title":"Arrival","items":["Check-in","Dinner"]}],"metadata":{"notes":"Deterministic output"}}}
    ```

### Activity Logs
- **GET `/activity-logs`** (admin)
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"log_1","action":"BOOKING_APPROVED","actorEmail":"admin@example.com"}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **GET `/activity-logs/:id`** (admin)
  - Response
    ```json
    {"success":true,"message":"OK","data":{"id":"log_1","action":"BOOKING_APPROVED","payload":{}}}
    ```
- **GET `/users/me/activity-logs`** (self) sample above in Users section.

### Inquiries & Feedback
- **GET `/inquiries`** / **POST `/inquiries`** / **POST `/inquiries/:id/messages`**
  - Request (create)
    ```json
    {"bookingId":"bok_1","title":"Question about schedule","message":"Can we move day 2 to afternoon?"}
    ```
  - Request (add message)
    ```json
    {"message":"Yes, we can adjust."}
    ```
  - Response (list/create/message)
    ```json
    {"success":true,"message":"Inquiry saved","data":{"items":[{"id":"inq_1","title":"Question about schedule","messages":[{"text":"Can we move day 2 to afternoon?"}]}]}}
    ```
- **POST `/feedback`** / **GET `/feedback`** / **PATCH `/feedback/:id/respond`**
  - Request (create)
    ```json
    {"rating":5,"message":"Great experience!"}
    ```
  - Response (create/list/respond)
    ```json
    {"success":true,"message":"Feedback recorded","data":{"items":[{"id":"fb_1","rating":5,"response":"Thanks!"}]}}
    ```

### Tour Packages
- **GET `/tour-packages`** / **GET `/tour-packages/:id`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"items":[{"id":"pkg_1","title":"Bohol Highlights","price":25000}],"meta":{"page":1,"limit":10,"total":1}}}
    ```
- **POST `/tour-packages`**, **PUT `/tour-packages/:id`**, **DELETE `/tour-packages/:id`** (admin)
  - Request (create)
    ```json
    {"title":"Bohol Highlights","price":25000,"durationDays":3,"isFeatured":true}
    ```
  - Response (create/update)
    ```json
    {"success":true,"message":"Tour package saved","data":{"id":"pkg_1","title":"Bohol Highlights"}}
    ```
  - Response (delete)
    ```json
    {"success":true,"message":"Tour package deleted"}
    ```

### Weather, Routes, Places
- **GET `/weather`** / **GET `/weather/forecast`**
  - Response (current)
    ```json
    {"success":true,"message":"OK","data":{"weather":{"temp":30.2,"description":"Clear"}}}
    ```
  - Response (forecast)
    ```json
    {"success":true,"message":"OK","data":{"forecast":[{"dt":"2024-06-01T12:00:00Z","temp":29.1}]}}
    ```
- **POST `/routes/calculate`** / **POST `/routes/optimize`**
  - Request (calculate)
    ```json
    {"origin":"Manila","destination":"Tagaytay","mode":"drive"}
    ```
  - Request (optimize)
    ```json
    {"stops":["Ayala","BGC","NAIA"],"mode":"drive"}
    ```
  - Response
    ```json
    {"success":true,"message":"OK","data":{"route":{"distance":65,"duration":5400,"polyline":"abcd"}}}
    ```
- **GET `/places/search`**
  - Response
    ```json
    {"success":true,"message":"OK","data":{"places":[{"name":"Ayala Center Cebu","lat":10.317,"lon":123.905}]}}
    ```

### Dashboard & Uploads
- **GET `/dashboard/stats`** (admin)
  - Response
    ```json
    {"success":true,"message":"OK","data":{"bookings":12,"revenue":500000,"users":320}}
    ```
- **POST `/upload/itinerary-thumbnail`**
  - Request
    ```json
    {"url":"https://images.example.com/placeholder.png"}
    ```
  - Response
    ```json
    {"success":true,"message":"Uploaded","data":{"url":"https://images.example.com/placeholder.png"}}
    ```

### Health
- **GET `/health`**
  - Response
    ```json
    {"success":true,"message":"API is healthy","timestamp":"2024-06-01T10:00:00.000Z"}
    ```

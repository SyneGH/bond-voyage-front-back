# ISSUE_MATRIX

Current requirement coverage, status, and residual risks.

| Requirement | Status | Coverage Highlights | Residual Risk/Notes |
| --- | --- | --- | --- |
| Itinerary vs Booking separation | Complete | Itinerary CRUD + collaborators; bookings require owner/admin on linked itinerary; snapshot stored on booking creation. | Legacy inline booking creation still supported for compatibility. |
| Itinerary flows (STANDARD/CUSTOMIZED/REQUESTED/SMART_TRIP) | Partial (REQUESTED stub, SMART_TRIP assisted) | Types supported in validators/DTOs; requested send/confirm endpoints present; Roaman produces SMART_TRIP drafts. | Requested flow logic minimal; SMART_TRIP draft not persisted automatically. |
| BV-YYYY-NNN booking codes | Complete | Transactional sequence per year in booking service; bookingCode returned in DTOs. | Keep sequence alignment during backfills; codes tied to calendar year. |
| Permissions (self vs admin) | Complete | Self endpoints for stats/activity logs; admin user management/audits; booking/itinerary ownership enforced. | Ensure clients honor owner-only booking creation. |
| ISO date/decimal serialization | Complete | Serializers return ISO strings; Prisma Decimal to number in DTOs. | Confirm new endpoints use serializers if added. |
| FAQ/Upload/Weather stubs | Complete | FAQ backed by `FaqEntry` with seed; upload thumbnail stub returns URL; weather normalized with mock fallback. | Upload remains placeholder storage. |
| Notifications lifecycle | Complete | Structured payload validation; emitted on booking/payment actions; pagination + mark-read endpoints. | No websocket push; relies on polling. |
| Auth refresh via body-first | Complete | `/auth/refresh-token` accepts body token with cookie fallback; validators enforce presence. | None. |
| Chatbots (Roameo/Roaman) | Complete (with env gating) | Gemini-backed; Roameo strict FAQ RAG; Roaman returns friendly message + SMART_TRIP JSON without DB writes. | Returns 501 if Gemini env missing; FAQ search keyword-based only. |
| Auditing (Phase I) | Complete | Admin/global and self-scoped activity-log queries with pagination and filters. | Action filter substring-based; legacy strings may not match enum names. |

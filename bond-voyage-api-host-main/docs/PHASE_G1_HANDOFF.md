# PHASE G1 HANDOFF — Auth Refresh (Body + Cookie)

## Endpoint
- `POST /api/v1/auth/refresh-token`
  - Request (JSON): `{ "refreshToken": "<token>" }`
  - Fallback: cookie `refreshToken` when body is absent.
  - Precedence: body token wins over cookie.
  - Response: `{ "accessToken": "<jwt>" }`
  - Errors: `401` for missing/invalid/expired tokens; `400` for bad JSON shape.

## Curl Examples
- Body token
```bash
curl -X POST http://localhost:8087/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh-token>"}'
```

- Cookie fallback
```bash
curl -X POST http://localhost:8087/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  --cookie "refreshToken=<refresh-token>"
```

## Notes
- No migration required.
- Compatible with existing cookie-based clients; mobile/SPA can send JSON body.
- Returns `401` instead of `500` when token is missing/invalid.

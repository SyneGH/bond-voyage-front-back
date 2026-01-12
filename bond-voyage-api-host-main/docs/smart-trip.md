# Smart Trip quick checks

## Generate an AI itinerary (stateless, no auth required)
```bash
curl -X POST http://localhost:8087/api/v1/ai/itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Cebu",
    "startDate": "2025-03-01",
    "endDate": "2025-03-03",
    "travelers": 2,
    "budget": 35000,
    "travelPace": "moderate",
    "preferences": ["food", "beach"]
  }'
```

### Expected response shape
```json
{
  "data": {
    "itinerary": [
      {
        "day": 1,
        "title": "Day 1: Cebu highlights",
        "activities": [
          {"time": "08:00", "title": "Explore the city's iconic landmarks", "iconKey": "sightseeing"}
        ]
      }
    ],
    "metadata": {
      "destination": "Cebu",
      "startDate": "2025-03-01",
      "endDate": "2025-03-03",
      "travelers": 2,
      "budget": 35000,
      "travelPace": "moderate",
      "preferences": ["food", "beach"]
    }
  }
}
```

Notes:
- Deterministic helper (no Gemini dependency); validates date order and trip length (≤30 days).
- Activities rotate icons based on preferences; allowed `travelPace` values: `relaxed`, `moderate`, `packed`, `own_pace`.
- To save a trip, create an itinerary first then create a booking as the itinerary owner (collaborators cannot create bookings).

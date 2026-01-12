export const SMART_TRIP_ICON_KEYS = [
  "sightseeing",
  "museum",
  "food",
  "cafe",
  "nightlife",
  "shopping",
  "nature",
  "beach",
  "hiking",
  "relax",
  "culture",
  "activity",
  // New additions for Smart Trip / Roaman
  "adventure",
  "relaxation",
  "transport",
] as const;

export type SmartTripIconKey = (typeof SMART_TRIP_ICON_KEYS)[number];

export const SMART_TRIP_TRAVEL_PACES = [
  "relaxed",
  "moderate",
  "packed",
  "own_pace",
] as const;

export type SmartTripTravelPace = (typeof SMART_TRIP_TRAVEL_PACES)[number];

// Coordinate bounds for Philippines (for validation/fallback)
export const PH_BOUNDS = {
  lat: { min: 4.5, max: 21.5 },
  lng: { min: 116.0, max: 127.0 },
};

// Default coordinates for popular destinations (fallback when Gemini unavailable)
export const PH_DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  cebu: { lat: 10.3157, lng: 123.8854 },
  palawan: { lat: 9.8349, lng: 118.7384 },
  boracay: { lat: 11.9674, lng: 121.9248 },
  bohol: { lat: 9.8500, lng: 124.1435 },
  siargao: { lat: 9.8482, lng: 126.0458 },
  manila: { lat: 14.5995, lng: 120.9842 },
  baguio: { lat: 16.4023, lng: 120.5960 },
  davao: { lat: 7.1907, lng: 125.4553 },
  ilocos: { lat: 17.5747, lng: 120.3870 },
  bicol: { lat: 13.1391, lng: 123.7438 },
};
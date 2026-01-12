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
] as const;

export type SmartTripIconKey = (typeof SMART_TRIP_ICON_KEYS)[number];

export const SMART_TRIP_TRAVEL_PACES = [
  "relaxed",
  "moderate",
  "packed",
  "own_pace",
] as const;

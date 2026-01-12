import {
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Car,
  MapPin,
} from "lucide-react";

export const getActivityIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("flight") || lowerTitle.includes("arrival"))
    return Plane;
  if (lowerTitle.includes("hotel") || lowerTitle.includes("check-in"))
    return Hotel;
  if (lowerTitle.includes("photo") || lowerTitle.includes("view"))
    return Camera;
  if (
    lowerTitle.includes("lunch") ||
    lowerTitle.includes("dinner") ||
    lowerTitle.includes("breakfast")
  )
    return UtensilsCrossed;
  if (lowerTitle.includes("transfer") || lowerTitle.includes("drive"))
    return Car;
  return MapPin;
};

import {
  Plane,
  Hotel,
  UtensilsCrossed,
  Car,
  Camera,
  Clock,
} from "lucide-react";

export const getIconForActivity = (
  title: string,
  description?: string
): any => {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description?.toLowerCase() || "";
  const combined = lowerTitle + " " + lowerDesc;

  if (
    combined.includes("flight") ||
    combined.includes("arrival") ||
    combined.includes("departure") ||
    combined.includes("airport")
  ) {
    return Plane;
  }
  if (
    combined.includes("hotel") ||
    combined.includes("check-in") ||
    combined.includes("resort") ||
    combined.includes("lodge") ||
    combined.includes("accommodation")
  ) {
    return Hotel;
  }
  if (
    combined.includes("meal") ||
    combined.includes("lunch") ||
    combined.includes("dinner") ||
    combined.includes("breakfast") ||
    combined.includes("food") ||
    combined.includes("restaurant")
  ) {
    return UtensilsCrossed;
  }
  if (
    combined.includes("transfer") ||
    combined.includes("drive") ||
    combined.includes("transport") ||
    combined.includes("bus") ||
    combined.includes("car")
  ) {
    return Car;
  }
  if (
    combined.includes("photo") ||
    combined.includes("view") ||
    combined.includes("sight") ||
    combined.includes("visit") ||
    combined.includes("tour") ||
    combined.includes("explore") ||
    combined.includes("museum") ||
    combined.includes("sunset") ||
    combined.includes("sunrise")
  ) {
    return Camera;
  }

  return Clock; // Default icon
};

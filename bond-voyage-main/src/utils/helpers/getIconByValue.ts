import { MapPin } from "lucide-react";
import { ICON_OPTIONS } from "../constants/constants";

export const getIconByValue = (value: string) => {
  const found = ICON_OPTIONS.find((option) => option.value === value);
  return found ? found.icon : MapPin;
};

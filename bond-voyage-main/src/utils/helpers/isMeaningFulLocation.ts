export const isMeaningfulLocation = (location: string): boolean => {
  if (!location) return false;

  return location.trim().length >= 3;
};

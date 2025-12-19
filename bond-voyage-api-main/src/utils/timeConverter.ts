type TimeUnit = "second" | "minute" | "hour" | "day" | "week";

export const toMilliseconds = (value: number, unit: TimeUnit): number => {
  const conversions = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
  };

  return value * conversions[unit];
};

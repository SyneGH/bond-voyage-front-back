export const convertTimeStringToPhilippineTime = (
  timeString: string
): string => {
  const [hours, minutes] = timeString.split(":").map(Number);

  const now = new Date();
  const dateWithTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  return dateWithTime.toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

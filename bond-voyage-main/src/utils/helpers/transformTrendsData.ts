interface MonthlyBookingData {
  month: string;
  bookings: number;
  predicted: boolean;
}

export const transformTrendsData = (
  historical: number[],
  labels: string[],
  predicted: number[]
): MonthlyBookingData[] => {
  const monthNames = labels.map((label) => {
    return label.substring(0, 3);
  });

  const allBookings = [...historical, ...predicted];

  return allBookings.map((bookings, index) => ({
    month: monthNames[index] || `Month ${index + 1}`,
    bookings: bookings,
    predicted: index >= historical.length,
  }));
};

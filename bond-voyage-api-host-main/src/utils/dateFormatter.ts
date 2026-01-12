export const formatDisplayDate = (date?: Date | string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  // Returns format: "Jan 2, 2026, 12:11 PM"
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(d);
};

export const parseBookingDate = (dateString: string | Date | undefined): Date | undefined => {
  if (!dateString) return undefined;
  
  if (dateString instanceof Date) return dateString;

  return new Date(dateString); 
};

/**
 * Format date for display: "Jan 7, 2026"
 */
export const formatDateOnly = (date?: Date | string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

/**
 * Format date and time for display: "Jan 7, 2026, 2:43 PM"
 */
export const formatDateTime = (date?: Date | string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

/**
 * Format date range for display: "Jan 7 – Jan 10, 2026"
 */
export const formatDateRange = (
  startDate?: Date | string | null,
  endDate?: Date | string | null
): string | null => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const sameDay = sameMonth && start.getDate() === end.getDate();
  
  if (sameDay) {
    // Same day: "Jan 7, 2026"
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(start);
  } else if (sameMonth) {
    // Same month: "Jan 7 – 10, 2026"
    return `${new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(start)} – ${end.getDate()}, ${end.getFullYear()}`;
  } else if (sameYear) {
    // Same year: "Jan 7 – Feb 10, 2026"
    return `${new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(start)} – ${new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(end)}, ${end.getFullYear()}`;
  } else {
    // Different years: "Dec 28, 2025 – Jan 3, 2026"
    return `${new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(start)} – ${new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(end)}`;
  }
};
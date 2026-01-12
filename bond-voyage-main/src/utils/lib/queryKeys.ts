export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: any) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    myBookings: (params?: any) => ["bookings", "my", params] as const,
    adminBookings: (params?: any) => ["bookings", "admin", params] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
    collaborators: (id: string) => ["bookings", id, "collaborators"] as const,
  },
  tourPackages: {
    all: ["tourPackages"] as const,
    list: (params?: any) => ["tourPackages", "list", params] as const,
    detail: (id: string) => ["tourPackages", "detail", id] as const,
  },
  payments: {
    list: (params?: any) => ["payments", "list", params] as const,
    proof: (id: string) => ["payments", id, "proof"] as const,
  },
  inquiries: {
    all: ["inquiries"] as const,
    list: (params?: any) => ["inquiries", "list", params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    list: (params?: any) => ["feedback", "list", params] as const,
  },
  activityLogs: {
    all: ["activityLogs"] as const,
    list: (params?: any) => ["activityLogs", "list", params] as const,
  },
  weather: {
    current: (lat: number, lng: number) => ["weather", lat, lng] as const,
  },
  dashboard: {
    stats: (year?: number) => ["dashboard", "stats", year] as const,
  },
  faqs: {
    all: ["faqs"] as const,
    list: (params?: any) => [...queryKeys.faqs.all, "list", params] as const,
  },
  places: {
    all: ["places"] as const,
    search: (params?: any) => [...queryKeys.places.all, "search", params],
  },
};

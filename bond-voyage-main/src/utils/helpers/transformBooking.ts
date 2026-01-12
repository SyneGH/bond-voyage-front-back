export const transformBooking = (apiBooking: any, currentUserId: string) => {
  let startDate = apiBooking.startDate || "";
  let endDate = apiBooking.endDate || "";
  let formattedDates = "";

  if (startDate && endDate) {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    formattedDates = `${start} - ${end}`;
  } else if (apiBooking.itinerary?.startDate && apiBooking.itinerary?.endDate) {
    const start = new Date(apiBooking.itinerary.startDate).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
    const end = new Date(apiBooking.itinerary.endDate).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
    formattedDates = `${start} - ${end}`;
    startDate = apiBooking.itinerary.startDate;
    endDate = apiBooking.itinerary.endDate;
  } else {
    formattedDates = "Dates not set";
  }

  let bookedDate;
  if (apiBooking.bookedDate) {
    bookedDate = new Date(apiBooking.bookedDate).toLocaleDateString("en-US");
  } else if (apiBooking.createdAt) {
    bookedDate = new Date(apiBooking.createdAt).toLocaleDateString("en-US");
  } else {
    bookedDate = "N/A";
  }

  const customerName = apiBooking.customerName || "Unknown Customer";

  const ownership = determineOwnership(apiBooking, currentUserId);
  // Format total price
  const totalAmount = apiBooking.totalPrice || 0;
  const budget = `₱${totalAmount.toLocaleString()}`;

  // Transform itinerary days
  const itinerary =
    apiBooking.itinerary?.days?.map((day: any) => ({
      dayNumber: day.dayNumber,
      activities:
        day.activities?.map((activity: any) => ({
          id: activity.id,
          time: activity.time,
          title: activity.title,
          description: activity.description || "",
          location: activity.location || "",
          order: activity.order,
          icon: activity.icon || "Clock",
        })) || [],
    })) || [];

  return {
    id: apiBooking.id,
    bookingCode:
      apiBooking.bookingCode || `BV-${apiBooking.id.substring(0, 8)}`,
    owner: customerName,
    email: apiBooking.customerEmail || "",
    mobile: apiBooking.customerMobile || "",
    destination: apiBooking.destination,
    dates: formattedDates,
    startDate: startDate,
    endDate: endDate,
    travelers: apiBooking.travelers || 1,
    budget: budget,
    totalAmount: totalAmount,
    bookedDate: bookedDate,
    createdOn: new Date(apiBooking.createdAt).toLocaleDateString("en-US"),
    status: apiBooking.status?.toLowerCase() || "draft",
    bookingType: apiBooking.type || "CUSTOMIZED",
    tourType: apiBooking.tourType || "PRIVATE",
    rejectionReason: apiBooking.rejectionReason,
    rejectionResolution: apiBooking.rejectionResolution,
    resolutionStatus: apiBooking.isResolved ? "resolved" : "unresolved",
    ownership: ownership,
    itinerary: itinerary,
    paymentStatus: apiBooking.paymentStatus,
    itineraryId: apiBooking.itineraryId,
    userId: apiBooking.userId,
    isRequested: apiBooking.type === "REQUESTED",
  };
};

const determineOwnership = (
  booking: any,
  currentUserId: string
): "owned" | "collaborated" | "requested" => {
  if (booking.type === "REQUESTED") {
    return "requested";
  }

  if (booking.userId === currentUserId) {
    return "owned";
  }

  if (
    booking.itinerary?.collaborators?.some(
      (collab: any) => collab.userId === currentUserId
    )
  ) {
    return "collaborated";
  }

  return "owned";
};

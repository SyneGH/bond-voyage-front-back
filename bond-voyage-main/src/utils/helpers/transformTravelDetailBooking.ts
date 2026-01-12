import { getActivityIcon } from "./getActivityIcon";

export const transformDetailedBooking = (apiBooking: any) => {
  const totalAmount = parseFloat(apiBooking.totalPrice) || 0;

  const allPayments = apiBooking.payments || [];

  const verifiedPayments = allPayments.filter(
    (p: any) => p.status === "VERIFIED"
  );
  const totalPaid = verifiedPayments.reduce(
    (sum: number, p: any) => sum + parseFloat(p.amount),
    0
  );

  let paymentStatus = "Unpaid";
  if (totalPaid >= totalAmount) {
    paymentStatus = "Paid";
  } else if (totalPaid > 0) {
    paymentStatus = "Partial";
  }

  const paymentHistory = allPayments.map((p: any) => ({
    id: apiBooking.id,
    paymentType: p.type === "FULL" ? "Full Payment" : "Partial Payment",
    amount: parseFloat(p.amount),
    modeOfPayment: p.method === "GCASH" ? "Gcash" : "Cash",
    proofOfPayment: p.proofImage
      ? p.proofImage.startsWith("data:")
        ? p.proofImage
        : `${import.meta.env.VITE_API_BASE_URL}/payments/${p.id}/proof`
      : undefined,
    submittedAt: p.createdAt,
    status: p.status?.toLowerCase(),
    transactionId: p.transactionId,
  }));

  return {
    id: apiBooking.id,
    bookingCode: apiBooking.bookingCode,
    customer:
      `${apiBooking.user?.firstName || ""} ${
        apiBooking.user?.lastName || ""
      }`.trim() || "Unknown Customer",
    email: apiBooking.user?.email || "",
    mobile: "N/A",
    destination: apiBooking.destination,
    itinerary: apiBooking.destination,
    startDate: apiBooking.startDate,
    endDate: apiBooking.endDate,
    travelers: apiBooking.travelers,
    totalAmount: totalAmount,
    paid: totalPaid,
    paymentStatus: paymentStatus,
    bookedDate: apiBooking.createdAt,
    bookedDateObj: new Date(apiBooking.createdAt),
    status: apiBooking.status,
    bookingType: apiBooking.type,
    tourType: apiBooking.tourType,
    rejectionReason: apiBooking.rejectionReason,
    rejectionResolution: apiBooking.rejectionResolution,
    resolutionStatus: apiBooking.isResolved ? "resolved" : "unresolved",

    paymentHistory: paymentHistory,
    totalPaid: totalPaid,
    bookingSource: apiBooking.type,
    itineraryDetails:
      apiBooking.itinerary?.days?.map((day: any) => ({
        day: day.dayNumber,
        title: `Day ${day.dayNumber}`,
        activities:
          day.activities?.map((act: any) => ({
            time: act.time,
            icon: getActivityIcon(act.title),
            title: act.title,
            description: act.description || "",
            location: act.location || "",
          })) || [],
      })) || [],
  };
};

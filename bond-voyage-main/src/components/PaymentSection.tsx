// PaymentSection.tsx - Fixed version
import {
  CreditCard,
  Wallet,
  CheckCircle2,
  X,
  Clock,
  ChevronRight,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdatePaymentStatus } from "../hooks/usePayments";
import { PaymentDetailModal } from "./PaymentDetailModal";
import { PaymentVerificationModal } from "./PaymentVerificationModal";
import { useBookingPayments } from "../hooks/useBookings";

interface PaymentSubmission {
  id: string;
  bookingId: string;
  submittedById: string;
  amount: string;
  method: "GCASH" | "CASH";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  type: "FULL" | "PARTIAL";
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaymentSectionProps {
  booking: {
    id: string;
    totalAmount: number;
    totalPaid: number;
    paymentStatus: string;
  };
  onPaymentUpdate?: () => void;
}

export function PaymentSection({
  booking,
  onPaymentUpdate,
}: PaymentSectionProps) {
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentSubmission | null>(null);
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Reset all state when booking changes
  useEffect(() => {
    setSelectedPayment(null);
    setPaymentDetailModalOpen(false);
    setVerificationModalOpen(false);
    setRejectionReason("");
  }, [booking.id]);

  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isFetching: isPaymentsFetching,
    refetch: refetchPayment,
  } = useBookingPayments(booking.id);

  const payments: PaymentSubmission[] = paymentsResponse?.data || [];

  const verifiedTotalPaid = payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const pendingPaymentsCount = payments.filter(
    (p) => p.status === "PENDING"
  ).length;

  const { totalAmount } = booking;
  const displayTotalPaid = verifiedTotalPaid;
  const displayBalance = totalAmount - verifiedTotalPaid;
  const displayProgressPercent =
    totalAmount > 0 ? Math.round((verifiedTotalPaid / totalAmount) * 100) : 0;

  const paymentSectionState =
    verifiedTotalPaid >= totalAmount
      ? "fullyPaid"
      : verifiedTotalPaid > 0
      ? "partial"
      : "unpaid";

  const updatePaymentStatus = useUpdatePaymentStatus(selectedPayment?.id || "");

  const handlePaymentItemClick = (payment: PaymentSubmission) => {
    setSelectedPayment(payment);
    setPaymentDetailModalOpen(true);
  };

  const handleVerifyPayment = async () => {
    if (!selectedPayment) return;

    try {
      await updatePaymentStatus.mutateAsync({ status: "VERIFIED" });
      toast.success("Payment verified successfully!");
      setPaymentDetailModalOpen(false);
      setSelectedPayment(null); // Clear selected payment after verification
      onPaymentUpdate?.();
      refetchPayment();
    } catch (error) {
      toast.error("Failed to verify payment");
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await updatePaymentStatus.mutateAsync({
        status: "REJECTED",
        rejectionReason: rejectionReason,
      });
      toast.success("Payment rejected successfully!");
      setVerificationModalOpen(false);
      setPaymentDetailModalOpen(false);
      setSelectedPayment(null); // Clear selected payment after rejection
      setRejectionReason("");
      onPaymentUpdate?.();
    } catch (error) {
      toast.error("Failed to reject payment");
    }
  };

  const handleOpenVerificationModal = (payment: PaymentSubmission) => {
    setSelectedPayment(payment);
    setVerificationModalOpen(true);
  };

  const formatPaymentMethod = (method: string) => {
    return method === "GCASH" ? "Gcash" : "Cash";
  };

  const formatPaymentType = (type: string) => {
    return type === "FULL" ? "Full Payment" : "Partial Payment";
  };

  const getPaymentAmount = (amount: string) => {
    return parseFloat(amount) || 0;
  };

  // Show loading state when data is loading OR fetching new data
  if (isPaymentsLoading || isPaymentsFetching) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden animate-pulse">
        <div className="relative p-6 border-b border-[#E5E7EB]">
          <div className="absolute inset-0 bg-linear-to-r from-[#10B981]/5 via-[#14B8A6]/5 to-[#0A7AFF]/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-200" />
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full bg-gray-100" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-32" />
              </div>
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no booking ID
  if (!booking.id) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-[#F8FAFB] to-[#E5E7EB] rounded-full flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-[#64748B]" />
        </div>
        <h4 className="text-lg font-semibold text-[#1A2B4F] mb-2">
          No Booking Selected
        </h4>
        <p className="text-sm text-[#64748B]">
          Please select a booking to view payment information
        </p>
      </div>
    );
  }

  // Render payment information
  return (
    <>
      {/* Payment Information Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
        <div className="relative p-6 border-b border-[#E5E7EB]">
          <div className="absolute inset-0 bg-linear-to-r from-[#10B981]/5 via-[#14B8A6]/5 to-[#0A7AFF]/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#10B981] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A2B4F] text-lg">
                  Payment Information
                </h3>
                <p className="text-sm text-[#64748B]">
                  Track customer payment progress
                </p>
              </div>
            </div>
            {pendingPaymentsCount > 0 && (
              <div className="bg-[#FFB84D] text-white text-xs font-medium px-2 py-1 rounded-full">
                {pendingPaymentsCount} Pending
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* UNPAID STATE */}
          {paymentSectionState === "unpaid" && (
            <div className="text-center py-8">
              {payments.length === 0 ? (
                // No payments at all
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-[#F8FAFB] to-[#E5E7EB] rounded-full flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-[#64748B]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#1A2B4F] mb-2">
                    No Payments Made
                  </h4>
                  <p className="text-sm text-[#64748B] mb-6">
                    Customer has not made any payments yet
                  </p>
                </>
              ) : (
                // Has pending payments (but no verified payments)
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-[#FFB84D] to-[#FF9800] rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#1A2B4F] mb-2">
                    Pending Payment Verification
                  </h4>
                  <p className="text-sm text-[#64748B] mb-6">
                    {pendingPaymentsCount} payment
                    {pendingPaymentsCount !== 1 ? "s" : ""} awaiting
                    verification
                  </p>
                </>
              )}

              {/* Balance information */}
              <div className="bg-linear-to-br from-[#F8FAFB] to-[#F1F5F9] rounded-2xl p-5 border border-[#E5E7EB] mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#64748B]">
                      Total Package Cost
                    </span>
                    <span className="font-bold text-[#1A2B4F] text-lg">
                      ₱
                      {totalAmount?.toLocaleString() || totalAmount?.toString()}
                    </span>
                  </div>

                  <div className="h-px bg-linear-to-r from-transparent via-[#E5E7EB] to-transparent" />

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                      <span className="text-sm font-medium text-[#1A2B4F]">
                        Outstanding Balance
                      </span>
                    </div>
                    <span className="font-bold text-[#EF4444] text-lg">
                      ₱{displayBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Show payment history if there are payments */}
              {payments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <h4 className="font-semibold text-[#1A2B4F]">
                        Payment History
                      </h4>
                    </div>
                    <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
                      {payments.length} total
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        onClick={() => handlePaymentItemClick(payment)}
                        className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                payment.method === "GCASH"
                                  ? "bg-[#0A7AFF]/10 text-[#0A7AFF]"
                                  : "bg-[#10B981]/10 text-[#10B981]"
                              }`}
                            >
                              {payment.method === "GCASH" ? (
                                <Smartphone className="w-5 h-5" />
                              ) : (
                                <Banknote className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2B4F]">
                                {formatPaymentType(payment.type)}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "en-PH",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-[#10B981]">
                                ₱
                                {getPaymentAmount(
                                  payment.amount
                                ).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 justify-end">
                                {payment.status === "VERIFIED" ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                    <span className="text-xs text-[#10B981]">
                                      Verified
                                    </span>
                                  </>
                                ) : payment.status === "REJECTED" ? (
                                  <>
                                    <X className="w-3 h-3 text-[#FF6B6B]" />
                                    <span className="text-xs text-[#FF6B6B]">
                                      Rejected
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-[#FFB84D]" />
                                    <span className="text-xs text-[#FFB84D]">
                                      Pending
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PARTIAL PAYMENT STATE */}
          {paymentSectionState === "partial" && (
            <>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#progressGradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${displayProgressPercent * 3.52} 352`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#1A2B4F]">
                      {displayProgressPercent}%
                    </span>
                    <span className="text-xs text-[#64748B]">Paid</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-linear-to-r from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-3 border border-[#10B981]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-xs font-medium text-[#10B981]">
                        Verified Amount Paid
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#10B981]">
                      ₱{displayTotalPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-linear-to-r from-[#EF4444]/10 to-[#F87171]/10 rounded-xl p-3 border border-[#EF4444]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-3.5 h-3.5 text-[#EF4444]" />
                      <span className="text-xs font-medium text-[#EF4444]">
                        Remaining Balance
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#EF4444]">
                      ₱{displayBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <h4 className="font-semibold text-[#1A2B4F]">
                        Recent Payments
                      </h4>
                    </div>
                    <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
                      {payments.length} transactions
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        onClick={() => handlePaymentItemClick(payment)}
                        className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                payment.method === "GCASH"
                                  ? "bg-[#0A7AFF]/10 text-[#0A7AFF]"
                                  : "bg-[#10B981]/10 text-[#10B981]"
                              }`}
                            >
                              {payment.method === "GCASH" ? (
                                <Smartphone className="w-5 h-5" />
                              ) : (
                                <Banknote className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2B4F]">
                                {formatPaymentType(payment.type)}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "en-PH",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-[#10B981]">
                                ₱
                                {getPaymentAmount(
                                  payment.amount
                                ).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 justify-end">
                                {payment.status === "VERIFIED" ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                    <span className="text-xs text-[#10B981]">
                                      Verified
                                    </span>
                                  </>
                                ) : payment.status === "REJECTED" ? (
                                  <>
                                    <X className="w-3 h-3 text-[#FF6B6B]" />
                                    <span className="text-xs text-[#FF6B6B]">
                                      Rejected
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-[#FFB84D]" />
                                    <span className="text-xs text-[#FFB84D]">
                                      Pending
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FULLY PAID STATE */}
          {paymentSectionState === "fullyPaid" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-linear-to-br from-[#10B981] to-[#14B8A6] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-[#1A2B4F] mb-2">
                Fully Paid
              </h4>
              <p className="text-sm text-[#64748B] mb-6">
                This booking has been completely paid.
              </p>

              <div className="bg-linear-to-br from-[#10B981]/10 to-[#14B8A6]/10 rounded-xl p-4 border border-[#10B981]/20 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">
                    Total Amount Paid
                  </span>
                  <span className="text-xl font-bold text-[#10B981]">
                    ₱{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment History for Fully Paid */}
              {payments.length > 0 && (
                <div className="text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#64748B]" />
                      <h4 className="font-semibold text-[#1A2B4F]">
                        Payment History
                      </h4>
                    </div>
                    <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-1 rounded-full">
                      {payments.length} transactions
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        onClick={() => handlePaymentItemClick(payment)}
                        className="group bg-white rounded-xl p-4 border border-[#E5E7EB] hover:border-[#0A7AFF] hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                payment.method === "GCASH"
                                  ? "bg-[#0A7AFF]/10 text-[#0A7AFF]"
                                  : "bg-[#10B981]/10 text-[#10B981]"
                              }`}
                            >
                              {payment.method === "GCASH" ? (
                                <Smartphone className="w-5 h-5" />
                              ) : (
                                <Banknote className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1A2B4F]">
                                {formatPaymentType(payment.type)}
                              </p>
                              <p className="text-xs text-[#94A3B8]">
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "en-PH",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-[#10B981]">
                                ₱
                                {getPaymentAmount(
                                  payment.amount
                                ).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 justify-end">
                                {payment.status === "VERIFIED" ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                    <span className="text-xs text-[#10B981]">
                                      Verified
                                    </span>
                                  </>
                                ) : payment.status === "REJECTED" ? (
                                  <>
                                    <X className="w-3 h-3 text-[#FF6B6B]" />
                                    <span className="text-xs text-[#FF6B6B]">
                                      Rejected
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-[#FFB84D]" />
                                    <span className="text-xs text-[#FFB84D]">
                                      Pending
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#0A7AFF]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentDetailModal
        open={paymentDetailModalOpen}
        onOpenChange={setPaymentDetailModalOpen}
        payment={selectedPayment}
        onVerify={handleVerifyPayment}
        onReject={handleOpenVerificationModal}
      />

      <PaymentVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        payment={selectedPayment}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onConfirm={handleRejectPayment}
      />
    </>
  );
}

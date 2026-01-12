import {
  CreditCard,
  CheckCircle2,
  X,
  Clock,
  Shield,
  AlertCircle,
  Smartphone,
  Banknote,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { usePaymentProof } from "../hooks/useBookings";
import { useQueryClient } from "@tanstack/react-query"; // Add this
import { useState, useEffect, useMemo } from "react";
import { queryKeys } from "../utils/lib/queryKeys"; // Import queryKeys

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
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface PaymentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentSubmission | null;
  onVerify: () => void;
  onReject: (payment: PaymentSubmission) => void;
}

export function PaymentDetailModal({
  open,
  onOpenChange,
  payment,
  onVerify,
  onReject,
}: PaymentDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const queryClient = useQueryClient(); // Get query client

  // Use the simpler hook
  const {
    data: proofBlob,
    isLoading: proofLoading,
    error: proofError,
    refetch,
  } = usePaymentProof(open && payment?.id ? payment.id : undefined);

  // Create object URL from blob
  const proofImageUrl = useMemo(() => {
    if (!proofBlob) return null;
    return URL.createObjectURL(proofBlob);
  }, [proofBlob]);

  // Cleanup object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (proofImageUrl) {
        URL.revokeObjectURL(proofImageUrl);
      }
    };
  }, [proofImageUrl]);

  // Reset cached data when modal closes
  useEffect(() => {
    if (!open && payment?.id) {
      // Remove the cached proof data for this payment
      queryClient.removeQueries({
        queryKey: [queryKeys.payments.proof, payment.id],
      });
    }
  }, [open, payment?.id, queryClient]);

  useEffect(() => {
    if (open && payment) {
      setImageLoaded(false);
    }
  }, [open, payment?.id]);

  useEffect(() => {
    if (open && payment?.id) {
      refetch();
    }
  }, [open, payment?.id, refetch]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Check if we should show proof image
  const shouldShowProofImage = proofImageUrl && !proofLoading && !proofError;

  if (!payment) return null;

  const getPaymentVerificationStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20";
      case "rejected":
        return "bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] border-[#FF6B6B]/20";
      case "pending":
      default:
        return "bg-[rgba(255,184,77,0.1)] text-[#FFB84D] border-[#FFB84D]/20";
    }
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

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0A7AFF]" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive information about the selected payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-[#0A7AFF] to-[#14B8A6] rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {formatPaymentType(payment.type)}
                </h3>
                <p className="text-white/80 text-sm">
                  {new Date(payment.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Amount Paid</p>
                <p className="text-2xl font-bold">
                  ₱{getPaymentAmount(payment.amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-[#64748B]">Payment ID</Label>
                <p className="text-sm font-medium text-[#1A2B4F]">
                  {payment.id}
                </p>
              </div>
              <div>
                <Label className="text-sm text-[#64748B]">Payment Type</Label>
                <p className="text-sm font-medium text-[#1A2B4F]">
                  {formatPaymentType(payment.type)}
                </p>
              </div>
              {payment.transactionId && (
                <div>
                  <Label className="text-sm text-[#64748B]">
                    Transaction ID
                  </Label>
                  <p className="text-sm font-medium text-[#1A2B4F]">
                    {payment.transactionId}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-[#64748B]">
                  Mode of Payment
                </Label>
                <div className="flex items-center gap-2">
                  {payment.method === "CASH" ? (
                    <Banknote className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-[#0A7AFF]" />
                  )}
                  <p className="text-sm font-medium text-[#1A2B4F]">
                    {formatPaymentMethod(payment.method)}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-[#64748B]">Status</Label>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getPaymentVerificationStatusColor(
                    payment.status
                  )}`}
                >
                  {formatStatus(payment.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Submitted By Information */}
          {payment.submittedBy && (
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-[#0A7AFF]" />
                <h4 className="text-sm font-medium text-[#1A2B4F]">
                  Submitted By
                </h4>
              </div>
              <div className="space-y-2 text-sm text-[#64748B]">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium text-[#1A2B4F]">
                    {payment.submittedBy.firstName}{" "}
                    {payment.submittedBy.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium text-[#1A2B4F]">
                    {payment.submittedBy.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Info */}
          {(payment.status === "VERIFIED" || payment.status === "REJECTED") && (
            <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-[#10B981]" />
                <h4 className="text-sm font-medium text-[#1A2B4F]">
                  Payment Verification
                </h4>
              </div>
              <div className="space-y-2 text-sm text-[#64748B]">
                <div className="flex justify-between">
                  <span>Verified By:</span>
                  <span className="font-medium text-[#1A2B4F]">
                    {payment.verifiedBy || "Admin"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Verified At:</span>
                  <span className="font-medium text-[#1A2B4F]">
                    {payment.verifiedAt
                      ? new Date(payment.verifiedAt).toLocaleDateString(
                          "en-PH",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
                {payment.status === "REJECTED" && payment.rejectionReason && (
                  <div className="flex justify-between">
                    <span>Rejection Reason:</span>
                    <span className="font-medium text-[#FF6B6B] text-right max-w-xs">
                      {payment.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proof of Payment */}
          <div>
            <Label className="text-sm font-medium text-[#1A2B4F] mb-3 block">
              Proof of Payment
            </Label>

            {proofLoading ? (
              <div className="text-center py-12 border-2 border-dashed border-[#E5E7EB] rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#64748B] animate-spin" />
                  <p className="text-sm text-[#64748B]">
                    Loading proof of payment...
                  </p>
                </div>
              </div>
            ) : shouldShowProofImage ? (
              <div className="space-y-4">
                <div className="border-2 border-[#E5E7EB] rounded-xl overflow-hidden relative min-h-[200px]">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFB]">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#64748B] animate-spin" />
                        <p className="text-xs text-[#64748B]">
                          Loading image...
                        </p>
                      </div>
                    </div>
                  )}
                  <img
                    src={proofImageUrl}
                    alt="Proof of payment"
                    className={`w-full max-h-96 object-contain bg-[#F8FAFB] mx-auto transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-[#E5E7EB] rounded-xl">
                <AlertCircle className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-sm text-[#64748B]">
                  {proofError
                    ? "Failed to load proof"
                    : "No proof of payment available"}
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  {proofError
                    ? "Could not load the proof image"
                    : "Payment was made without uploaded proof"}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-[#F8FAFB] rounded-lg p-4 border border-[#E5E7EB]">
            <h4 className="text-sm font-medium text-[#1A2B4F] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0A7AFF]" />
              Transaction Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A2B4F]">
                    Payment Submitted
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {new Date(payment.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {payment.status === "VERIFIED" && payment.verifiedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A2B4F]">
                      Payment Verified
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(payment.verifiedAt).toLocaleDateString(
                        "en-PH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
              {payment.status === "REJECTED" && payment.verifiedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A2B4F]">
                      Payment Rejected
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(payment.verifiedAt).toLocaleDateString(
                        "en-PH",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {payment.status === "PENDING" && (
            <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={onVerify}
                className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] text-white font-medium hover:from-[#0DA271] hover:to-[#0F9B8E] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Verify Payment
              </button>
              <button
                onClick={() => onReject(payment)}
                className="flex-1 h-11 px-4 rounded-xl border-2 border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject Payment
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

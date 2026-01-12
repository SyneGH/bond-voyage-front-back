import {
  CreditCard,
  CheckCircle2,
  X,
  Clock,
  Shield,
  AlertCircle,
  Smartphone,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button as ShadcnButton } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { PaymentSubmission } from "./PaymentSection";

interface PaymentVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentSubmission | null;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onConfirm: (payment: PaymentSubmission) => void;
}

export function PaymentVerificationModal({
  open,
  onOpenChange,
  payment,
  rejectionReason,
  onRejectionReasonChange,
  onConfirm,
}: PaymentVerificationModalProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
            Reject Payment
          </DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this payment submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-8">
          <div>
            <Label
              htmlFor="rejection-reason"
              className="text-[#1A2B4F] mb-2 block"
            >
              Reason for Rejection
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
              className="min-h-[100px] rounded-xl border-2 border-[#E5E7EB] focus:border-[#FF6B6B] focus:ring-4 focus:ring-[rgba(255,107,107,0.1)] transition-all"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-[#E5E7EB] bg-[#F8FAFB]">
          <button
            onClick={() => {
              onOpenChange(false);
              onRejectionReasonChange("");
            }}
            className="flex-1 h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] font-medium hover:bg-[#F8FAFB] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(payment)}
            disabled={!rejectionReason.trim()}
            className="flex-1 h-11 px-4 rounded-xl bg-[#FF6B6B] text-white font-medium hover:bg-[#FF5252] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject Payment
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

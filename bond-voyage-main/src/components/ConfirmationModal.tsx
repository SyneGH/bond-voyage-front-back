import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ReactNode } from "react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon: ReactNode;
  iconGradient: string;
  iconShadow: string;
  contentGradient: string;
  contentBorder: string;
  content: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "success";
  isLoading?: boolean;
  hideCancelButton?: boolean;
  hideConfirmButton?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconGradient,
  iconShadow,
  contentGradient,
  contentBorder,
  content,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  isLoading = false,
  hideCancelButton = false,
  hideConfirmButton = false,
}: ConfirmationModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const getConfirmButtonClasses = () => {
    switch (confirmVariant) {
      case "destructive":
        return "h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] hover:from-[#FF5252] hover:to-[#FF3838] text-white font-medium shadow-lg shadow-[#FF6B6B]/20 transition-all disabled:opacity-50";
      case "success":
        return "h-11 px-6 rounded-xl bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#0EA574] hover:to-[#12A594] text-white font-medium shadow-lg shadow-[#10B981]/20 transition-all disabled:opacity-50";
      default:
        return "h-11 px-6 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#3B9EFF] hover:from-[#0865CC] hover:to-[#2A8FFF] text-white font-medium shadow-lg shadow-[#0A7AFF]/20 transition-all disabled:opacity-50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[calc(100vw-2rem)] sm:max-w-[540px] max-h-[85vh] overflow-y-auto"
        {...(!description && { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconGradient} flex items-center justify-center shadow-lg ${iconShadow} flex-shrink-0`}>
              {icon}
            </div>
            <span className="break-words">{title}</span>
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {title}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mb-2">
          <div className={`${contentGradient} border ${contentBorder} rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative text-sm sm:text-base">
              {content}
            </div>
          </div>
        </div>

        {(!hideCancelButton || !hideConfirmButton) && (
          <DialogFooter className="flex-col sm:flex-row gap-2 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-2 sm:pt-4">
            {!hideCancelButton && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 rounded-xl border-2 border-[#E5E7EB] dark:border-[#2A3441] hover:border-[#CBD5E1] hover:bg-[#F8FAFB] dark:hover:bg-[#2A3441] text-[#334155] dark:text-white font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {cancelText}
              </button>
            )}
            {!hideConfirmButton && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full sm:w-auto ${getConfirmButtonClasses()} text-sm sm:text-base`}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

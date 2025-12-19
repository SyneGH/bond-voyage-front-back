"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  XCircle,
  X,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { DialogTitle, DialogDescription } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showToast, setShowToast] = useState<{
    type: "error" | "success" | "info";
    title: string;
    message: string;
  } | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return "Please enter your email address";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (pass: string) => {
    const requirements = {
      length: pass.length >= 8,
      number: /\d/.test(pass),
      lowercase: /[a-z]/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(newPassword);
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      setResendTimer(60);
      setShowToast({
        type: "success",
        title: "OTP Sent!",
        message: `We've sent a 6-digit code to ${email}`,
      });
      setTimeout(() => setShowToast(null), 4000);
    }, 1500);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
      setShowToast({
        type: "success",
        title: "Code Verified!",
        message: "Now create your new password",
      });
      setTimeout(() => setShowToast(null), 3000);
    }, 1500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;

    if (!allRequirementsMet) {
      setPasswordError("Password does not meet requirements");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (hasError) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowToast({
        type: "success",
        title: "Password Reset Successful!",
        message: "You can now log in with your new password",
      });
      
      setTimeout(() => {
        setShowToast(null);
        onClose();
        onBackToLogin();
      }, 2000);
    }, 1500);
  };

  const handleResendOTP = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setShowToast({
        type: "info",
        title: "New Code Sent!",
        message: `A new verification code has been sent to ${email}`,
      });
      setTimeout(() => setShowToast(null), 4000);
    }, 1000);
  };

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setEmailError("");
    setOtpError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setShowToast(null);
    setResendTimer(0);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(resetForm, 300);
    }
  }, [isOpen]);

  return (
    <>
      <style>{`
        @keyframes slideInTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-toast { animation: slideInTop 300ms ease-out; }
      `}</style>

      <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />
          <DialogPrimitive.Content
            className="fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] max-w-[500px] w-[95vw] p-0 overflow-hidden border-none gap-0 bg-white rounded-xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          >
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-lg p-2 opacity-70 transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none text-[#64748B] hover:text-[#1A2B4F] hover:bg-[#F8FAFB] z-10 cursor-pointer">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <div className="p-6 md:p-10">
              {/* Back Button */}
              {step !== "email" && (
                <button
                  onClick={() => {
                    if (step === "otp") setStep("email");
                    else if (step === "reset") setStep("otp");
                  }}
                  className="flex items-center gap-2 text-[#64748B] hover:text-[#0A7AFF] transition-colors mb-6 cursor-pointer"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {/* Header */}
              <div className="mb-8">
                <div className="text-[#0A7AFF] mb-2 uppercase tracking-wider" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {step === "email" ? "Forgot Password" : step === "otp" ? "Verify Code" : "Reset Password"}
                </div>
                <DialogTitle asChild>
                  <h2 className="text-[#1A2B4F] mb-2" style={{ fontSize: "28px", fontWeight: 700 }}>
                    {step === "email" && "Reset Your Password"}
                    {step === "otp" && "Enter Verification Code"}
                    {step === "reset" && "Create New Password"}
                  </h2>
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-[#64748B]" style={{ fontSize: "15px" }}>
                    {step === "email" && "We'll send you a verification code to reset your password"}
                    {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                    {step === "reset" && "Choose a strong password for your account"}
                  </p>
                </DialogDescription>
              </div>

              {/* Toast */}
              {showToast && (
                <div
                  className={`mb-6 flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border-l-4 animate-toast ${
                    showToast.type === "error"
                      ? "border-[#FF6B6B]"
                      : showToast.type === "success"
                        ? "border-[#10B981]"
                        : "border-[#0A7AFF]"
                  }`}
                >
                  {showToast.type === "error" ? (
                    <XCircle className="w-5 h-5 text-[#FF6B6B] flex-shrink-0" />
                  ) : showToast.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                  ) : (
                    <Mail className="w-5 h-5 text-[#0A7AFF] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-[#1A2B4F]" style={{ fontSize: "14px", fontWeight: 600 }}>
                      {showToast.title}
                    </div>
                    <div className="text-[#64748B] mt-1" style={{ fontSize: "13px" }}>
                      {showToast.message}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowToast(null)}
                    className="text-[#64748B] hover:text-[#1A2B4F] transition-colors flex-shrink-0 cursor-pointer"
                    style={{ fontSize: "20px" }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Step 1: Email Input */}
              {step === "email" && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-[#1A2B4F] mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        placeholder="you@example.com"
                        className={`w-full h-12 px-4 rounded-xl transition-all duration-200 outline-none ${
                          emailError
                            ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                            : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                        } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                        style={{ fontSize: "15px" }}
                      />
                    </div>
                    {emailError && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                        <span className="text-[#FF6B6B]" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {emailError}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className={`w-full h-12 px-6 rounded-xl border-none text-white transition-all flex items-center justify-center cursor-pointer ${
                      !email || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
                      boxShadow: "0 4px 12px rgba(10, 122, 255, 0.25)",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="text-[#64748B] hover:text-[#0A7AFF] transition-colors cursor-pointer"
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-[#1A2B4F] mb-3 text-center" style={{ fontSize: "14px", fontWeight: 600 }}>
                      Verification Code
                    </label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleOTPKeyDown(index, e)}
                          className={`w-12 h-12 text-center rounded-xl transition-all duration-200 outline-none ${
                            otpError
                              ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                              : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                          } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                          style={{ fontSize: "18px", fontWeight: 600 }}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" />
                        <span className="text-[#FF6B6B]" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {otpError}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className={`w-full h-12 px-6 rounded-xl border-none text-white transition-all flex items-center justify-center cursor-pointer ${
                      otp.join("").length !== 6 || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
                      boxShadow: "0 4px 12px rgba(10, 122, 255, 0.25)",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <div className="text-center pt-4">
                    {resendTimer > 0 ? (
                      <p className="text-[#64748B]" style={{ fontSize: "14px" }}>
                        Resend code in <span style={{ fontWeight: 600 }}>{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-[#0A7AFF] hover:text-[#3B9EFF] hover:underline transition-colors cursor-pointer"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Step 3: Reset Password */}
              {step === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="newPassword" className="block text-[#1A2B4F] mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                        placeholder="Create a strong password"
                        className={`w-full h-12 px-4 pr-12 rounded-xl transition-all duration-200 outline-none ${
                          passwordError
                            ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                            : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                        } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                        style={{ fontSize: "15px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.08)] p-1.5 rounded-md transition-all cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {newPassword && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${passwordRequirements.length ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                          <span className="text-[#64748B]" style={{ fontSize: "12px" }}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${passwordRequirements.uppercase && passwordRequirements.lowercase ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                          <span className="text-[#64748B]" style={{ fontSize: "12px" }}>
                            Upper & lowercase letters
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${passwordRequirements.number ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                          <span className="text-[#64748B]" style={{ fontSize: "12px" }}>
                            At least one number
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${passwordRequirements.special ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
                          <span className="text-[#64748B]" style={{ fontSize: "12px" }}>
                            At least one special character
                          </span>
                        </div>
                      </div>
                    )}

                    {passwordError && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                        <span className="text-[#FF6B6B]" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {passwordError}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-[#1A2B4F] mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmPasswordError("");
                        }}
                        placeholder="Re-enter your password"
                        className={`w-full h-12 px-4 pr-12 rounded-xl transition-all duration-200 outline-none ${
                          confirmPasswordError
                            ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                            : confirmPassword && newPassword === confirmPassword
                              ? "border-2 border-[#10B981] bg-white"
                              : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                        } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                        style={{ fontSize: "15px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.08)] p-1.5 rounded-md transition-all cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {confirmPassword && newPassword === confirmPassword && (
                        <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981]" />
                      )}
                    </div>
                    {confirmPasswordError && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                        <span className="text-[#FF6B6B]" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {confirmPasswordError}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !allRequirementsMet || !confirmPassword}
                    className={`w-full h-12 px-6 rounded-xl border-none text-white transition-all flex items-center justify-center cursor-pointer ${
                      !allRequirementsMet || !confirmPassword || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
                      boxShadow: "0 4px 12px rgba(10, 122, 255, 0.25)",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              )}

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span className="text-[#64748B]" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Your data is encrypted and secure
                </span>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

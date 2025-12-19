"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  XCircle,
  X,
} from "lucide-react";
import { DialogTitle, DialogDescription } from "./ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import bondVoyageLogo from "../assets/40755770f782ee2806bf45fc8b364947bbbe25e5.png";
import { SideType, useSide } from "../../SideContext";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { login } from "../utils/api/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onForgotPassword,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { switchSide } = useSide();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  const validateEmail = (value: string) => {
    if (!value) {
      return "Please enter a valid email address";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password must be at least 8 characters";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setEmailTouched(true);
    setPasswordTouched(true);

    setIsLoading(true);

    try {
      if (emailErr || passwordErr) {
        setShowToast({
          type: "error",
          title: "Login Failed",
          message:
            "Invalid email or password. Please check your credentials and try again.",
        });
        setTimeout(() => setShowToast(null), 6000);
        return;
      }

      const response = await login(email, password);

      if (response.status === 200) {
        const role = response.data.data.user.role.toLowerCase() as SideType;
        switchSide(role);

        setIsLoading(false);
        setShowToast({
          type: "success",
          title: "Login Successful!",
          message: "Welcome to BondVoyage. Redirecting to your dashboard...",
        });

        setTimeout(() => {
          setShowToast(null);
          if (role === "admin") navigate("/");
          else navigate("/user/home");
          onClose();
        }, 2000);
      }
    } catch (error) {
      setShowToast({
        type: "error",
        title: "Invalid Credentials",
        message: "Please try again.",
      });

      setIsLoading(false);

      setTimeout(() => {
        setShowToast(null);
      }, 2000);
    }
  };

  const emailIsValid = email && !validateEmail(email);
  const isFormValid = emailIsValid && password.length >= 8;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      setEmailTouched(false);
      setPasswordTouched(false);
      setShowToast(null);
    }
  }, [isOpen]);

  return (
    <>
      <style>{`
        @keyframes slideInTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInTopSmall {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-toast { animation: slideInTop 300ms ease-out; }
        .animate-error { animation: slideInTopSmall 200ms ease-out; }
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
          <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] max-w-[1200px] w-[95vw] p-0 overflow-hidden border-none gap-0 bg-white rounded-xl shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              {/* Left Column: Login Form */}
              <div className="flex-1 bg-white overflow-y-auto relative">
                <DialogPrimitive.Close className="absolute top-4 right-4 rounded-lg p-2 opacity-70 transition-all hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none text-[#64748B] hover:text-[#1A2B4F] hover:bg-[#F8FAFB] z-10">
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>

                <div className="p-6 md:p-10 max-w-[500px] mx-auto w-full">
                  <div className="mb-8">
                    <div
                      className="text-[#0A7AFF] mb-2 uppercase tracking-wider"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Log In
                    </div>
                    <DialogTitle asChild>
                      <h2
                        className="text-[#1A2B4F] mb-2"
                        style={{ fontSize: "28px", fontWeight: 700 }}
                      >
                        Continue Your{" "}
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          Adventure
                        </span>
                      </h2>
                    </DialogTitle>
                    <DialogDescription asChild>
                      <p
                        className="text-[#64748B]"
                        style={{ fontSize: "15px" }}
                      >
                        Access your trips, bookings, and travel plans
                      </p>
                    </DialogDescription>
                  </div>

                  {showToast && (
                    <div
                      className={`mb-6 flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border-l-4 animate-toast ${
                        showToast.type === "error"
                          ? "border-[#FF6B6B]"
                          : "border-[#10B981]"
                      }`}
                    >
                      {showToast.type === "error" ? (
                        <XCircle className="w-5 h-5 text-[#FF6B6B] flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div
                          className="text-[#1A2B4F]"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          {showToast.title}
                        </div>
                        <div
                          className="text-[#64748B] mt-1"
                          style={{ fontSize: "13px" }}
                        >
                          {showToast.message}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowToast(null)}
                        className="text-[#64748B] hover:text-[#1A2B4F] transition-colors flex-shrink-0"
                        style={{ fontSize: "20px" }}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[#1A2B4F] mb-2"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleEmailBlur}
                          placeholder="you@example.com"
                          className={`w-full h-12 px-4 rounded-xl transition-all duration-200 outline-none ${
                            emailTouched && emailError
                              ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                              : emailIsValid
                              ? "border-2 border-[#10B981] bg-white"
                              : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                          } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                          style={{ fontSize: "15px" }}
                        />
                        {emailIsValid && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981]" />
                        )}
                      </div>
                      {emailTouched && emailError && (
                        <div className="flex items-start gap-2 mt-2 animate-error">
                          <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                          <span
                            className="text-[#FF6B6B]"
                            style={{ fontSize: "13px", fontWeight: 500 }}
                          >
                            {emailError}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-[#1A2B4F] mb-2"
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={handlePasswordBlur}
                          placeholder="Enter your password"
                          className={`w-full h-12 px-4 pr-12 rounded-xl transition-all duration-200 outline-none ${
                            passwordTouched && passwordError
                              ? "border-2 border-[#FF6B6B] bg-white shadow-[0_0_0_4px_rgba(255,107,107,0.08)]"
                              : "border-2 border-[#E5E7EB] bg-[#F8FAFB]"
                          } focus:border-[#0A7AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(10,122,255,0.08)]`}
                          style={{ fontSize: "15px" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A7AFF] hover:bg-[rgba(10,122,255,0.08)] p-1.5 rounded-md transition-all"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordTouched && passwordError && (
                        <div className="flex items-start gap-2 mt-2 animate-error">
                          <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                          <span
                            className="text-[#FF6B6B]"
                            style={{ fontSize: "13px", fontWeight: 500 }}
                          >
                            {passwordError}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onForgotPassword();
                        }}
                        className="text-[#0A7AFF] hover:text-[#3B9EFF] hover:underline transition-colors cursor-pointer"
                        style={{ fontSize: "14px", fontWeight: 500 }}
                      >
                        Forgot your password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className={`w-full h-12 px-6 rounded-xl border-none text-white transition-all flex items-center justify-center ${
                        !isFormValid || isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                      }`}
                      style={{
                        background:
                          "linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%)",
                        boxShadow: "0 4px 12px rgba(10, 122, 255, 0.25)",
                        fontSize: "15px",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
                      }}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Logging in...
                        </span>
                      ) : (
                        "Log In"
                      )}
                    </button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]" />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p
                      className="text-[#64748B] mt-12"
                      style={{ fontSize: "14px" }}
                    >
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSwitchToSignUp();
                        }}
                        className="text-[#0A7AFF] hover:text-[#3B9EFF] hover:underline transition-colors cursor-pointer"
                        style={{ fontWeight: 600 }}
                      >
                        Sign up
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <span
                      className="text-[#64748B]"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      Your data is encrypted and secure
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Hero */}
              <div className="relative hidden lg:block lg:w-[48%] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1621217308295-afe2f0b40a69?w=1080&q=80"
                  alt="Philippine Travel"
                  className="w-full h-full object-cover brightness-75"
                />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10, 122, 255, 0.6) 0%, rgba(20, 184, 166, 0.8) 100%)",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="max-w-[350px] text-white">
                    <img
                      src={bondVoyageLogo}
                      alt="BondVoyage"
                      className="mb-6 h-10 w-auto"
                      style={{
                        filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.3))",
                      }}
                    />

                    <h2
                      className="mb-3 text-white"
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        textShadow: "0 2px 16px rgba(0,0,0,0.3)",
                      }}
                    >
                      Hello, Smart Traveler
                    </h2>

                    <p
                      className="mb-6 text-white opacity-95"
                      style={{ fontSize: "16px" }}
                    >
                      Let's make trip planning smarter, together.
                    </p>

                    <div className="flex flex-col gap-3">
                      {[
                        "Map out your travels, your way",
                        "Keep your travel plans in one place",
                        "Plan with confidence, travel with ease",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                          <span className="text-white text-sm opacity-90">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading && (
              <div
                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
                style={{ pointerEvents: "none" }}
              >
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-[#0A7AFF] animate-spin mx-auto" />
                  <p
                    className="text-[#1A2B4F] mt-3"
                    style={{ fontSize: "14px", fontWeight: 500 }}
                  >
                    Verifying your credentials...
                  </p>
                </div>
              </div>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

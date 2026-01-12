import { useState } from "react";
import "../components/login/components/Navigation";
import { Navigation } from "../components/login/components/Navigation";
import { Hero } from "../components/login/components/Hero";
import { About } from "../components/login/components/About";
import { Features } from "../components/login/components/Features";
import { HowItWorks } from "../components/login/components/HowItWorks";
import { Testimonials } from "../components/login/components/Testimonials";
import { Team } from "../components/login/components/Team";
import { Contact } from "../components/login/components/Contact";
import { Footer } from "../components/login/components/Footer";
import { LoginModal } from "../components/login/components/LoginModal";
import { SignUpModal } from "../components/login/components/SignUpModal";
import { ForgotPasswordModal } from "../components/login/components/ForgotPasswordModal";

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignUpModal = () => setIsSignUpModalOpen(true);
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  const switchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const switchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation
        onLoginClick={openLoginModal}
        onSignUpClick={openSignUpModal}
      />
      <Hero onStartPlanningClick={openSignUpModal} />
      <About />
      <Features />
      <Team />
      <Contact />
      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToSignUp={switchToSignUp}
        onForgotPassword={openForgotPasswordModal}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={closeSignUpModal}
        onSwitchToLogin={switchToLogin}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={closeForgotPasswordModal}
        onBackToLogin={openLoginModal}
      />
    </div>
  );
}

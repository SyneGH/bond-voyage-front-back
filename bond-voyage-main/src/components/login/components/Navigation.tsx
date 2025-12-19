"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import logoImage from "../assets/21212dac6efafd12a8aea1483228a3725c3d0aa9.png"

interface NavigationProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export function Navigation({ onLoginClick, onSignUpClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
      style={{ height: "64px" }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="BondVoyage" 
            className="h-10"
            style={{ width: "auto" }}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="transition-colors duration-200 hover:text-[var(--ocean-blue)]"
              style={{ fontSize: "15px", fontWeight: 500, color: "var(--charcoal)" }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Side Actions - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="transition-colors duration-200 hover:text-[var(--ocean-blue)]"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--charcoal)" }}
          >
            Login
          </button>
          <Button
            onClick={onSignUpClick}
            className="bg-[var(--ocean-blue)] hover:bg-[var(--sky-blue)] text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            style={{ fontSize: "14px", fontWeight: 500, padding: "12px 24px", borderRadius: "8px" }}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Access BondVoyage navigation links and account options
            </SheetDescription>
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left transition-colors duration-200 hover:text-[var(--ocean-blue)]"
                  style={{ fontSize: "16px", fontWeight: 500, color: "var(--charcoal)" }}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t space-y-3">
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsOpen(false);
                  }}
                  className="w-full text-left transition-colors duration-200 hover:text-[var(--ocean-blue)]"
                  style={{ fontSize: "14px", fontWeight: 500, color: "var(--charcoal)" }}
                >
                  Login
                </button>
                <Button
                  onClick={() => {
                    onSignUpClick();
                    setIsOpen(false);
                  }}
                  className="w-full bg-[var(--ocean-blue)] hover:bg-[var(--sky-blue)] text-white"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
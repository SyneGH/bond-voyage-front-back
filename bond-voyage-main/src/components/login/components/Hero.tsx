"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import logo from "../assets/BondVoyage Logo only.png"

interface HeroProps {
  onStartPlanningClick: () => void;
}

export function Hero({ onStartPlanningClick }: HeroProps) {
  const [showWordmark, setShowWordmark] = useState(false);

  // Toggle between icon and wordmark every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowWordmark((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 40%, #F8FAFB 100%)",
        paddingTop: "80px",
        paddingBottom: "80px",
      }}
    >
      {/* === Animated Background Elements === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, var(--ocean-blue) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, var(--tropical-teal) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* === Main Content === */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-16 w-full relative z-10 flex flex-col items-center text-center">

        {/* === Logo Section (smooth transition + fixed height) === */}
        <div className="min-h-[160px] flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {!showWordmark ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-32 h-32 flex items-center justify-center"
              >
                <motion.img
                src={logo}
                  className="w-full h-auto"
               />
              </motion.div>
            ) : (
              <motion.div
                key="wordmark"
                initial={{ opacity: 0, scale: 0.95, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateY: 90 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-[420px] h-[120px] flex items-center justify-center"
              >
                <svg viewBox="0 0 800 120" className="w-full h-auto max-w-[420px]">
                  <defs>
                    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#0A7AFF" }} />
                      <stop offset="50%" style={{ stopColor: "#3B9EFF" }} />
                      <stop offset="100%" style={{ stopColor: "#14B8A6" }} />
                    </linearGradient>
                  </defs>
                  <text
                    x="50%"
                    y="70"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="url(#textGradient)"
                    style={{
                      fontSize: "100px",
                      fontWeight: 700,
                      fontFamily: "Inter, system-ui, sans-serif",
                    }}
                  >
                    BondVoyage
                  </text>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === Text Section (no motion shift) === */}
        <motion.p
          className="text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: "18px",
            fontWeight: 500,
            color: "var(--slate)",
            letterSpacing: "0.5px",
          }}
        >
          Hi, Traveler
        </motion.p>

        <motion.h1
          className="leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontSize: "clamp(28px, 4.5vw, 56px)",
            fontWeight: 700,
            color: "var(--deep-navy)",
            lineHeight: 1.15,
            maxWidth: "900px",
          }}
        >
          What if your next{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--ocean-blue) 0%, var(--tropical-teal) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            great adventure
          </span>
          <br />
          started with one smart platform?
        </motion.h1>

        <motion.p
          className="mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "var(--slate)",
            lineHeight: 1.6,
          }}
        >
          Plan smarter. Travel better. With BondVoyage.
        </motion.p>

        {/* === CTA Button === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={onStartPlanningClick}
            className="group relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--ocean-blue) 0%, var(--tropical-teal) 100%)",
              color: "white",
              fontSize: "18px",
              fontWeight: 600,
              padding: "16px 25px",
              borderRadius: "50px",
              border: "none",
              boxShadow: "0 10px 30px rgba(10, 122, 255, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 15px 40px rgba(10, 122, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(10, 122, 255, 0.3)";
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Planning
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

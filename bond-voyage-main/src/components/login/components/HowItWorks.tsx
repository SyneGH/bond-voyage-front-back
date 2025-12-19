"use client";

import { Plus, Layout, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";

const steps = [
  {
    number: 1,
    icon: Plus,
    title: "Create Your Trip",
    description: "Set your destination, dates, and travel preferences in minutes.",
  },
  {
    number: 2,
    icon: Layout,
    title: "Build Your Itinerary",
    description: "Add activities, book accommodations, and organize your perfect schedule.",
  },
  {
    number: 3,
    icon: Truck,
    title: "Travel with Confidence",
    description: "Access everything offline, share with companions, and enjoy your adventure.",
  },
];

interface HowItWorksProps {
  onStartYourTripClick: () => void;
}

export function HowItWorks({ onStartYourTripClick }: HowItWorksProps) {
  return (
    <section
      className="py-20 md:py-32"
      style={{
        background: "linear-gradient(to bottom, rgba(59, 158, 255, 0.1), transparent)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            How It Works
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Simple Steps to Your Dream Trip
          </h2>
        </div>

        {/* Timeline Steps */}
        <div className="mt-16 relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--ocean-blue)] to-[var(--tropical-teal)]"
            style={{ top: "40px", left: "20%", right: "20%", height: "2px", opacity: 0.3 }}
          />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.5, duration: 0.5 }}
              >
                {/* Numbered Circle */}
                <div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--ocean-blue)] to-[var(--tropical-teal)] flex items-center justify-center shadow-lg relative z-10"
                >
                  <span className="text-white" style={{ fontSize: "40px", fontWeight: 700 }}>
                    {step.number}
                  </span>
                </div>

                {/* Step Card */}
                <div className="mt-6 bg-white rounded-xl shadow-md p-8 w-full max-w-[320px] hover:shadow-lg transition-shadow duration-300">
                  <div
                    className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[var(--ocean-blue)] to-[var(--sky-blue)] flex items-center justify-center"
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="mt-4" style={{ fontSize: "20px", fontWeight: 600, color: "var(--deep-navy)" }}>
                    {step.title}
                  </h3>

                  <p className="mt-3" style={{ fontSize: "15px", color: "var(--slate)", lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={onStartYourTripClick}
            className="bg-[var(--ocean-blue)] hover:bg-[var(--sky-blue)] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            style={{ fontSize: "16px", fontWeight: 500, padding: "14px 32px", borderRadius: "8px" }}
          >
            Start Your Trip
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

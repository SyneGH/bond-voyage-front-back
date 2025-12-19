"use client";

import { Sparkles, Brain, CalendarCheck } from "lucide-react";
import { motion } from "motion/react";

const valueProps = [
  {
    icon: Sparkles,
    title: "Simple & Clean",
    description: "Navigate complex travel planning with an intuitive, beautiful interface designed for everyone.",
    iconColor: "var(--ocean-blue)",
  },
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Let our smart algorithms craft personalized itineraries based on your preferences and budget.",
    iconColor: "var(--golden-hour)",
  },
  {
    icon: CalendarCheck,
    title: "Stay Organized",
    description: "Keep all your bookings, documents, and plans in one secure, accessible place.",
    iconColor: "var(--jade-green)",
  },
];

export function ValueProps() {
  return (
    <section
      style={{
        backgroundColor: "var(--cloud-gray)",
        paddingTop: "96px",
        paddingBottom: "96px",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            About BondVoyage
          </h2>
          <p
            className="mt-4 mx-auto"
            style={{
              fontSize: "18px",
              color: "var(--slate)",
              maxWidth: "700px",
              lineHeight: 1.6,
            }}
          >
            Revolutionizing Travel Planning with AI
          </p>
        </motion.div>

        {/* Value Prop Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-6">
                  <prop.icon style={{ width: "64px", height: "64px", color: prop.iconColor }} />
                </div>

                {/* Title */}
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--deep-navy)", marginBottom: "12px" }}>
                  {prop.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: "15px", color: "var(--slate)", lineHeight: 1.6 }}>
                  {prop.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

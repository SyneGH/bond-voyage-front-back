"use client";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Sparkles, Brain, CalendarCheck } from "lucide-react";

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

export function About() {
  return (
    <section id="about" style={{ background: "linear-gradient(180deg, #F8FAFB 0%, #F8FAFB 100%)" }}>
      {/* Centered Header Container */}
      <div className="pt-12 md:pt-16 px-4 md:px-16 max-w-[1280px] mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            About BondVoyage
          </p>

          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Making Travel Planning Simple and Joyful
          </h2>
        </motion.div>
      </div>

      {/* Two-Column About Content */}
      <div className="pb-20 md:pb-32 px-4 md:px-16 max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-5" style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--charcoal)" }}>
              <p>
                BondVoyage was born from a simple idea: travel planning shouldn't be stressful. Whether you're
                organizing a weekend getaway or a month-long adventure, we believe the planning process should be as
                enjoyable as the trip itself.
              </p>

              <p>
                Our platform combines powerful organizational tools with an intuitive interface, making it easy for
                anyone to create detailed itineraries, manage budgets, and collaborate with travel companions. We're
                here to handle the logistics so you can focus on the excitement of exploration.
              </p>

              <p>
                Join thousands of travelers who have already discovered a better way to plan their adventures.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1748256622734-92241ae7b43f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTk5MDI4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Team collaboration"
              className="w-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Value Props Section - Integrated */}
        <div style={{ paddingTop: "80px" }}>
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >

            <p
              className="mt-4 mx-auto"
              style={{
                fontSize: "28px",
                fontWeight: 600,
                background: "linear-gradient(135deg, var(--ocean-blue) 0%, var(--tropical-teal) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                maxWidth: "700px",
                lineHeight: 1.4,
                letterSpacing: "-0.5px",
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
      </div>
    </section>
  );
}
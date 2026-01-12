"use client";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { Sparkles, Brain, CalendarCheck } from "lucide-react";

const valueProps = [
  {
    icon: Sparkles,
    title: "Effortless Travel Planning",
    description:
      "Turn every trip into a smooth experience. From smart itineraries and route optimization to collaborative trip planning, manage every aspect of your travels effortlessly. With AI-powered tools, every trip is easier, smarter, and more enjoyable.",
    iconColor: "var(--ocean-blue)",
  },
  {
    icon: Brain,
    title: "Smart Travel Planning Assistant",
    description:
      "Plan smarter with our AI Travel Assistant, which assists in creating day-by-day itineraries and provides expert guidance for every trip. Need help on the go? Our AI-Powered FAQ Assistant delivers instant answers and smart suggestions, especially for navigating system features.",
    iconColor: "var(--golden-hour)",
  },
  {
    icon: CalendarCheck,
    title: "All-in-One Travel Management",
    description:
      "Manage all your trips, bookings, itineraries, and travel plans in one centralized, easy-to-use platform designed for both travelers and administrators. Keep track of every detail, from trip history to feedback, so you always stay in control of your travel experience.",
    iconColor: "var(--jade-green)",
  },
];

export function About() {
  return (
    <section
      id="about"
      style={{
        background: "linear-gradient(180deg, #F8FAFB 0%, #F8FAFB 100%)",
      }}
    >
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
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--ocean-blue)",
              letterSpacing: "1.5px",
            }}
          >
            About BondVoyage
          </p>

          <h2
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "var(--deep-navy)",
            }}
          >
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
            <div
              className="space-y-5"
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "var(--charcoal)",
              }}
            >
              <p>
                BondVoyage was born from a simple idea: travel planning
                shouldn't be stressful. Whether you're organizing a weekend
                getaway or a month-long adventure, we believe the planning
                process should be as enjoyable as the trip itself.
              </p>

              <p>
                BondVoyage is an all-in-one travel management system that
                connects travelers and administrators through a smart,
                centralized platform. It empowers users to seamlessly plan,
                customize, and manage their trips through AI-assisted
                itineraries, smart trip generation, and centralized booking
                tracking. It offers a personalized travel dashboard, trip
                history, and feedback sharing, while providing administrators
                with powerful tools for user management, booking approvals,
                itinerary creation, analytics, and feedback oversight—ensuring a
                smooth, intelligent, and well-managed travel experience for both
                travelers and operators.
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
              src="bv_home.png"
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
                background:
                  "linear-gradient(135deg, var(--ocean-blue) 0%, var(--tropical-teal) 100%)",
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
                    <prop.icon
                      style={{
                        width: "64px",
                        height: "64px",
                        color: prop.iconColor,
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "var(--deep-navy)",
                      marginBottom: "12px",
                    }}
                  >
                    {prop.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--slate)",
                      lineHeight: 1.6,
                    }}
                  >
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

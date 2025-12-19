"use client";

import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { motion } from "motion/react";

const testimonials = [
  {
    quote:
      "BondVoyage transformed how I plan my trips. The itinerary builder is intuitive and the budget tracker kept me on track throughout my Europe adventure!",
    author: "Sarah Johnson",
    location: "New York",
    initials: "SJ",
  },
  {
    quote:
      "Collaborating with my family for our reunion trip was seamless. Everyone could add their preferences and we found the perfect compromise.",
    author: "Michael Chen",
    location: "Singapore",
    initials: "MC",
  },
  {
    quote:
      "The offline access saved me multiple times during my backpacking trip. Having all my bookings and maps available without data was a lifesaver.",
    author: "Emma Rodriguez",
    location: "Barcelona",
    initials: "ER",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[var(--cloud-gray)] py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            Testimonials
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Loved by Travelers Worldwide
          </h2>
          <p className="mt-4" style={{ fontSize: "16px", color: "var(--slate)" }}>
            See what our community is saying about BondVoyage
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="bg-white p-8 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-shadow duration-300"
              style={{ borderLeftColor: "var(--ocean-blue)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 opacity-30" style={{ color: "var(--ocean-blue)" }} />

              {/* Testimonial Text */}
              <p className="mt-4 italic" style={{ fontSize: "16px", color: "var(--charcoal)", lineHeight: 1.6 }}>
                "{testimonial.quote}"
              </p>

              {/* Rating */}
              <div className="mt-5 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-[var(--golden-hour)]"
                    style={{ width: "16px", height: "16px", color: "var(--golden-hour)" }}
                  />
                ))}
              </div>

              {/* Author Info */}
              <div className="mt-5 flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback
                    className="bg-gradient-to-br from-[var(--ocean-blue)] to-[var(--tropical-teal)] text-white"
                    style={{ fontWeight: 600 }}
                  >
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--deep-navy)" }}>
                    {testimonial.author}
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--slate)" }}>{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

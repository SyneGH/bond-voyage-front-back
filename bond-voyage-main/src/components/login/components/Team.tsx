"use client";

import { Mail } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import barroso from "../assets/barroso.png"
import dichoso from "../assets/dichoso.png"
import hidalgo from "../assets/hidalgo.PNG"
import lacsa from "../assets/lacsa.jpg"
import melgar from "../assets/melgar.png"

const teamMembers = [
  {
    name: "Fara Katrina Lacsa",
    role: "Project Manager",
    image: lacsa,
    email: "fara.lacsa@bondvoyage.com",
  },
  {
    name: "Maryll Nezeriah Barroso",
    role: "Business Analyst",
    image: barroso,
    email: "maryll.barroso@bondvoyage.com",
  },
  {
    name: "Virginia Rose Dichoso",
    role: "Frontend Developer",
    image: dichoso,
    email: "virginia.dichoso@bondvoyage.com",
  },
  {
    name: "Ayumi Hidalgo",
    role: "Business Analyst",
    image: hidalgo,
    email: "ayumi.hidalgo@bondvoyage.com",
  },
  {
    name: "Felix Angelo Melgar",
    role: "Backend Developer",
    image: melgar,
    email: "felix.melgar@bondvoyage.com",
  },
];

export function Team() {
  return (
    <section id="team" className="bg-white py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            Our Team
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Meet the Team
          </h2>
          <p className="mt-4" style={{ fontSize: "16px", color: "var(--slate)" }}>
            The passionate people behind BondVoyage
          </p>
        </div>

        {/* First Row - 3 Members */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.slice(0, 3).map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-white rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              {/* Photo */}
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h4 className="mb-1" style={{ color: "var(--deep-navy)", fontWeight: 600 }}>
                  {member.name}
                </h4>
                <p className="mb-4" style={{ fontSize: "14px", color: "var(--ocean-blue)" }}>
                  {member.role}
                </p>

                {/* Email Link */}
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--ocean-blue)] hover:text-white"
                    style={{ backgroundColor: "var(--cloud-gray)", color: "var(--slate)" }}
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Second Row - 2 Members Centered */}
        <div className="mt-8 grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {teamMembers.slice(3, 5).map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-white rounded-xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index + 3) * 0.05, duration: 0.5 }}
            >
              {/* Photo */}
              <div className="aspect-square overflow-hidden">
                <ImageWithFallback
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h4 className="mb-1" style={{ color: "var(--deep-navy)", fontWeight: 600 }}>
                  {member.name}
                </h4>
                <p className="mb-4" style={{ fontSize: "14px", color: "var(--ocean-blue)" }}>
                  {member.role}
                </p>

                {/* Email Link */}
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--ocean-blue)] hover:text-white"
                    style={{ backgroundColor: "var(--cloud-gray)", color: "var(--slate)" }}
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

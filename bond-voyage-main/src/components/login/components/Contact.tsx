"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Mail, Phone, MapPin, Send, Plane, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


export function Contact() {
  const [messageValue, setMessageValue] = useState("");
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState("");
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const greetingResponses: { [key: string]: string } = {
    'hello': 'Well hello there! 👋',
    'hi': 'Hey! How\'s it going? 😊',
    'hey': 'Hey there! What can we help with? 👋',
    'good morning': 'Good morning! What\'s new? ☀️',
    'good afternoon': 'Good afternoon! How\'s your day? 🌤️',
    'good evening': 'Good evening! Hope you\'re well! 🌙',
    'greetings': 'Greetings, friend! 🙌',
    'howdy': 'Howdy, partner! 🤠',
    'hiya': 'Hiya! Great to hear from you! 👋'
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageValue(value);
    
    // Easter egg: detect various greetings (case insensitive)
    const lowerValue = value.toLowerCase();
    
    // Check for greetings in order of length (longest first to match "good morning" before "good")
    const greetings = Object.keys(greetingResponses).sort((a, b) => b.length - a.length);
    const foundGreeting = greetings.find(greeting => lowerValue.includes(greeting));
    
    if (foundGreeting && !showEasterEgg) {
      setEasterEggMessage(greetingResponses[foundGreeting]);
      setShowEasterEgg(true);
      // Reset after animation
      setTimeout(() => setShowEasterEgg(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger paper airplane animation
    setShowPlaneAnimation(true);
    setFormSubmitted(true);
    
    // Play a whoosh sound effect (paper plane flying)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a whoosh sound by sweeping frequency
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      // Silently fail if audio doesn't play
    }
    
    // Reset animations
    setTimeout(() => {
      setShowPlaneAnimation(false);
      setFormSubmitted(false);
      setMessageValue("");
    }, 2000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "bondvoyage.system@gmail.com",
      href: "mailto:bondvoyage.system@gmail.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+63 994 631 1233",
      href: "tel:+639946311233"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Santa Rosa City, Laguna, PH",
      href: null
    }
  ];

  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(10, 122, 255, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)' }}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            Contact Us
          </p>
          <h2 style={{ fontSize: "40px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Get In Touch
          </h2>
          <p className="mt-4 max-w-2xl mx-auto" style={{ fontSize: "18px", color: "var(--slate)" }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-[var(--silver)] relative overflow-hidden">
              {/* Success overlay */}
              <AnimatePresence>
                {formSubmitted && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--ocean-blue)]/10 to-[var(--tropical-teal)]/10 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="bg-white rounded-2xl p-6 shadow-xl text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--ocean-blue)] to-[var(--tropical-teal)] mx-auto flex items-center justify-center mb-3">
                        <Plane className="w-8 h-8 text-white" />
                      </div>
                      <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--deep-navy)" }}>
                        Message Sent!
                      </p>
                      <p className="mt-1" style={{ fontSize: "14px", color: "var(--slate)" }}>
                        We'll be in touch soon!
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="mb-6" style={{ fontSize: "24px", fontWeight: 600, color: "var(--deep-navy)" }}>
                Send us a message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" style={{ fontSize: "14px", fontWeight: 500, color: 'var(--deep-navy)' }}>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    className="mt-2 h-12 rounded-xl border-[var(--silver)] bg-[var(--cloud-gray)] focus:bg-white focus:border-[var(--ocean-blue)] focus:ring-2 focus:ring-[var(--ocean-blue)] focus:ring-opacity-20 transition-all duration-200"
                    style={{ fontSize: "16px" }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" style={{ fontSize: "14px", fontWeight: 500, color: 'var(--deep-navy)' }}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 h-12 rounded-xl border-[var(--silver)] bg-[var(--cloud-gray)] focus:bg-white focus:border-[var(--ocean-blue)] focus:ring-2 focus:ring-[var(--ocean-blue)] focus:ring-opacity-20 transition-all duration-200"
                    style={{ fontSize: "16px" }}
                    required
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="message" style={{ fontSize: "14px", fontWeight: 500, color: 'var(--deep-navy)' }}>
                    Your Message
                  </Label>
                  
                  {/* Easter Egg Animation - positioned near textarea */}
                  <AnimatePresence>
                    {showEasterEgg && (
                      <motion.div
                        className="absolute -top-2 left-0 right-0 z-10 flex justify-center"
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -8, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="bg-gradient-to-r from-[var(--ocean-blue)] to-[var(--tropical-teal)] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span style={{ fontSize: "14px", fontWeight: 500 }}>
                            {easterEggMessage}
                          </span>
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <Textarea
                    id="message"
                    placeholder="Tell us what you're thinking... (Try typing a greeting! 😉)"
                    value={messageValue}
                    onChange={handleMessageChange}
                    className="mt-2 min-h-[160px] rounded-xl resize-none border-[var(--silver)] bg-[var(--cloud-gray)] focus:bg-white focus:border-[var(--ocean-blue)] focus:ring-2 focus:ring-[var(--ocean-blue)] focus:ring-opacity-20 transition-all duration-200"
                    style={{ fontSize: "16px" }}
                    required
                  />
                </div>
                <div className="relative">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[var(--ocean-blue)] hover:bg-[var(--sky-blue)] text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    style={{ fontSize: "16px", fontWeight: 500 }}
                  >
                    Send Message
                    <Send className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Contact Info Card */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: 0.4 }}
  className="flex flex-col gap-6"
>
  <div
    className="rounded-3xl p-6 md:p-8 text-white shadow-2xl flex-1 flex flex-col relative overflow-hidden"
    style={{ 
      background: `linear-gradient(135deg, #0891b2 0%, #14b8a6 50%, #2dd4bf 100%)`,
    }}
  >
    {/* Animated background elements */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    
    <div className="relative z-10">
      {/* Main Tagline */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h3 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Get In Touch
          </h3>
        </div>
        <p className="text-white/95" style={{ fontSize: "18px", fontWeight: 500, lineHeight: "1.7" }}>
          Our inbox never sleeps — but humans reply <span className="font-semibold">9 AM–6 PM</span>
        </p>
      </div>

      {/* Contact Details */}
      <div className="space-y-6 mb-10">
        {contactInfo.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-start gap-4 group cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 group-hover:bg-white/35 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 pt-1">
              <p className="mb-1 text-white/80 uppercase tracking-wider" style={{ fontSize: "11px", fontWeight: 600 }}>
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:underline transition-all duration-200 block"
                  style={{ fontSize: "17px", fontWeight: 600 }}
                >
                  {item.value}
                </a>
              ) : (
                <p style={{ fontSize: "17px", fontWeight: 600 }}>
                  {item.value}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div 
        className="mt-auto pt-6 border-t border-white/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
      >
        <div className="space-y-3.5">
          <div className="flex items-start gap-3.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
            <p className="text-white/90" style={{ fontSize: "15px", lineHeight: "1.6", fontWeight: 500 }}>
              Human responses typically within 2-4 hours during business hours
            </p>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0"></div>
            <p className="text-white/90" style={{ fontSize: "15px", lineHeight: "1.6", fontWeight: 500 }}>
              Weekend messages answered first thing Monday morning
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
</motion.div>
        </div>

        {/* Flying Paper Airplane Animation */}
        <AnimatePresence>
        {showPlaneAnimation && (
          <motion.div
            className="fixed pointer-events-none z-50"
            initial={{ 
              x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
              y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
              rotate: -10,
              scale: 1
            }}
            animate={{ 
              x: [
                typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
                typeof window !== 'undefined' ? window.innerWidth * 0.7 : 700,
                typeof window !== 'undefined' ? window.innerWidth + 200 : 1200
              ],
              y: [
                typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
                typeof window !== 'undefined' ? window.innerHeight * 0.3 : 200,
                -200
              ],
              rotate: [-10, 20, 45],
              scale: [1, 1.3, 1.8]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.8, 
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: 5,
                ease: "easeInOut"
              }}
            >
              <Plane 
                className="w-12 h-12"
                style={{ color: 'var(--ocean-blue)' }}
              />
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </section>
  );
}

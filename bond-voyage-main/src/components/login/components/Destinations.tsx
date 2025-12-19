"use client";

import { MapPin, Star } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

const destinations = [
  {
    name: "Bali, Indonesia",
    region: "Southeast Asia",
    rating: 4.8,
    price: 899,
    badge: "Featured",
    badgeColor: "var(--sunset-coral)",
    image: "https://images.unsplash.com/photo-1698466632744-f79b37b88ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYWxpJTIwSW5kb25lc2lhJTIwYmVhY2h8ZW58MXx8fHwxNzYwMDA1NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Tokyo, Japan",
    region: "East Asia",
    rating: 4.9,
    price: 1299,
    badge: "Trending",
    badgeColor: "var(--golden-hour)",
    image: "https://images.unsplash.com/photo-1591194233688-dca69d406068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMEphcGFuJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc1OTk5MDg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Paris, France",
    region: "Western Europe",
    rating: 4.7,
    price: 1499,
    badge: "Featured",
    badgeColor: "var(--sunset-coral)",
    image: "https://images.unsplash.com/photo-1653530899380-3eb904d6e2a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYXJpcyUyMEZyYW5jZSUyMHRvd2VyfGVufDF8fHx8MTc2MDAwNTU5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Santorini, Greece",
    region: "Mediterranean",
    rating: 4.9,
    price: 1199,
    badge: "Trending",
    badgeColor: "var(--golden-hour)",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYW50b3JpbmklMjBHcmVlY2V8ZW58MXx8fHwxNzYwMDA1NTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Iceland",
    region: "Northern Europe",
    rating: 4.8,
    price: 1599,
    badge: "Featured",
    badgeColor: "var(--sunset-coral)",
    image: "https://images.unsplash.com/photo-1610123598147-f632aa18b275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJY2VsYW5kJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MDAwNTU5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Maldives",
    region: "South Asia",
    rating: 4.9,
    price: 1899,
    badge: "Trending",
    badgeColor: "var(--golden-hour)",
    image: "https://images.unsplash.com/photo-1727874098383-8538af9d76bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNYWxkaXZlcyUyMHJlc29ydCUyMGJlYWNofGVufDF8fHx8MTc2MDAwNTYwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "New York, USA",
    region: "North America",
    rating: 4.7,
    price: 1099,
    badge: "Featured",
    badgeColor: "var(--sunset-coral)",
    image: "https://images.unsplash.com/photo-1570304816841-906a17d7b067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrJTIwc2t5bGluZXxlbnwxfHx8fDE3NTk5MTAzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    name: "Dubai, UAE",
    region: "Middle East",
    rating: 4.8,
    price: 1399,
    badge: "Trending",
    badgeColor: "var(--golden-hour)",
    image: "https://images.unsplash.com/photo-1650376126635-1304b38cb933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEdWJhaSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTk5MzgxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function Destinations() {
  return (
    <section id="destinations" className="bg-white py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: "14px", fontWeight: 500, color: "var(--ocean-blue)", letterSpacing: "1.5px" }}
          >
            Explore
          </p>
          <h2 style={{ fontSize: "32px", fontWeight: 600, color: "var(--deep-navy)" }}>
            Popular Destinations
          </h2>
          <p className="mt-4" style={{ fontSize: "16px", color: "var(--slate)" }}>
            Discover where other travelers are exploring
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                  {/* Badge */}
                  <div
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-md text-white"
                    style={{ fontSize: "12px", fontWeight: 500, backgroundColor: destination.badgeColor }}
                  >
                    {destination.badge}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h5 style={{ fontSize: "20px", fontWeight: 600, color: "var(--deep-navy)" }}>
                    {destination.name}
                  </h5>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" style={{ color: "var(--slate)" }} />
                      <span style={{ fontSize: "14px", color: "var(--slate)" }}>{destination.region}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[var(--golden-hour)]" style={{ color: "var(--golden-hour)" }} />
                      <span style={{ fontSize: "14px", color: "var(--slate)" }}>{destination.rating}</span>
                    </div>
                  </div>

                  <p className="mt-3" style={{ fontSize: "16px", fontWeight: 600, color: "var(--ocean-blue)" }}>
                    From ${destination.price}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            variant="outline"
            className="border-2 hover:bg-[var(--ocean-blue)] hover:bg-opacity-10 transition-all duration-200"
            style={{
              fontSize: "16px",
              fontWeight: 500,
              padding: "12px 30px",
              borderRadius: "8px",
              borderColor: "var(--ocean-blue)",
              color: "var(--ocean-blue)",
            }}
          >
            Explore All Destinations
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Mountain, Waves, Umbrella, Footprints, Anchor, Camera, Tent, Utensils, Palmtree } from "lucide-react";

type AdventureType = "climbing" | "swimming" | "surfing" | "hiking" | "boating" | "photography" | "camping" | "dining" | "beachRelax";

interface Adventure {
  type: AdventureType;
  label: string;
  sublabel: string;
  icon: typeof Mountain;
  color: string;
}

const adventures: Adventure[] = [
  { 
    type: "climbing", 
    label: "Rock Climbing", 
    sublabel: "Scaling new heights",
    icon: Mountain,
    color: "#8B5CF6" // Purple
  },
  { 
    type: "swimming", 
    label: "Swimming", 
    sublabel: "Diving deep",
    icon: Waves,
    color: "#0A7AFF" // Ocean Blue
  },
  { 
    type: "surfing", 
    label: "Surfing", 
    sublabel: "Riding the waves",
    icon: Umbrella,
    color: "#14B8A6" // Tropical Teal
  },
  { 
    type: "hiking", 
    label: "Hiking", 
    sublabel: "Exploring trails",
    icon: Footprints,
    color: "#10B981" // Jade Green
  },
  { 
    type: "boating", 
    label: "Boating", 
    sublabel: "Sailing away",
    icon: Anchor,
    color: "#FFB84D" // Golden Hour
  },
  { 
    type: "photography", 
    label: "Photography", 
    sublabel: "Capturing moments",
    icon: Camera,
    color: "#EC4899" // Pink
  },
  { 
    type: "camping", 
    label: "Camping", 
    sublabel: "Under the stars",
    icon: Tent,
    color: "#6366F1" // Indigo
  },
  { 
    type: "dining", 
    label: "Local Cuisine", 
    sublabel: "Tasting flavors",
    icon: Utensils,
    color: "#EF4444" // Red
  },
  { 
    type: "beachRelax", 
    label: "Beach Relaxing", 
    sublabel: "Peaceful moments",
    icon: Palmtree,
    color: "#22D3EE" // Cyan
  },
];

export function AdventureAvatar() {
  const [currentAdventureIndex, setCurrentAdventureIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const currentAdventure = adventures[currentAdventureIndex];

  const handleAvatarClick = () => {
    setCurrentAdventureIndex((prev) => (prev + 1) % adventures.length);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center gap-4 min-h-[300px]">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 right-12 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Left Side: Activity Label and Buttons */}
      <div className="flex flex-col items-center gap-3 z-10">
        {/* Activity Label with Glassmorphism */}
        <motion.div
          key={`label-${currentAdventure.type}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <currentAdventure.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
            <div className="text-left">
              <p className="text-white font-semibold text-sm leading-tight">{currentAdventure.label}</p>
              <p className="text-white/70 text-xs leading-tight">{currentAdventure.sublabel}</p>
            </div>
          </div>
        </motion.div>

        {/* Adventure Buttons */}
        <div className="flex gap-2 flex-wrap justify-center max-w-[200px]">
          {adventures.map((adventure, index) => (
            <motion.button
              key={adventure.type}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAdventureIndex(index);
              }}
              className="group relative focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1.5"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              title={adventure.label}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index === currentAdventureIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/20 backdrop-blur-sm group-hover:bg-white/40"
                }`}
                style={{
                  borderColor: index === currentAdventureIndex ? adventure.color : "transparent",
                  borderWidth: "2px",
                }}
              >
                <adventure.icon
                  className="w-4 h-4 transition-colors duration-300"
                  style={{
                    color: index === currentAdventureIndex ? adventure.color : "white",
                  }}
                  strokeWidth={2.5}
                />
              </div>
              
              {/* Tooltip on hover */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A2B4F] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50"
              >
                {adventure.label}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#1A2B4F] rotate-45" />
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Click Hint */}
        <AnimatePresence>
          {currentAdventureIndex === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-xs"
            >
              👆 Explore adventures!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side: Main Interactive Avatar Container */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={handleAvatarClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAdventure.type}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl"
            >
              {/* Enhanced Glow Effect Background */}
              <motion.circle
                cx="120"
                cy="120"
                r="110"
                fill={currentAdventure.color}
                opacity="0.15"
                animate={{
                  scale: isHovered ? [1, 1.1, 1] : 1,
                  opacity: isHovered ? [0.15, 0.25, 0.15] : 0.15,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Outer decorative ring */}
              <motion.circle
                cx="120"
                cy="120"
                r="105"
                fill="none"
                stroke={currentAdventure.color}
                strokeWidth="1"
                opacity="0.2"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Rock Climbing - Enhanced */}
              {currentAdventure.type === "climbing" && (
                <g>
                  {/* Mountain/Rock Wall with gradient */}
                  <defs>
                    <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6B7280" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 55 160 L 85 105 L 115 125 L 145 85 L 175 145 L 175 185 L 55 185 Z"
                    fill="url(#mountainGrad)"
                    animate={{
                      opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                  
                  {/* Climbing holds - more colorful */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.g key={`hold-${i}`}>
                      <motion.circle
                        cx={75 + i * 20}
                        cy={165 - i * 15}
                        r="5"
                        fill={currentAdventure.color}
                        opacity="0.7"
                        animate={{
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                      {/* Glow effect */}
                      <motion.circle
                        cx={75 + i * 20}
                        cy={165 - i * 15}
                        r="7"
                        fill={currentAdventure.color}
                        opacity="0.2"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.2, 0, 0.2],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    </motion.g>
                  ))}

                  {/* Enhanced Cute Character Body */}
                  <motion.g
                    animate={{
                      y: [0, -10, 0],
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Head - larger and cuter */}
                    <circle cx="120" cy="95" r="22" fill="#FFE4C4" />
                    {/* Cheeks */}
                    <circle cx="105" cy="100" r="4" fill="#FFB6C1" opacity="0.6" />
                    <circle cx="135" cy="100" r="4" fill="#FFB6C1" opacity="0.6" />
                    {/* Hair */}
                    <path d="M 100 85 Q 105 75 115 78 Q 120 72 125 78 Q 135 75 140 85" fill="#8B4513" />
                    <circle cx="108" cy="80" r="5" fill="#8B4513" />
                    <circle cx="132" cy="80" r="5" fill="#8B4513" />
                    {/* Eyes - bigger and cuter */}
                    <circle cx="110" cy="93" r="3" fill="#000" />
                    <circle cx="111" cy="92" r="1.5" fill="#FFF" />
                    <circle cx="130" cy="93" r="3" fill="#000" />
                    <circle cx="131" cy="92" r="1.5" fill="#FFF" />
                    {/* Happy Mouth */}
                    <motion.path
                      d="M 110 102 Q 120 106 130 102"
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      animate={{
                        d: ["M 110 102 Q 120 106 130 102", "M 110 102 Q 120 108 130 102", "M 110 102 Q 120 106 130 102"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    {/* Body */}
                    <ellipse cx="120" cy="130" rx="16" ry="22" fill={currentAdventure.color} opacity="0.9" />
                    {/* T-shirt detail */}
                    <path d="M 115 120 L 120 125 L 125 120" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.5" />
                    
                    {/* Arms - Climbing Position */}
                    <motion.line
                      x1="104"
                      y1="125"
                      x2="80"
                      y2="112"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        x2: [80, 75, 80],
                        y2: [112, 107, 112],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />
                    <motion.line
                      x1="136"
                      y1="125"
                      x2="155"
                      y2="100"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        x2: [155, 160, 155],
                        y2: [100, 95, 100],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    />
                    {/* Hands */}
                    <circle cx="80" cy="112" r="4" fill="#FFE4C4" />
                    <circle cx="155" cy="100" r="4" fill="#FFE4C4" />
                    
                    {/* Legs */}
                    <line x1="110" y1="152" x2="100" y2="170" stroke="#FFE4C4" strokeWidth="5" strokeLinecap="round" />
                    <line x1="130" y1="152" x2="140" y2="172" stroke="#FFE4C4" strokeWidth="5" strokeLinecap="round" />
                    {/* Feet */}
                    <ellipse cx="100" cy="172" rx="5" ry="3" fill="#333" />
                    <ellipse cx="140" cy="174" rx="5" ry="3" fill="#333" />
                  </motion.g>

                  {/* Safety Rope */}
                  <motion.path
                    d="M 120 75 Q 135 65 145 55"
                    stroke={currentAdventure.color}
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="5 5"
                    animate={{
                      strokeDashoffset: [0, -10],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Stars for achievement */}
                  {[0, 1, 2].map((i) => (
                    <motion.path
                      key={`star-climb-${i}`}
                      d={`M ${165 + i * 12} ${70 - i * 8} l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 Z`}
                      fill={currentAdventure.color}
                      opacity="0.8"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.3, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.7,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Swimming - Enhanced */}
              {currentAdventure.type === "swimming" && (
                <g>
                  {/* Enhanced Water Waves with gradient */}
                  <defs>
                    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={currentAdventure.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={currentAdventure.color} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.path
                      key={`wave-${i}`}
                      d={`M 35 ${130 + i * 12} Q 75 ${120 + i * 12} 120 ${130 + i * 12} T 205 ${130 + i * 12}`}
                      stroke="url(#waterGrad)"
                      strokeWidth="3.5"
                      fill="none"
                      opacity={0.5 - i * 0.1}
                      animate={{
                        x: [0, -25, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Enhanced Cute Character Swimming */}
                  <motion.g
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "120px 105px" }}
                  >
                    {/* Head */}
                    <circle cx="120" cy="100" r="20" fill="#FFE4C4" />
                    {/* Swimming Cap */}
                    <path d="M 102 96 Q 120 84 138 96 L 138 102 L 102 102 Z" fill={currentAdventure.color} opacity="0.95" />
                    <circle cx="120" cy="88" r="3" fill="#FFF" opacity="0.6" />
                    {/* Goggles */}
                    <ellipse cx="112" cy="98" rx="6" ry="5" fill="#333" opacity="0.7" />
                    <ellipse cx="128" cy="98" rx="6" ry="5" fill="#333" opacity="0.7" />
                    <line x1="118" y1="98" x2="122" y2="98" stroke="#333" strokeWidth="2" />
                    {/* Goggle reflections */}
                    <ellipse cx="113" cy="96" rx="2" ry="2.5" fill="#FFF" opacity="0.8" />
                    <ellipse cx="129" cy="96" rx="2" ry="2.5" fill="#FFF" opacity="0.8" />
                    {/* Happy Mouth */}
                    <path d="M 112 106 Q 120 109 128 106" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Body */}
                    <ellipse cx="120" cy="125" rx="14" ry="18" fill={currentAdventure.color} opacity="0.8" />
                    
                    {/* Arms - Swimming Motion */}
                    <motion.line
                      x1="106"
                      y1="120"
                      x2="75"
                      y2="108"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        x2: [75, 68, 75],
                        y2: [108, 118, 108],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <motion.line
                      x1="134"
                      y1="120"
                      x2="165"
                      y2="125"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        x2: [165, 172, 165],
                        y2: [125, 115, 125],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.75,
                      }}
                    />
                    
                    {/* Legs - Kicking */}
                    <motion.line
                      x1="113"
                      y1="143"
                      x2="105"
                      y2="160"
                      stroke="#FFE4C4"
                      strokeWidth="4"
                      strokeLinecap="round"
                      animate={{
                        y2: [160, 153, 160],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                    <motion.line
                      x1="127"
                      y1="143"
                      x2="135"
                      y2="157"
                      stroke="#FFE4C4"
                      strokeWidth="4"
                      strokeLinecap="round"
                      animate={{
                        y2: [157, 164, 157],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    />
                  </motion.g>

                  {/* Enhanced Bubbles */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.circle
                      key={`bubble-${i}`}
                      cx={95 + i * 8}
                      cy={155}
                      r={2 + Math.random() * 2.5}
                      fill={currentAdventure.color}
                      opacity="0.6"
                      animate={{
                        y: [0, -50, -100],
                        opacity: [0.6, 0.4, 0],
                        scale: [1, 1.3, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Swimming path trail */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`trail-${i}`}
                      cx={90 - i * 15}
                      cy={120}
                      r="3"
                      fill="white"
                      opacity="0.4"
                      animate={{
                        scale: [1, 0.5, 0],
                        opacity: [0.4, 0.2, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Surfing - Enhanced */}
              {currentAdventure.type === "surfing" && (
                <g>
                  {/* Enhanced Ocean Wave */}
                  <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={currentAdventure.color} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={currentAdventure.color} stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 45 140 Q 75 115 105 140 T 195 140 L 195 190 L 45 190 Z"
                    fill="url(#waveGrad)"
                    animate={{
                      d: [
                        "M 45 140 Q 75 115 105 140 T 195 140 L 195 190 L 45 190 Z",
                        "M 45 140 Q 75 125 105 140 T 195 140 L 195 190 L 45 190 Z",
                        "M 45 140 Q 75 115 105 140 T 195 140 L 195 190 L 45 190 Z",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Wave foam */}
                  <motion.path
                    d="M 45 138 Q 75 113 105 138 T 195 138"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.6"
                    animate={{
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />

                  {/* Surfboard with gradient */}
                  <defs>
                    <linearGradient id="surfboardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="100%" stopColor="#FF8787" />
                    </linearGradient>
                  </defs>
                  <motion.ellipse
                    cx="120"
                    cy="128"
                    rx="38"
                    ry="9"
                    fill="url(#surfboardGrad)"
                    opacity="0.95"
                    animate={{
                      y: [-4, 0, -4],
                      rotate: [-6, 0, -6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "120px 128px" }}
                  />
                  {/* Surfboard stripe */}
                  <motion.ellipse
                    cx="120"
                    cy="128"
                    rx="35"
                    ry="3"
                    fill="#FFF"
                    opacity="0.4"
                    animate={{
                      y: [-4, 0, -4],
                      rotate: [-6, 0, -6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "120px 128px" }}
                  />

                  {/* Enhanced Cute Character on Surfboard */}
                  <motion.g
                    animate={{
                      y: [-4, 0, -4],
                      rotate: [-2.5, 2.5, -2.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "120px 108px" }}
                  >
                    {/* Head */}
                    <circle cx="120" cy="90" r="18" fill="#FFE4C4" />
                    {/* Cheeks */}
                    <circle cx="108" cy="94" r="3.5" fill="#FFB6C1" opacity="0.7" />
                    <circle cx="132" cy="94" r="3.5" fill="#FFB6C1" opacity="0.7" />
                    {/* Hair flowing in wind */}
                    <motion.path
                      d="M 104 83 Q 120 73 128 78"
                      fill="#8B4513"
                      animate={{
                        d: ["M 104 83 Q 120 73 128 78", "M 104 83 Q 120 70 130 76", "M 104 83 Q 120 73 128 78"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <circle cx="110" cy="78" r="5" fill="#8B4513" />
                    <circle cx="125" cy="75" r="4" fill="#8B4513" />
                    {/* Eyes - Excited */}
                    <circle cx="113" cy="88" r="3" fill="#000" />
                    <circle cx="114" cy="87" r="1.5" fill="#FFF" />
                    <circle cx="127" cy="88" r="3" fill="#000" />
                    <circle cx="128" cy="87" r="1.5" fill="#FFF" />
                    {/* Big Smile */}
                    <path d="M 110 96 Q 120 100 130 96" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Body */}
                    <ellipse cx="120" cy="113" rx="15" ry="17" fill={currentAdventure.color} opacity="0.9" />
                    {/* Wetsuit detail */}
                    <path d="M 112 105 L 120 110 L 128 105" stroke="#FFF" strokeWidth="1.5" fill="none" opacity="0.5" />
                    
                    {/* Arms - Balancing */}
                    <motion.line
                      x1="105"
                      y1="113"
                      x2="78"
                      y2="100"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        rotate: [6, -6, 6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      style={{ transformOrigin: "105px 113px" }}
                    />
                    <motion.line
                      x1="135"
                      y1="113"
                      x2="162"
                      y2="100"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        rotate: [-6, 6, -6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      style={{ transformOrigin: "135px 113px" }}
                    />
                    {/* Hands */}
                    <circle cx="78" cy="100" r="4" fill="#FFE4C4" />
                    <circle cx="162" cy="100" r="4" fill="#FFE4C4" />
                  </motion.g>

                  {/* Enhanced Water Splashes */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.circle
                      key={`splash-${i}`}
                      cx={85 + i * 22}
                      cy={133}
                      r="3.5"
                      fill={currentAdventure.color}
                      opacity="0.7"
                      animate={{
                        y: [0, -18, -35],
                        opacity: [0.7, 0.4, 0],
                        scale: [1, 0.6, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}

                  {/* Enhanced Sun */}
                  <motion.circle
                    cx="175"
                    cy="65"
                    r="14"
                    fill="#FFB84D"
                    opacity="0.8"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  {/* Sun rays */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.line
                      key={`ray-${i}`}
                      x1="175"
                      y1="65"
                      x2={175 + Math.cos((i * Math.PI) / 4) * 22}
                      y2={65 + Math.sin((i * Math.PI) / 4) * 22}
                      stroke="#FFB84D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.7"
                      animate={{
                        opacity: [0.7, 0.4, 0.7],
                        strokeWidth: [2.5, 3.5, 2.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Add similar enhanced implementations for hiking, boating, biking, photography, camping, dining, and beachRelax... */}
              {/* For brevity, I'll include a few more key activities */}

              {/* Hiking - Enhanced */}
              {currentAdventure.type === "hiking" && (
                <g>
                  {/* Mountain Trail */}
                  <motion.path
                    d="M 45 170 L 65 150 L 85 155 L 105 138 L 125 143 L 145 128 L 165 138 L 185 123"
                    stroke={currentAdventure.color}
                    strokeWidth="4"
                    strokeDasharray="6 6"
                    fill="none"
                    opacity="0.6"
                    animate={{
                      strokeDashoffset: [0, -12],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Mountains in Background with gradients */}
                  <path d="M 45 148 L 75 95 L 105 148 Z" fill="#9CA3AF" opacity="0.25" />
                  <path d="M 85 138 L 115 85 L 145 138 Z" fill="#9CA3AF" opacity="0.3" />
                  <path d="M 125 143 L 155 100 L 185 143 Z" fill="#9CA3AF" opacity="0.25" />

                  {/* Trees */}
                  {[0, 1, 2, 3].map((i) => (
                    <g key={`tree-${i}`}>
                      <rect x={55 + i * 35} y="165" width="5" height="14" fill="#8B4513" opacity="0.7" />
                      <path
                        d={`M ${57.5 + i * 35} 165 L ${50 + i * 35} 155 L ${65 + i * 35} 155 Z`}
                        fill={currentAdventure.color}
                        opacity="0.6"
                      />
                      <path
                        d={`M ${57.5 + i * 35} 160 L ${52 + i * 35} 152 L ${63 + i * 35} 152 Z`}
                        fill={currentAdventure.color}
                        opacity="0.7"
                      />
                    </g>
                  ))}

                  {/* Enhanced Cute Character Hiking */}
                  <motion.g
                    animate={{
                      x: [0, 4, 0],
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Head */}
                    <circle cx="120" cy="105" r="18" fill="#FFE4C4" />
                    {/* Cheeks */}
                    <circle cx="108" cy="109" r="3.5" fill="#FFB6C1" opacity="0.7" />
                    <circle cx="132" cy="109" r="3.5" fill="#FFB6C1" opacity="0.7" />
                    {/* Adventure Hat */}
                    <ellipse cx="120" cy="100" rx="20" ry="6" fill={currentAdventure.color} opacity="0.95" />
                    <path d="M 105 100 L 120 91 L 135 100" fill={currentAdventure.color} opacity="0.95" />
                    <ellipse cx="120" cy="91" rx="8" ry="3" fill={currentAdventure.color} opacity="0.8" />
                    {/* Eyes */}
                    <circle cx="113" cy="105" r="3" fill="#000" />
                    <circle cx="114" cy="104" r="1.5" fill="#FFF" />
                    <circle cx="127" cy="105" r="3" fill="#000" />
                    <circle cx="128" cy="104" r="1.5" fill="#FFF" />
                    {/* Happy Smile */}
                    <path d="M 112 111 Q 120 114 128 111" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    
                    {/* Backpack */}
                    <rect x="113" y="125" width="14" height="16" rx="3" fill="#FF6B6B" opacity="0.9" />
                    <rect x="116" y="127" width="8" height="10" rx="2" fill="#FFF" opacity="0.3" />
                    <line x1="116" y1="125" x2="116" y2="118" stroke="#FF6B6B" strokeWidth="3" />
                    <line x1="124" y1="125" x2="124" y2="118" stroke="#FF6B6B" strokeWidth="3" />
                    
                    {/* Body */}
                    <ellipse cx="120" cy="130" rx="14" ry="16" fill={currentAdventure.color} opacity="0.85" />
                    
                    {/* Arms */}
                    <motion.line
                      x1="106"
                      y1="128"
                      x2="88"
                      y2="138"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        rotate: [0, -12, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      style={{ transformOrigin: "106px 128px" }}
                    />
                    <line x1="134" y1="128" x2="145" y2="125" stroke="#FFE4C4" strokeWidth="5" strokeLinecap="round" />
                    {/* Hiking Stick */}
                    <line x1="145" y1="125" x2="152" y2="162" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="152" cy="165" r="3" fill="#8B4513" />
                    
                    {/* Legs - Walking */}
                    <motion.line
                      x1="113"
                      y1="146"
                      x2="106"
                      y2="165"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        rotate: [0, 18, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      style={{ transformOrigin: "113px 146px" }}
                    />
                    <motion.line
                      x1="127"
                      y1="146"
                      x2="134"
                      y2="165"
                      stroke="#FFE4C4"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        rotate: [0, -18, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.75,
                      }}
                      style={{ transformOrigin: "127px 146px" }}
                    />
                    {/* Hiking boots */}
                    <ellipse cx="106" cy="167" rx="5" ry="3" fill="#654321" />
                    <ellipse cx="134" cy="167" rx="5" ry="3" fill="#654321" />
                  </motion.g>

                  {/* Footprints on trail */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.g
                      key={`footprint-${i}`}
                      opacity="0.35"
                      animate={{
                        opacity: [0, 0.35, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    >
                      <ellipse cx={65 + i * 22} cy={155 - i * 4} rx="3.5" ry="6" fill={currentAdventure.color} />
                    </motion.g>
                  ))}

                  {/* Birds in sky */}
                  {[0, 1].map((i) => (
                    <motion.path
                      key={`bird-${i}`}
                      d={`M ${60 + i * 30} ${75 + i * 8} q 5 -3 10 0`}
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                      animate={{
                        x: [0, 40, 80],
                        opacity: [0.4, 0.6, 0.4],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        delay: i * 2,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Boating - Enhanced */}
              {currentAdventure.type === "boating" && (
                <g>
                  {/* Water with gradient */}
                  <defs>
                    <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={currentAdventure.color} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={currentAdventure.color} stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.path
                      key={`water-${i}`}
                      d={`M 35 ${145 + i * 9} Q 85 ${140 + i * 9} 120 ${145 + i * 9} T 205 ${145 + i * 9}`}
                      stroke="url(#seaGrad)"
                      strokeWidth="2.5"
                      fill="none"
                      opacity={0.35 - i * 0.05}
                      animate={{
                        x: [0, -18, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2,
                      }}
                    />
                  ))}

                  {/* Enhanced Boat */}
                  <motion.g
                    animate={{
                      y: [-3, 3, -3],
                      rotate: [-1.5, 1.5, -1.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "120px 135px" }}
                  >
                    {/* Boat Hull - more detailed */}
                    <defs>
                      <linearGradient id="boatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A0522D" />
                        <stop offset="100%" stopColor="#8B4513" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 75 138 Q 80 128 120 128 Q 160 128 165 138 L 160 144 Q 120 147 80 144 Z"
                      fill="url(#boatGrad)"
                      opacity="0.9"
                    />
                    <path
                      d="M 80 144 Q 120 147 160 144 L 155 150 Q 120 153 85 150 Z"
                      fill="#654321"
                      opacity="0.7"
                    />
                    {/* Boat details */}
                    <line x1="90" y1="138" x2="90" y2="144" stroke="#FFF" strokeWidth="1.5" opacity="0.3" />
                    <line x1="120" y1="138" x2="120" y2="147" stroke="#FFF" strokeWidth="1.5" opacity="0.3" />
                    <line x1="150" y1="138" x2="150" y2="144" stroke="#FFF" strokeWidth="1.5" opacity="0.3" />

                    {/* Enhanced Cute Character in Boat */}
                    <g>
                      {/* Head */}
                      <circle cx="120" cy="108" r="17" fill="#FFE4C4" />
                      {/* Cheeks */}
                      <circle cx="109" cy="111" r="3.5" fill="#FFB6C1" opacity="0.7" />
                      <circle cx="131" cy="111" r="3.5" fill="#FFB6C1" opacity="0.7" />
                      {/* Sailor Hat */}
                      <ellipse cx="120" cy="103" rx="18" ry="5" fill="white" opacity="0.95" />
                      <rect x="113" y="94" width="14" height="9" fill="white" opacity="0.95" />
                      <rect x="115" y="94" width="10" height="4" fill={currentAdventure.color} opacity="0.9" />
                      {/* Eyes */}
                      <circle cx="113" cy="108" r="3" fill="#000" />
                      <circle cx="114" cy="107" r="1.5" fill="#FFF" />
                      <circle cx="127" cy="108" r="3" fill="#000" />
                      <circle cx="128" cy="107" r="1.5" fill="#FFF" />
                      {/* Happy Smile */}
                      <path d="M 112 114 Q 120 117 128 114" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                      
                      {/* Body */}
                      <ellipse cx="120" cy="128" rx="13" ry="14" fill={currentAdventure.color} opacity="0.9" />
                      {/* Sailor collar */}
                      <path d="M 110 122 L 120 127 L 130 122" stroke="white" strokeWidth="2" fill="none" />
                      
                      {/* Arms - Rowing */}
                      <motion.line
                        x1="107"
                        y1="125"
                        x2="82"
                        y2="125"
                        stroke="#FFE4C4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{
                          x2: [82, 77, 82],
                          y2: [125, 120, 125],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <motion.line
                        x1="133"
                        y1="125"
                        x2="158"
                        y2="125"
                        stroke="#FFE4C4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{
                          x2: [158, 163, 158],
                          y2: [125, 120, 125],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      />
                    </g>

                    {/* Enhanced Oars */}
                    <motion.g
                      animate={{
                        rotate: [0, -18, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      style={{ transformOrigin: "82px 125px" }}
                    >
                      <line
                        x1="82"
                        y1="125"
                        x2="60"
                        y2="137"
                        stroke="#8B4513"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <ellipse
                        cx="52"
                        cy="141"
                        rx="10"
                        ry="5"
                        fill="#8B4513"
                        opacity="0.8"
                      />
                    </motion.g>

                    <motion.g
                      animate={{
                        rotate: [0, 18, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1,
                      }}
                      style={{ transformOrigin: "158px 125px" }}
                    >
                      <line
                        x1="158"
                        y1="125"
                        x2="180"
                        y2="137"
                        stroke="#8B4513"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <ellipse
                        cx="188"
                        cy="141"
                        rx="10"
                        ry="5"
                        fill="#8B4513"
                        opacity="0.8"
                      />
                    </motion.g>
                  </motion.g>

                  {/* Fish jumping - enhanced */}
                  <motion.g
                    animate={{
                      y: [0, -35, 0],
                      x: [0, 12, 25],
                      rotate: [0, -25, -50],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ellipse cx="168" cy="155" rx="10" ry="5" fill={currentAdventure.color} opacity="0.7" />
                    <path d="M 178 155 L 185 152 L 185 158 Z" fill={currentAdventure.color} opacity="0.7" />
                    <circle cx="172" cy="154" r="1.5" fill="#000" opacity="0.5" />
                  </motion.g>

                  {/* Enhanced Clouds */}
                  {[0, 1].map((i) => (
                    <motion.g
                      key={`cloud-${i}`}
                      animate={{
                        x: [0, 25, 0],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        delay: i * 3,
                      }}
                    >
                      <circle cx={65 + i * 90} cy={55 + i * 12} r="9" fill="white" opacity="0.7" />
                      <circle cx={74 + i * 90} cy={55 + i * 12} r="11" fill="white" opacity="0.7" />
                      <circle cx={83 + i * 90} cy={55 + i * 12} r="9" fill="white" opacity="0.7" />
                    </motion.g>
                  ))}

                  {/* Seagull */}
                  <motion.path
                    d="M 180 70 q 5 -3 10 0"
                    stroke="#333"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.5"
                    animate={{
                      x: [0, -60, -120],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                    }}
                  />
                </g>
              )}

              {/* Biking */}
              {currentAdventure.type === "biking" && (
                <g>
                  {/* Road */}
                  <rect x="40" y="155" width="160" height="30" fill="#555" opacity="0.3" />
                  <motion.rect
                    x="40"
                    y="168"
                    width="30"
                    height="4"
                    fill="white"
                    opacity="0.5"
                    animate={{
                      x: [40, 200],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Bike */}
                  <motion.g
                    animate={{
                      x: [0, 5, 0],
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                    }}
                  >
                    {/* Back wheel */}
                    <motion.circle
                      cx="95"
                      cy="145"
                      r="12"
                      fill="none"
                      stroke={currentAdventure.color}
                      strokeWidth="3"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ transformOrigin: "95px 145px" }}
                    />
                    <line x1="95" y1="133" x2="95" y2="157" stroke={currentAdventure.color} strokeWidth="1.5" />
                    <line x1="83" y1="145" x2="107" y2="145" stroke={currentAdventure.color} strokeWidth="1.5" />

                    {/* Front wheel */}
                    <motion.circle
                      cx="145"
                      cy="145"
                      r="12"
                      fill="none"
                      stroke={currentAdventure.color}
                      strokeWidth="3"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ transformOrigin: "145px 145px" }}
                    />
                    <line x1="145" y1="133" x2="145" y2="157" stroke={currentAdventure.color} strokeWidth="1.5" />
                    <line x1="133" y1="145" x2="157" y2="145" stroke={currentAdventure.color} strokeWidth="1.5" />

                    {/* Frame */}
                    <path d="M 95 145 L 120 115 L 145 145" stroke={currentAdventure.color} strokeWidth="3" fill="none" />
                    <path d="M 120 115 L 120 125 L 95 145" stroke={currentAdventure.color} strokeWidth="3" fill="none" />
                    <path d="M 120 125 L 145 125" stroke={currentAdventure.color} strokeWidth="3" fill="none" />

                    {/* Character on bike */}
                    <g>
                      {/* Head */}
                      <circle cx="120" cy="95" r="16" fill="#FFE4C4" />
                      {/* Helmet */}
                      <path d="M 107 92 Q 120 82 133 92" fill={currentAdventure.color} opacity="0.9" />
                      <ellipse cx="120" cy="82" rx="8" ry="3" fill={currentAdventure.color} opacity="0.7" />
                      {/* Eyes */}
                      <circle cx="114" cy="95" r="2.5" fill="#000" />
                      <circle cx="126" cy="95" r="2.5" fill="#000" />
                      {/* Smile */}
                      <path d="M 113 100 Q 120 103 127 100" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                      {/* Body */}
                      <ellipse cx="120" cy="115" rx="12" ry="14" fill={currentAdventure.color} opacity="0.8" />

                      {/* Arms */}
                      <line x1="108" y1="113" x2="145" y2="125" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                      <line x1="132" y1="113" x2="145" y2="125" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />

                      {/* Legs - pedaling */}
                      <motion.line
                        x1="115"
                        y1="129"
                        x2="110"
                        y2="142"
                        stroke="#FFE4C4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{
                          rotate: [0, 180],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{ transformOrigin: "120px 125px" }}
                      />
                      <motion.line
                        x1="125"
                        y1="129"
                        x2="130"
                        y2="142"
                        stroke="#FFE4C4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{
                          rotate: [0, 180],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.5,
                        }}
                        style={{ transformOrigin: "120px 125px" }}
                      />
                    </g>
                  </motion.g>

                  {/* Speed lines */}
                  {[0, 1, 2].map((i) => (
                    <motion.line
                      key={`speed-${i}`}
                      x1={70 - i * 15}
                      y1={120 + i * 10}
                      x2={85 - i * 15}
                      y2={120 + i * 10}
                      stroke={currentAdventure.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.4"
                      animate={{
                        x1: [70 - i * 15, 180 - i * 15],
                        x2: [85 - i * 15, 195 - i * 15],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Photography */}
              {currentAdventure.type === "photography" && (
                <g>
                  {/* Scenic background */}
                  <circle cx="170" cy="80" r="20" fill="#FFD700" opacity="0.3" />
                  <path d="M 50 130 L 80 110 L 110 125 L 140 105 L 170 120 L 190 130 L 190 160 L 50 160 Z" fill={currentAdventure.color} opacity="0.2" />

                  {/* Character with camera */}
                  <g>
                    {/* Head */}
                    <circle cx="120" cy="100" r="18" fill="#FFE4C4" />
                    {/* Hair */}
                    <path d="M 105 93 Q 120 85 135 93" fill="#8B4513" />
                    {/* Eyes - focused */}
                    <circle cx="113" cy="100" r="2.5" fill="#000" />
                    <circle cx="127" cy="100" r="2.5" fill="#000" />
                    {/* Smile */}
                    <path d="M 113 107 Q 120 110 127 107" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Body */}
                    <ellipse cx="120" cy="125" rx="14" ry="16" fill={currentAdventure.color} opacity="0.85" />

                    {/* Arms holding camera */}
                    <line x1="106" y1="120" x2="105" y2="115" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="134" y1="120" x2="135" y2="115" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />

                    {/* Camera */}
                    <rect x="105" y="110" width="30" height="18" rx="2" fill="#333" />
                    <circle cx="120" cy="119" r="7" fill="#444" />
                    <circle cx="120" cy="119" r="5" fill="#666" />
                    <rect x="128" y="113" width="4" height="3" fill="#666" />
                    
                    {/* Flash effect */}
                    <motion.g
                      animate={{
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <line x1="120" y1="105" x2="115" y2="95" stroke="white" strokeWidth="2" opacity="0.8" />
                      <line x1="120" y1="105" x2="120" y2="95" stroke="white" strokeWidth="2" opacity="0.8" />
                      <line x1="120" y1="105" x2="125" y2="95" stroke="white" strokeWidth="2" opacity="0.8" />
                    </motion.g>

                    {/* Legs */}
                    <line x1="113" y1="141" x2="108" y2="158" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="127" y1="141" x2="132" y2="158" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                  </g>

                  {/* Photo frames floating */}
                  {[0, 1, 2].map((i) => (
                    <motion.rect
                      key={`photo-${i}`}
                      x={160 + i * 15}
                      y={140}
                      width="12"
                      height="14"
                      fill="white"
                      stroke={currentAdventure.color}
                      strokeWidth="1.5"
                      animate={{
                        y: [140, 120, 100],
                        opacity: [0, 1, 0],
                        rotate: [0, 10, 20],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Camping */}
              {currentAdventure.type === "camping" && (
                <g>
                  {/* Stars */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.circle
                      key={`star-${i}`}
                      cx={60 + i * 25}
                      cy={60 + (i % 2) * 15}
                      r="2"
                      fill="white"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Moon */}
                  <circle cx="180" cy="70" r="15" fill="white" opacity="0.8" />
                  <circle cx="185" cy="68" r="14" fill="#1e293b" />

                  {/* Tent */}
                  <path d="M 90 140 L 120 100 L 150 140 Z" fill={currentAdventure.color} opacity="0.9" />
                  <path d="M 120 100 L 120 140" stroke="#FFF" strokeWidth="2" opacity="0.3" />
                  <path d="M 95 135 L 145 135" stroke="#FFF" strokeWidth="1.5" opacity="0.4" />

                  {/* Campfire */}
                  <motion.g
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    {/* Fire */}
                    <motion.path
                      d="M 165 145 Q 168 135 165 125 Q 172 135 168 145 Z"
                      fill="#FF6B6B"
                      animate={{
                        d: [
                          "M 165 145 Q 168 135 165 125 Q 172 135 168 145 Z",
                          "M 165 145 Q 170 133 165 125 Q 174 137 168 145 Z",
                          "M 165 145 Q 168 135 165 125 Q 172 135 168 145 Z",
                        ],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                    />
                    <motion.path
                      d="M 167 143 Q 170 138 167 133"
                      stroke="#FFB84D"
                      strokeWidth="2"
                      fill="none"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                    />
                  </motion.g>

                  {/* Logs */}
                  <rect x="160" y="148" width="15" height="4" fill="#8B4513" />
                  <rect x="158" y="152" width="18" height="4" fill="#8B4513" />

                  {/* Character sitting by fire */}
                  <g>
                    {/* Head */}
                    <circle cx="110" cy="125" r="16" fill="#FFE4C4" />
                    {/* Beanie */}
                    <path d="M 96 120 Q 110 112 124 120 L 124 125 L 96 125 Z" fill={currentAdventure.color} opacity="0.9" />
                    <circle cx="110" cy="115" r="2.5" fill={currentAdventure.color} />
                    {/* Eyes */}
                    <circle cx="105" cy="125" r="2.5" fill="#000" />
                    <circle cx="115" cy="125" r="2.5" fill="#000" />
                    {/* Happy smile */}
                    <path d="M 105 130 Q 110 133 115 130" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Body - sitting */}
                    <ellipse cx="110" cy="148" rx="14" ry="12" fill={currentAdventure.color} opacity="0.85" />
                    
                    {/* Arms */}
                    <line x1="96" y1="145" x2="90" y2="150" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="124" y1="145" x2="130" y2="150" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                  </g>

                  {/* Smoke from fire */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`smoke-${i}`}
                      cx="167"
                      cy="125"
                      r="3"
                      fill="#999"
                      opacity="0.4"
                      animate={{
                        y: [0, -30, -60],
                        opacity: [0.4, 0.2, 0],
                        scale: [1, 1.5, 2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.8,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Dining */}
              {currentAdventure.type === "dining" && (
                <g>
                  {/* Table */}
                  <ellipse cx="120" cy="135" rx="45" ry="12" fill="#8B4513" opacity="0.6" />
                  <rect x="78" y="135" width="84" height="6" fill="#8B4513" opacity="0.7" />

                  {/* Plates */}
                  <ellipse cx="95" cy="132" rx="15" ry="5" fill="white" opacity="0.9" />
                  <ellipse cx="145" cy="132" rx="15" ry="5" fill="white" opacity="0.9" />

                  {/* Food */}
                  <circle cx="95" cy="130" r="8" fill={currentAdventure.color} opacity="0.7" />
                  <circle cx="92" cy="128" r="3" fill="#FFB84D" />
                  <circle cx="98" cy="128" r="3" fill="#10B981" />
                  
                  <circle cx="145" cy="130" r="8" fill="#FF6B6B" opacity="0.7" />
                  <circle cx="142" cy="128" r="3" fill="#FFB84D" />
                  <circle cx="148" cy="128" r="3" fill="#10B981" />

                  {/* Glasses */}
                  <rect x="113" y="128" width="6" height="10" rx="1" fill="#87CEEB" opacity="0.6" />
                  <rect x="122" y="128" width="6" height="10" rx="1" fill="#87CEEB" opacity="0.6" />

                  {/* Character eating */}
                  <g>
                    {/* Head */}
                    <circle cx="120" cy="100" r="18" fill="#FFE4C4" />
                    {/* Hair */}
                    <path d="M 105 93 Q 120 85 135 93" fill="#8B4513" />
                    {/* Eyes - happy */}
                    <motion.path
                      d="M 111 98 Q 114 100 117 98"
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      animate={{
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />
                    <motion.path
                      d="M 123 98 Q 126 100 129 98"
                      stroke="#000"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      animate={{
                        scaleY: [1, 0.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: 0.1,
                      }}
                    />
                    {/* Big smile */}
                    <path d="M 110 108 Q 120 113 130 108" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />

                    {/* Body */}
                    <ellipse cx="120" cy="125" rx="14" ry="14" fill={currentAdventure.color} opacity="0.85" />

                    {/* Arms - holding fork and spoon */}
                    <line x1="106" y1="118" x2="85" y2="125" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="134" y1="118" x2="155" y2="125" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Fork */}
                    <line x1="85" y1="125" x2="85" y2="135" stroke="#C0C0C0" strokeWidth="2" />
                    <line x1="83" y1="135" x2="83" y2="138" stroke="#C0C0C0" strokeWidth="1.5" />
                    <line x1="85" y1="135" x2="85" y2="138" stroke="#C0C0C0" strokeWidth="1.5" />
                    <line x1="87" y1="135" x2="87" y2="138" stroke="#C0C0C0" strokeWidth="1.5" />
                    
                    {/* Spoon */}
                    <line x1="155" y1="125" x2="155" y2="135" stroke="#C0C0C0" strokeWidth="2" />
                    <ellipse cx="155" cy="138" rx="3" ry="4" fill="#C0C0C0" />
                  </g>

                  {/* Steam from food */}
                  {[0, 1].map((i) => (
                    <motion.path
                      key={`steam-${i}`}
                      d={`M ${95 + i * 50} 122 Q ${98 + i * 50} 115 ${95 + i * 50} 108`}
                      stroke={currentAdventure.color}
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.5"
                      animate={{
                        y: [0, -10, -20],
                        opacity: [0.5, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}

                  {/* Heart (love for food) */}
                  <motion.path
                    d="M 140 90 c -2 -2 -5 -2 -7 0 c -2 -2 -5 -2 -7 0 c -2 2 -2 5 0 7 l 7 7 l 7 -7 c 2 -2 2 -5 0 -7 Z"
                    fill={currentAdventure.color}
                    opacity="0.7"
                    animate={{
                      scale: [0, 1.2, 1, 0],
                      opacity: [0, 0.9, 0.7, 0],
                      y: [0, -10, -20, -30],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />
                </g>
              )}

              {/* Beach Relaxing */}
              {currentAdventure.type === "beachRelax" && (
                <g>
                  {/* Beach umbrella */}
                  <defs>
                    <linearGradient id="umbrellaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={currentAdventure.color} />
                      <stop offset="50%" stopColor="white" stopOpacity="0.7" />
                      <stop offset="100%" stopColor={currentAdventure.color} />
                    </linearGradient>
                  </defs>
                  <line x1="160" y1="90" x2="160" y2="145" stroke="#8B4513" strokeWidth="3" />
                  <path d="M 135 90 Q 160 75 185 90 L 160 90 Z" fill="url(#umbrellaGrad)" opacity="0.9" />
                  <path d="M 140 90 L 160 80 L 180 90" stroke="white" strokeWidth="1.5" opacity="0.4" />

                  {/* Beach chair/towel */}
                  <rect x="85" y="135" width="50" height="25" rx="3" fill={currentAdventure.color} opacity="0.7" />
                  <rect x="88" y="138" width="44" height="5" fill="white" opacity="0.3" />

                  {/* Sand */}
                  <ellipse cx="120" cy="168" rx="70" ry="10" fill="#F4A460" opacity="0.3" />

                  {/* Character relaxing */}
                  <g>
                    {/* Head with sunglasses */}
                    <circle cx="110" cy="140" r="16" fill="#FFE4C4" />
                    {/* Hair */}
                    <path d="M 96 135 Q 110 128 124 135" fill="#8B4513" />
                    {/* Sunglasses */}
                    <rect x="102" y="138" width="16" height="6" rx="2" fill="#333" opacity="0.8" />
                    <ellipse cx="106" cy="141" rx="4" ry="3" fill="#1e293b" />
                    <ellipse cx="114" cy="141" rx="4" ry="3" fill="#1e293b" />
                    {/* Smile */}
                    <path d="M 105 148 Q 110 151 115 148" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Body - lying down */}
                    <ellipse cx="110" cy="148" rx="12" ry="8" fill={currentAdventure.color} opacity="0.8" />
                    
                    {/* Arms - relaxed */}
                    <line x1="98" y1="148" x2="88" y2="145" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="122" y1="148" x2="132" y2="145" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    
                    {/* Legs */}
                    <line x1="105" y1="156" x2="100" y2="165" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                    <line x1="115" y1="156" x2="120" y2="165" stroke="#FFE4C4" strokeWidth="4" strokeLinecap="round" />
                  </g>

                  {/* Drink with straw */}
                  <rect x="140" y="145" width="8" height="12" rx="1" fill="#FFB84D" opacity="0.7" />
                  <ellipse cx="144" cy="145" rx="4" ry="2" fill="#FF6B6B" opacity="0.5" />
                  <line x1="146" y1="145" x2="150" y2="135" stroke="#333" strokeWidth="2" />
                  <rect x="145" y="133" width="8" height="3" rx="1" fill="#FF6B6B" opacity="0.6" />

                  {/* Starfish */}
                  <motion.path
                    d="M 70 155 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -4 l -6 4 l 1 -7 l -5 -5 l 7 -1 Z"
                    fill="#FF6B6B"
                    opacity="0.6"
                    animate={{
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    style={{ transformOrigin: "70px 162px" }}
                  />

                  {/* Seashell */}
                  <ellipse cx="175" cy="160" rx="5" ry="6" fill="white" opacity="0.8" />
                  <path d="M 175 154 L 175 166" stroke="#E5E7EB" strokeWidth="1" />
                  <path d="M 172 157 L 178 163" stroke="#E5E7EB" strokeWidth="0.5" />
                  <path d="M 178 157 L 172 163" stroke="#E5E7EB" strokeWidth="0.5" />

                  {/* Sun rays */}
                  {[0, 1, 2].map((i) => (
                    <motion.line
                      key={`sunray-${i}`}
                      x1={50 + i * 35}
                      y1="70"
                      x2={52 + i * 35}
                      y2="60"
                      stroke="#FFB84D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.6"
                      animate={{
                        opacity: [0.6, 0.3, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* "Zzz" for relaxation */}
                  <motion.text
                    x="125"
                    y="128"
                    fill={currentAdventure.color}
                    opacity="0.6"
                    style={{ fontSize: "14px", fontFamily: "sans-serif" }}
                    animate={{
                      y: [128, 118, 108],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                  >
                    z
                  </motion.text>
                  <motion.text
                    x="130"
                    y="125"
                    fill={currentAdventure.color}
                    opacity="0.6"
                    style={{ fontSize: "16px", fontFamily: "sans-serif" }}
                    animate={{
                      y: [125, 115, 105],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  >
                    z
                  </motion.text>
                  <motion.text
                    x="137"
                    y="122"
                    fill={currentAdventure.color}
                    opacity="0.6"
                    style={{ fontSize: "18px", fontFamily: "sans-serif" }}
                    animate={{
                      y: [122, 112, 102],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  >
                    z
                  </motion.text>
                </g>
              )}
            </svg>
          </motion.div>
        </AnimatePresence>

        {/* Pulsing Ring on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white/40"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.15, opacity: [0.6, 0, 0.6] }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

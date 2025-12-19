import { motion } from "motion/react";
import logo from "./login/assets/BondVoyage Logo only.png"


export function LoadingOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #0A7AFF, #0e62cc, #14B8A6)",
      }}
    >
      {/* Animated background circles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: "-25%",
            left: "-25%",
            width: "50%",
            height: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            bottom: "-25%",
            right: "-25%",
            width: "50%",
            height: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Logo container with pulse animation */}
        <motion.div
          style={{
            position: "relative",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer glow ring */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              margin: "-2rem",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          
          {/* Middle glow ring */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              margin: "-1rem",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3,
            }}
          />

          {/* Logo circle background */}
          <div
            style={{
              position: "relative",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "2rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <motion.div
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img src={logo} alt="Bond Voyage" className="h-16 w-16"/>
            </motion.div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1
            style={{
              fontSize: "2.25rem",
              color: "white",
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Bond<span style={{ fontWeight: 600 }}>Voyage</span>
          </h1>
          
          {/* Loading dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                style={{
                  width: "0.625rem",
                  height: "0.625rem",
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.875rem",
            letterSpacing: "0.025em",
            margin: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Preparing your adventure...
        </motion.p>
      </div>

      {/* Bottom decorative element */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.75rem",
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "1px",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          />
          <div
            style={{
              width: "2rem",
              height: "1px",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

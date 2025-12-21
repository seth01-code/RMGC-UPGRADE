// components/GlobalPreloader.tsx
"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["600", "700"],
});

const ringVariants = {
  rotate: {
    rotate: [0, 360],
    transition: { repeat: Infinity, duration: 2, ease: "linear" },
  },
};

const dotVariants = {
  bounce: {
    y: [0, -20, 0],
    transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" },
  },
};

const particleVariants = {
  float: (i: number) => ({
    y: [0, -10, 0],
    x: [0, i % 2 === 0 ? 5 : -5, 0],
    opacity: [0.6, 1, 0.6],
    transition: { repeat: Infinity, duration: 1 + i * 0.2, ease: "easeInOut" },
  }),
};

const GlobalPreloader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Neon Spinning Rings */}
      <div className="relative w-40 h-40 mb-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute top-0 left-0 w-full h-full rounded-full border-[3px]`}
            style={{
              borderColor: `rgba(255,165,0,${0.4 + i * 0.2})`,
              boxShadow: `0 0 ${8 + i * 4}px rgba(255,165,0,0.7), 0 0 ${
                16 + i * 8
              }px rgba(255,165,0,0.3)`,
            }}
            variants={ringVariants}
            animate="rotate"
            style={{ transformOrigin: "50% 50%" }}
            transition={{ ...ringVariants.rotate.transition, duration: 2 + i }}
          />
        ))}
      </div>

      {/* Bouncing Neon Dots */}
      <div className="flex space-x-4 mb-6 relative z-10">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-5 h-5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(255,165,0,0.8)]"
            variants={dotVariants}
            animate="bounce"
            transition={{ ...dotVariants.bounce.transition, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Floating Neon Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          className="absolute w-2 h-2 bg-orange-400 rounded-full shadow-[0_0_6px_rgba(255,165,0,0.9)]"
          variants={particleVariants}
          animate="float"
          style={{
            top: `${10 + i * 12}%`,
            left: `${20 + i * 10}%`,
          }}
        />
      ))}

      {/* Loading Text */}
      <motion.div
        className={`${orbitron.variable} text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-orange-400 to-gray-200 bg-clip-text text-transparent tracking-wider`}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <Typewriter
          words={["Loading RMGC..."]}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={90}
          deleteSpeed={50}
          delaySpeed={1500}
        />
      </motion.div>

      {/* Progress Bar-like Pulse */}
      <div className="absolute bottom-12 w-40 h-1 bg-orange-500 rounded-full animate-pulse-fast shadow-md"></div>
    </div>
  );
};

export default GlobalPreloader;

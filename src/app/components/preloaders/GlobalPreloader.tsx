// components/GlobalPreloader.tsx
"use client";

import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const OR = "#FF6B1A";
const ORL = "#FF8C47";

const GlobalPreloader = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${OR}18 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* RMGC watermark */}
      <div
        style={{
          position: "absolute",
          fontSize: "clamp(80px, 20vw, 200px)",
          fontWeight: 900,
          color: "rgba(255,107,26,0.04)",
          letterSpacing: "-0.04em",
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        RMGC
      </div>

      {/* Logo mark — concentric arcs */}
      <div style={{ position: "relative", width: "96px", height: "96px", marginBottom: "40px" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              inset: `${i * 12}px`,
              borderRadius: "50%",
              border: `2px solid transparent`,
              borderTopColor: i === 0 ? OR : i === 1 ? ORL : `${OR}60`,
              borderRightColor: i === 0 ? `${OR}40` : "transparent",
            }}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.2 + i * 0.4,
              ease: "linear",
              direction: i % 2 === 0 ? "normal" : "reverse",
            } as any}
          />
        ))}

        {/* Center dot */}
        <motion.div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: OR,
            boxShadow: `0 0 12px ${OR}`,
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </div>

      {/* Typewriter heading */}
      <div
        style={{
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#FFFFFF",
          marginBottom: "10px",
          minHeight: "44px",
        }}
      >
        <Typewriter
          words={["Renewed Minds", "Global Consult", "RMGC"]}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={75}
          deleteSpeed={40}
          delaySpeed={900}
        />
      </div>

      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: OR,
          marginBottom: "48px",
        }}
      >
        Loading platform…
      </p>

      {/* Progress track */}
      <div
        style={{
          width: "160px",
          height: "2px",
          background: "#1A1A1A",
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "40%",
            background: `linear-gradient(90deg, transparent, ${OR}, ${ORL}, transparent)`,
            borderRadius: "2px",
          }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      {[
        { top: "15%", left: "12%", size: 4, dur: 2.4 },
        { top: "25%", left: "82%", size: 3, dur: 1.8 },
        { top: "70%", left: "8%",  size: 5, dur: 3.0 },
        { top: "75%", left: "88%", size: 3, dur: 2.1 },
        { top: "45%", left: "6%",  size: 4, dur: 2.7 },
        { top: "55%", left: "91%", size: 3, dur: 1.9 },
      ].map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: OR,
            boxShadow: `0 0 8px ${OR}`,
            opacity: 0.5,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: p.dur,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default GlobalPreloader;
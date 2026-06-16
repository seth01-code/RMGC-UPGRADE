// Announcements.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const announcements = [
  { text: "💰 All transactions on RMGC are securely processed and safe!" },
  { text: "📩 Check your messages regularly for updates and new conversations!" },
  { text: "🚀 File uploads: Images 10MB · Videos 100MB · Docs & Audio 10MB" },
];

const Announcements: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#080808] border-b border-[#141414] flex items-center justify-between gap-3 px-5 py-[9px] overflow-hidden">
      {/* Live indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-[5px] h-[5px] rounded-full bg-orange-500 animate-pulse" />
        <span className="text-[10px] text-[#333] tracking-widest font-semibold">LIVE</span>
      </div>

      {/* Sliding text */}
      <div className="flex-1 overflow-hidden relative h-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 text-center text-[12.5px] text-[#888] font-medium whitespace-nowrap"
          >
            {announcements[current].text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Pip indicators */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {announcements.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              i === current ? "bg-orange-500 w-3" : "bg-[#2a2a2a]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Announcements;
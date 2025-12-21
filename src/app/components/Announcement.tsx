"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  text: string;
}

const announcements: Announcement[] = [
  {
    text: "💰 All transactions on RMGC are securely processed and safe! 💰",
  },
  {
    text: "📩 Check your messages regularly for updates and new conversations! 📩",
  },
  {
    text: "🚀 File uploads have limits: Images 10MB, Videos 100MB, Docs/Audio 10MB. Ensure compliance! 🚀",
  },
];

const Announcements: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-black to-gray-800 text-white flex items-center justify-center py-3 px-4 overflow-hidden">
      <div className="w-full max-w-6xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="whitespace-nowrap text-center font-medium text-sm sm:text-base"
          >
            {announcements[current].text}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Announcements;

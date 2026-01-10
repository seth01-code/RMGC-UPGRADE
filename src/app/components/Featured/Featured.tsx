"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import SearchIcon from "../../../assets/images/search.png";
import FeaturedImg from "../../../assets/images/featured.png";

const FloatingCircle = ({
  size,
  color,
  duration,
  delay,
  top,
  left,
}: {
  size: number;
  color: string;
  duration: number;
  delay: number;
  top: string;
  left: string;
}) => (
  <motion.div
    className="absolute rounded-full blur-[60px] opacity-70"
    style={{
      width: size,
      height: size,
      background: color,
      top,
      left,
      boxShadow: `0 0 80px ${color}`,
    }}
    animate={{
      x: [0, 100, -80, 120, -60, 0],
      y: [0, -100, 60, -120, 80, 0],
      rotate: [0, 45, 90, 135, 180, 225, 270, 360],
      scale: [1, 1.1, 0.95, 1.05, 1],
      opacity: [0.7, 1, 0.85, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      delay,
      ease: "easeInOut",
    }}
  />
);

const Featured: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const fullText = `${t("featured.title1")} ${t("featured.title2")} ${t(
    "featured.title3"
  )}`;

  const handleSubmit = () => {
    if (input.trim()) {
      router.push(`/allgigs?search=${encodeURIComponent(input)}`);
    }
  };

  const handlePopularClick = (searchTerm: string) => {
    setInput(searchTerm);
    router.push(`/allgigs?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  // prettier-ignore
  const circles = [
    { size: 260, color: "rgba(255,140,0,0.45)", duration: 10, delay: 0, top: "10%", left: "15%" },
    { size: 200, color: "rgba(0,200,255,0.35)", duration: 11, delay: 1, top: "25%", left: "70%" },
    { size: 280, color: "rgba(255,100,200,0.35)", duration: 9, delay: 1.5, top: "55%", left: "40%" },
    { size: 220, color: "rgba(255,255,255,0.25)", duration: 12, delay: 2, top: "70%", left: "10%" },
    { size: 240, color: "rgba(0,255,200,0.3)", duration: 10, delay: 2.5, top: "80%", left: "55%" },
    { size: 180, color: "rgba(255,200,0,0.35)", duration: 9, delay: 3, top: "15%", left: "85%" },
    { size: 200, color: "rgba(255,255,255,0.2)", duration: 13, delay: 3.5, top: "60%", left: "75%" },
    { size: 240, color: "rgba(255,0,150,0.3)", duration: 10, delay: 4, top: "40%", left: "25%" },
  ];

  return (
    <section className="relative w-full h-auto lg:h-[600px] flex items-center justify-center text-white rounded-bl-[80px] overflow-visible bg-transparent">
      {/* Background Video */}
      <Image
        src="/remote.jpg"
        alt="Background Video"
        fill  
        className="absolute top-0 left-0 w-full h-full object-cover rounded-b-[120px]"
      />
      {/* Floating Circles all around hero */}
      <div className="absolute inset-0 bottom-[-150px] overflow-visible z-[2] pointer-events-none">
        {circles.map((circle, index) => (
          <FloatingCircle key={index} {...circle} />
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 rounded-b-[120px]"></div>

      {/* Content */}
      <div className="relative z-[3] container mx-auto max-w-screen-xl px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16 py-12 lg:py-0">
        {/* Left Content */}
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {fullText}
          </motion.h1>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 mt-6 w-full max-w-xl mx-auto lg:mx-0">
            <div className="flex items-center flex-grow bg-white rounded-lg shadow-md px-4 py-2">
              <Image
                src={SearchIcon}
                alt={t("featured.searchAlt")}
                width={20}
                height={20}
              />
              <input
                type="text"
                placeholder={t("featured.searchPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ml-2 flex-grow text-black placeholder-gray-500 outline-none border-none bg-transparent"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="mt-2 sm:mt-0 w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              {t("featured.searchButton")}
            </button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mt-4 text-sm">
            <span className="font-semibold">{t("featured.popular")}:</span>
            {["Legal Services", "Graphic Design", "Writing"].map((term) => (
              <button
                key={term}
                onClick={() => handlePopularClick(term)}
                className="text-white bg-transparent border border-white py-1 px-3 rounded-full hover:bg-orange-500/30 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section (Illustration) */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <motion.div
            className="w-full max-w-md lg:max-w-lg rounded-lg shadow-lg overflow-hidden"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          >
            <Image
              src={FeaturedImg}
              alt="Featured Illustration"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Featured;

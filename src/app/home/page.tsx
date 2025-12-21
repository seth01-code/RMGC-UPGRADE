"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { useRef } from "react";

// Assets
import CheckIcon from "../../assets/images/check.png";

// Components
import Featured from "../components/Featured/Featured";
import Slide from "../components/Slide/Slide";
import Slider from "../components/Slide/Slider";

// Counter Component with Scroll Trigger
const Counter = ({
  target,
  isVisible,
}: {
  target: number;
  isVisible: boolean;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isVisible) {
      const controls = animate(count, target, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, target, isVisible]);

  return <motion.span>{rounded}</motion.span>;
};

const HomePage: React.FC = () => {
  const features: string[] = [
    "Connect to freelancers with proven business experience",
    "Get matched with the perfect talent",
    "Explore a wide range of service listings",
  ];

  const stats = [
    { label: "Verified Freelancers", value: 350 },
    { label: "Organizations Registered", value: 120 },
    { label: "Successful Projects", value: 480 },
    { label: "Countries Reached", value: 6 },
  ];

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

  const circles = [
    {
      size: 260,
      color: "rgba(255,140,0,0.45)",
      duration: 10,
      delay: 0,
      top: "10%",
      left: "15%",
    },
    {
      size: 200,
      color: "rgba(0,200,255,0.35)",
      duration: 11,
      delay: 1,
      top: "25%",
      left: "70%",
    },
    {
      size: 280,
      color: "rgba(255,100,200,0.35)",
      duration: 9,
      delay: 1.5,
      top: "55%",
      left: "40%",
    },
    {
      size: 220,
      color: "rgba(255,255,255,0.25)",
      duration: 12,
      delay: 2,
      top: "70%",
      left: "10%",
    },
    {
      size: 240,
      color: "rgba(0,255,200,0.3)",
      duration: 10,
      delay: 2.5,
      top: "80%",
      left: "55%",
    },
    {
      size: 180,
      color: "rgba(255,200,0,0.35)",
      duration: 9,
      delay: 3,
      top: "15%",
      left: "85%",
    },
    {
      size: 200,
      color: "rgba(255,255,255,0.2)",
      duration: 13,
      delay: 3.5,
      top: "60%",
      left: "75%",
    },
    {
      size: 240,
      color: "rgba(255,0,150,0.3)",
      duration: 10,
      delay: 4,
      top: "40%",
      left: "25%",
    },
  ];

  // Ref for stats section
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div className="relative bg-gray-100 w-full overflow-hidden">
      {/* Featured Section */}
      <Featured />

      {/* Slider Section */}
      <Slider />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 text-white bg-gray-900 rounded-t-[120px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover rounded-t-[120px]"
        >
          <source src="/call.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 rounded-t-[120px]" />

        {/* Floating Circles */}
        <div className="absolute inset-0 bottom-[-150px] overflow-visible z-[2] pointer-events-none">
          {circles.map((circle, index) => (
            <FloatingCircle key={index} {...circle} />
          ))}
        </div>

        <div className="relative container mx-auto max-w-screen-xl px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
            <motion.h1
              className="text-3xl md:text-5xl font-bold"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              Renewed Minds Global Consult
            </motion.h1>

            <motion.h2
              className="text-xl md:text-3xl font-semibold mt-2 text-gray-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              Empowering businesses and freelancers through innovation
            </motion.h2>

            <div className="mt-6 space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center md:justify-start gap-2 text-gray-300 text-sm md:text-base"
                  initial={{ x: -200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + index * 0.3,
                    ease: "easeOut",
                  }}
                >
                  <Image src={CheckIcon} alt="Check" width={20} height={20} />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <Link href="/about-us">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block mt-6 bg-orange-600 hover:bg-orange-500 text-white py-3 px-8 rounded-lg text-lg font-semibold shadow-lg transition-transform"
              >
                Explore RMGC
              </motion.button>
            </Link>
          </div>

          <motion.div
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Image
              src="https://cdni.iconscout.com/illustration/premium/thumb/little-people-moving-at-huge-monitor-with-graphs-illustration-download-in-svg-png-gif-file-formats--business-character-collaboration-colleague-network-communication-illustrations-2264299.png"
              alt="Business Illustration"
              width={600}
              height={400}
              className="w-full max-w-md md:max-w-lg rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="relative bg-gradient-to-b from-orange-50 to-white py-20 overflow-hidden"
      >
        <div className="container mx-auto px-6 md:px-12 text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Growing Steadily, Impacting Globally
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <h3 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-400 bg-clip-text text-transparent flex items-baseline justify-center md:justify-start">
                  <Counter target={stat.value} isVisible={isInView} />
                  <span className="ml-1 text-orange-500">+</span>
                </h3>
                <p className="mt-3 text-gray-700 font-semibold text-base md:text-lg">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="mt-12 text-gray-600 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            RMGC is building a trusted platform where freelancers and
            organizations thrive together — one successful project at a time.
          </motion.p>
        </div>
      </section>

      <Slide />
    </div>
  );
};

export default HomePage;

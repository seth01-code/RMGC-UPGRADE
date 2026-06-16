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

import CheckIcon from "../../assets/images/check.png";
import Featured from "../components/Featured/Featured";
import Slide from "../components/Slide/Slide";
import Slider from "../components/Slide/Slider";

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
  const features = [
    "Hire verified freelancers for short-term or long-term projects",
    "Organizations can post jobs and access global remote talent",
    "Remote workers discover flexible and high-value opportunities",
    "Secure payments and role-based access for every user",
  ];

  const stats = [
    { label: "Verified Freelancers", value: 350 },
    { label: "Organizations Registered", value: 120 },
    { label: "Successful Projects", value: 480 },
    { label: "Countries Reached", value: 6 },
  ];

  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div className="relative bg-white w-full overflow-hidden">

      {/* ── Featured ── */}
      <Featured />

      {/* ── Slider ── */}
      <Slider />

      {/* ── Hero ── */}
<section className="relative overflow-hidden bg-[#080808]">
  {/* Background image — very subtle */}
  <Image
    src="/explore.jpg"
    alt=""
    fill
    className="absolute inset-0 object-cover opacity-[0.06]"
    priority
  />

  {/* Grid texture overlay */}
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.03]"
    style={{
      backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
    }}
  />

  {/* Orange glow — bottom left origin */}
  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[140px] pointer-events-none" />
  {/* Orange glow — top right */}
  <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-500/8 blur-[100px] pointer-events-none" />

  {/* Top border */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

  <div className="relative z-10 container mx-auto max-w-screen-xl px-6 md:px-12">

    {/* ── Top bar ── */}
    <div className="flex items-center justify-between py-8 border-b border-[#141414]">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        <span className="text-[11px] tracking-widest text-[#444] uppercase font-semibold">
          Renewed Minds Global Consult
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6">
        {["Freelancers", "Organizations", "Remote Work"].map((tag) => (
          <span key={tag} className="text-[11px] text-[#333] tracking-wide">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* ── Main grid ── */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0 min-h-[520px]">

      {/* Left — headline block */}
      <div className="flex flex-col justify-center py-16 lg:py-20 lg:pr-16 lg:border-r lg:border-[#141414] space-y-8">

        {/* Overline tag */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-px w-8 bg-orange-500" />
          <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
            Global Talent Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[42px] md:text-[58px] lg:text-[64px] font-extrabold leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-white">Connecting</span>
          <br />
          <span className="text-white">talent,</span>
          <br />
          <span
            className="text-orange-500"
            style={{
              textShadow: "0 0 60px rgba(249,115,22,0.3)",
            }}
          >
            globally.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          className="text-[15px] text-[#666] max-w-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Freelancers, organizations, and remote talent — all on one
          trusted, secure platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex items-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/about-us">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold py-3 px-7 rounded-xl transition-colors"
            >
              Explore RMGC →
            </motion.button>
          </Link>
          <Link href="/allgigs">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-[13px] font-semibold text-[#555] hover:text-white border border-[#1e1e1e] hover:border-[#333] py-3 px-7 rounded-xl transition-all"
            >
              Browse gigs
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          className="flex items-center gap-5 pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {[
            { value: "350+", label: "Freelancers" },
            { value: "480+", label: "Projects" },
            { value: "6", label: "Countries" },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <span className="w-px h-6 bg-[#1e1e1e]" />}
              <div>
                <p className="text-[15px] font-bold text-white">{item.value}</p>
                <p className="text-[10px] text-[#444] tracking-wide uppercase">{item.label}</p>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Right — feature list panel */}
      <motion.div
        className="hidden lg:flex flex-col justify-center py-16 pl-10 space-y-1"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <p className="text-[10px] tracking-[0.16em] text-[#333] uppercase font-semibold mb-5">
          What we offer
        </p>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="group flex items-start gap-3 p-4 rounded-xl border border-transparent hover:border-[#1e1e1e] hover:bg-[#0e0e0e] transition-all duration-200 cursor-default"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55 + index * 0.1 }}
          >
            <span className="mt-0.5 w-5 h-5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
              <Image src={CheckIcon} alt="" width={10} height={10} />
            </span>
            <span className="text-[13px] text-[#555] group-hover:text-[#999] transition-colors leading-snug">
              {feature}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* ── Bottom stat strip ──
    <div className="border-t border-[#141414] py-6 grid grid-cols-2 md:grid-cols-4 gap-0">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-col px-6 py-2 ${
            i < stats.length - 1 ? "border-r border-[#141414]" : ""
          }`}
        >
          <span className="text-[10px] tracking-widest text-[#333] uppercase font-semibold mb-1">
            {stat.label}
          </span>
          <span className="text-[22px] font-extrabold text-white">
            {stat.value}
            <span className="text-orange-500 text-base ml-0.5">+</span>
          </span>
        </div>
      ))}
    </div> */}
  </div>
</section>

      {/* ── Stats ── */}
      <section
        ref={statsRef}
        className="bg-white border-t border-[#f0f0f0] py-20"
      >
        <div className="container mx-auto px-6 md:px-12 max-w-screen-xl">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-widest text-orange-500 uppercase mb-2">
              By the numbers
            </p>
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-[#111]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Growing steadily, impacting globally
            </motion.h2>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative bg-white border border-[#f0f0f0] hover:border-orange-200 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Orange left accent */}
                <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <p className="text-[11px] font-semibold tracking-widest text-orange-500 uppercase mb-3">
                  {stat.label}
                </p>
                <h3 className="text-4xl md:text-5xl font-extrabold text-[#111] flex items-baseline gap-0.5">
                  <Counter target={stat.value} isVisible={isInView} />
                  <span className="text-orange-500 text-3xl">+</span>
                </h3>
              </motion.div>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            className="mt-12 text-center text-[14px] text-[#999] max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            RMGC is building a trusted platform where freelancers and
            organizations thrive together — one successful project at a time.
          </motion.p>
        </div>
      </section>

      {/* ── Slide ── */}
      <Slide />
    </div>
  );
};

export default HomePage;
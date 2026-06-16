"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import RegisterClient from "../components/register/RegisterClient";
import RegisterFreelancer from "../components/register/RegisterFreelancer";
import RegisterOrganization from "../components/register/RegisterOrganization";
import RegisterRemoteWorker from "../components/register/RegisterRemoteWorker";
import RegisterAdmin from "../components/register/RegisterAdmin";

type Role = "client" | "freelancer" | "organization" | "remoteWorker" | "admin";

const roleConfig: Record<
  Role,
  {
    label: string;
    shortLabel: string;
    eyebrow: string;
    headline: string;
    sub: string;
    perks: { title: string; desc: string }[];
    stat: { value: string; label: string };
    testimonial: { quote: string; name: string; role: string };
  }
> = {
  client: {
    label: "Client",
    shortLabel: "Client",
    eyebrow: "Hire top talent",
    headline: "Get your project done\nby the best.",
    sub: "Access a curated pool of verified Nigerian and global professionals ready to work.",
    perks: [
      { title: "Expert Providers", desc: "Vetted specialists across 50+ service categories." },
      { title: "Secure Payments", desc: "Escrow-protected transactions, released on delivery." },
      { title: "Dispute Support", desc: "Dedicated resolution team available 24/7." },
    ],
    stat: { value: "12,400+", label: "Active service providers" },
    testimonial: {
      quote: "Found the perfect designer within 24 hours. The quality was far beyond what I expected.",
      name: "Adaeze O.",
      role: "Business Owner, Lagos",
    },
  },
  freelancer: {
    label: "Freelancer",
    shortLabel: "Freelancer",
    eyebrow: "Sell your skills",
    headline: "Turn your skills\ninto steady income.",
    sub: "List your services, set your price, and start getting paid by clients across Nigeria and beyond.",
    perks: [
      { title: "Global Exposure", desc: "Your profile reaches buyers in 30+ countries." },
      { title: "Fast Payouts", desc: "Receive earnings directly to your Nigerian bank." },
      { title: "Service Tools", desc: "Portfolio builder, reviews, and analytics included." },
    ],
    stat: { value: "₦2.8B+", label: "Paid out to freelancers" },
    testimonial: {
      quote: "I quit my 9-5 six months after joining. My gig income is now triple my old salary.",
      name: "Emeka T.",
      role: "Full-stack Developer, Abuja",
    },
  },
  organization: {
    label: "Organization",
    shortLabel: "Org",
    eyebrow: "Scale your workforce",
    headline: "Find talent\nat any scale.",
    sub: "Post jobs, manage contracts, and build your team with Africa's growing remote workforce.",
    perks: [
      { title: "Bulk Hiring", desc: "Post unlimited jobs and manage multiple contracts." },
      { title: "Verified Talent", desc: "Background-checked candidates for critical roles." },
      { title: "Brand Presence", desc: "Company profile page with job listings and reviews." },
    ],
    stat: { value: "3,200+", label: "Organizations onboarded" },
    testimonial: {
      quote: "We staffed an entire support team of 20 in under two weeks. Seamless experience.",
      name: "Ngozi A.",
      role: "HR Director, FinTech Co.",
    },
  },
  remoteWorker: {
    label: "Remote Worker",
    shortLabel: "Remote",
    eyebrow: "Work from anywhere",
    headline: "Your next remote\nrole is waiting.",
    sub: "Browse verified remote positions tiered to your experience level and start applying today.",
    perks: [
      { title: "All Job Listings", desc: "Full-time, part-time, and contract remote roles." },
      { title: "Tier Access", desc: "Unlock higher-paying roles as your profile grows." },
      { title: "Career Tools", desc: "CV builder, skill assessments, and interview prep." },
    ],
    stat: { value: "8,900+", label: "Remote roles posted this year" },
    testimonial: {
      quote: "Got a full-time remote role with a UK company within 3 weeks of signing up.",
      name: "Bello M.",
      role: "Remote Operations Lead",
    },
  },
  admin: {
    label: "Administrator",
    shortLabel: "Admin",
    eyebrow: "Platform management",
    headline: "Manage the platform\nwith full control.",
    sub: "Access comprehensive dashboards, user management, and analytics to keep RMGC running smoothly.",
    perks: [
      { title: "User Management", desc: "Approve, suspend, and manage all account types." },
      { title: "Platform Analytics", desc: "Real-time data on revenue, users, and activity." },
      { title: "Content Control", desc: "Moderate listings, reviews, and platform content." },
    ],
    stat: { value: "99.9%", label: "Platform uptime" },
    testimonial: {
      quote: "The admin panel gives us full visibility. We can resolve any issue in minutes.",
      name: "Internal Team",
      role: "RMGC Operations",
    },
  },
};

const roles = Object.keys(roleConfig) as Role[];

// Icon map for role nav
const RoleIcon = ({ r }: { r: Role }) => {
  const icons: Record<Role, React.ReactNode> = {
    client: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    freelancer: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13l4-4 2 2 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    organization: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="7" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
      </svg>
    ),
    remoteWorker: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    admin: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return <>{icons[r]}</>;
};

const Register: React.FC = () => {
  const [role, setRole] = useState<Role>("client");
  const config = roleConfig[role];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* ══════════════════════════════════════
          LEFT PANEL — dark sidebar
      ══════════════════════════════════════ */}
      <div className="relative lg:w-[44%] w-full flex flex-col overflow-hidden bg-[#0A0A0A] min-h-[420px] lg:min-h-screen">

        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Video bg */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
        >
          <source src="/reg.mp4" type="video/mp4" />
        </video>

        {/* Glow blobs */}
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-600/8 blur-3xl pointer-events-none" />

        {/* Orange left accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-8 md:px-12 py-10 lg:py-12 gap-8">

          {/* ── Logo ── */}
          <div className="flex items-center gap-3">
            <Image
              src="/logoo.webp"
              alt="RMGC"
              width={40}
              height={40}
              className="rounded-lg object-contain"
            />
            <div>
              <p className="text-white text-[13px] font-black tracking-tight leading-none">RMGC</p>
              <p className="text-[#444] text-[9.5px] font-medium tracking-[0.15em] uppercase leading-none mt-0.5">
                Renewed Minds Global Consult
              </p>
            </div>
          </div>

          {/* ── Role nav ── */}
          <div className="flex flex-col gap-1">
            <p className="text-[9.5px] font-bold tracking-[0.2em] text-[#444] uppercase mb-2">
              I want to join as
            </p>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                  role === r
                    ? "bg-orange-500/10 border-orange-500/40 text-white"
                    : "bg-transparent border-white/5 text-white/35 hover:bg-white/5 hover:border-white/15 hover:text-white/60"
                }`}
              >
                {/* Active indicator bar */}
                <div className={`w-0.5 h-5 rounded-full transition-all duration-200 shrink-0 ${role === r ? "bg-orange-500" : "bg-transparent"}`} />
                <span className={`transition-colors duration-200 ${role === r ? "text-orange-500" : "text-white/25 group-hover:text-white/50"}`}>
                  <RoleIcon r={r} />
                </span>
                <span className={`text-[13px] font-semibold tracking-tight transition-colors duration-200 ${role === r ? "text-white" : ""}`}>
                  {roleConfig[r].label}
                </span>
                {role === r && (
                  <span className="ml-auto text-[9px] font-bold tracking-widest text-orange-500 uppercase">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Animated content block ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              {/* Eyebrow + headline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-4 bg-orange-500" />
                  <p className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase">
                    {config.eyebrow}
                  </p>
                </div>
                <h2 className="text-[30px] md:text-[36px] font-black text-white leading-[1.05] tracking-tight whitespace-pre-line">
                  {config.headline}
                </h2>
                <p className="text-[13px] text-white/40 mt-3 leading-relaxed max-w-sm">
                  {config.sub}
                </p>
              </div>

              {/* Perks */}
              <div className="flex flex-col gap-3">
                {config.perks.map((perk, i) => (
                  <motion.div
                    key={perk.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.25 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-bold text-white/80 leading-none mb-0.5">{perk.title}</p>
                      <p className="text-[11.5px] text-white/35 leading-snug">{perk.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stat */}
              <div className="flex items-center gap-4 py-4 border-y border-white/[0.07]">
                <div>
                  <p className="text-[26px] font-black text-white tracking-tight leading-none">
                    {config.stat.value}
                  </p>
                  <p className="text-[11px] text-white/35 mt-1">{config.stat.label}</p>
                </div>
                <div className="h-10 w-px bg-white/10 mx-2" />
                <p className="text-[11px] text-white/25 leading-relaxed italic max-w-[200px]">
                  "{config.testimonial.quote}"
                </p>
              </div>

              {/* Testimonial attribution */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-orange-400">
                    {config.testimonial.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-[11.5px] font-bold text-white/60 leading-none">{config.testimonial.name}</p>
                  <p className="text-[10.5px] text-white/25 mt-0.5">{config.testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Sign in ── */}
          <p className="mt-auto text-[11.5px] text-white/20">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 font-bold hover:text-orange-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-12 md:px-12 lg:px-16 bg-white overflow-auto">

        {/* Progress bar */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10.5px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              {config.eyebrow}
            </p>
            <p className="text-[10.5px] font-medium text-[#ccc]">
              {roles.indexOf(role) + 1} of {roles.length}
            </p>
          </div>
          <div className="flex gap-1.5">
            {roles.map((r) => (
              <div
                key={r}
                onClick={() => setRole(r)}
                className={`h-[3px] rounded-full flex-1 cursor-pointer transition-all duration-300 ${
                  r === role ? "bg-orange-500" : "bg-[#f0f0f0] hover:bg-[#e0e0e0]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <div className="mb-7">
              <h1 className="text-[24px] md:text-[28px] font-black text-[#0A0A0A] leading-tight tracking-tight">
                Create your account
              </h1>
              <p className="text-[13px] text-[#aaa] mt-1.5">
                Joining as a{" "}
                <span className="text-orange-500 font-semibold">{config.label}</span>
                {" "}— not you?{" "}
                <button
                  onClick={() => {
                    const next = roles[(roles.indexOf(role) + 1) % roles.length];
                    setRole(next);
                  }}
                  className="text-orange-500 font-semibold hover:text-orange-600 transition underline underline-offset-2"
                >
                  Switch role
                </button>
              </p>
            </div>

            {role === "client" && <RegisterClient />}
            {role === "freelancer" && <RegisterFreelancer />}
            {role === "organization" && <RegisterOrganization />}
            {role === "remoteWorker" && <RegisterRemoteWorker />}
            {role === "admin" && <RegisterAdmin />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
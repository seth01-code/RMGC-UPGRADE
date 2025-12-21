"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Import role forms
import RegisterClient from "../components/register/RegisterClient";
import RegisterFreelancer from "../components/register/RegisterFreelancer";
import RegisterOrganization from "../components/register/RegisterOrganization";
import RegisterRemoteWorker from "../components/register/RegisterRemoteWorker";
import RegisterAdmin from "../components/register/RegisterAdmin";

type Role = "client" | "freelancer" | "organization" | "remoteWorker" | "admin";

const Register: React.FC = () => {
  const [role, setRole] = useState<Role>("client");
  const [fadeText, setFadeText] = useState<string[]>([]);

  const roleText: Record<Role, string> = {
    client: "Join Renewed Minds Global Consult today as a client to access",
    freelancer:
      "Join Renewed Minds Global Consult today as a service provider to upload your services and gain access to",
    organization:
      "Register your organization today to post jobs, find talent, and access",
    remoteWorker:
      "Sign up as a Remote Worker to explore job opportunities based on your selected tier and gain access to",
    admin:
      "Join Renewed Minds Global Consult today as an admin to oversee operations and manage users with access to",
  };

  const detailsText: Record<Role, string[]> = {
    client: [
      "Expert Service Providers",
      "Secure Transactions",
      "Personalized Services",
    ],
    freelancer: [
      "Potential Clients",
      "Powerful Service Tools",
      "Global Marketplace",
    ],
    organization: ["Top Freelancers", "Recruitment Tools", "Brand Visibility"],
    remoteWorker: [
      "All Job Listings",
      "Tier-Based Access",
      "Career Opportunities",
    ],
    admin: ["User Management", "Platform Analytics", "Seamless Control"],
  };

  useEffect(() => {
    setFadeText(detailsText[role]);
  }, [role]);

  const fadeInVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.5 },
    }),
  };

  const roleOptions: { key: Role; label: string }[] = [
    { key: "client", label: "Register as Client" },
    { key: "freelancer", label: "Register as Freelancer" },
    { key: "organization", label: "Register as Organization" },
    { key: "remoteWorker", label: "Register as Remote Worker" },
    { key: "admin", label: "Register as Admin" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="relative lg:w-1/3 w-full flex flex-col justify-between">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/reg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 py-10 lg:py-20">
          <Image
            src="/logoo.webp"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full object-contain mb-6 shadow-lg"
          />

          <p className="text-white text-base md:text-lg lg:text-2xl font-bold mb-4 md:mb-6 leading-relaxed">
            {roleText[role]}
          </p>

          <motion.div
            key={role}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2 items-center text-orange-400 text-sm md:text-lg font-semibold uppercase"
          >
            {fadeText.map((text, index) => (
              <motion.span
                key={index}
                variants={fadeInVariant}
                custom={index}
                className="inline-block drop-shadow-md"
              >
                {text}
              </motion.span>
            ))}
          </motion.div>

          <div className="flex flex-wrap justify-center lg:flex-col gap-3 mt-6 md:mt-8">
            {roleOptions.map(({ key, label }) => (
              <button
                key={key}
                className={`px-4 md:px-5 py-2 text-xs md:text-sm font-semibold rounded-lg border transition-all duration-300 ${
                  role === key
                    ? "bg-orange-500 text-white shadow-lg scale-105"
                    : "bg-transparent text-white border-white/40 hover:bg-orange-500/80"
                }`}
                onClick={() => setRole(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-6">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-400 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Form section */}
      <motion.div
        key={role}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex justify-center items-start lg:items-center p-6 lg:p-10 z-10 overflow-auto"
      >
        <div className="relative w-full max-w-2xl rounded-2xl p-6 md:p-8 bg-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 via-transparent to-orange-400/10 blur-xl opacity-40 pointer-events-none"></div>

          <div className="relative z-10 w-full">
            {role === "client" && <RegisterClient />}
            {role === "freelancer" && <RegisterFreelancer />}
            {role === "organization" && <RegisterOrganization />}
            {role === "remoteWorker" && <RegisterRemoteWorker />}
            {role === "admin" && <RegisterAdmin />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

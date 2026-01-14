"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaHandshake,
  FaShieldAlt,
  FaUserTie,
  FaComments,
  FaQuestionCircle,
} from "react-icons/fa";

import aboutBg from "../../assets/images/aboutUs.jpg";
import founderImg from "../../assets/images/mi.jpg";
import ctoImg from "../../assets/images/12.jpg";
import ccoImg from "../../assets/images/Ukachi.jpg";

interface Particle {
  size: number;
  top: number;
  left: number;
  rotation: number;
  depth: number;
  duration: number;
  delay: number;
}

const AboutUs: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // ✅ Generate random values only on the client
  useEffect(() => {
    const arr = Array.from({ length: 32 }).map(() => ({
      size: 10 + Math.random() * 24,
      top: Math.random() * 100,
      left: Math.random() * 100,
      rotation: Math.random() * 20 - 10,
      depth: Math.random() * 0.5 + 0.5,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticles(arr);
  }, []);

  const leaders = [
    { name: "Miracle Ikhielea", role: "Founder & CEO", img: founderImg },
    { name: "Seth Ikhielea", role: "CTO & Personal Assistant", img: ctoImg },
    { name: "David Ukachi", role: "Chief Commercial Officer", img: ccoImg },
  ];

  const values = [
    {
      name: "Transparency",
      icon: <FaHandshake />,
      color: "from-orange-400 to-pink-500",
    },
    {
      name: "Integrity",
      icon: <FaShieldAlt />,
      color: "from-green-400 to-emerald-600",
    },
    {
      name: "Professionalism",
      icon: <FaUserTie />,
      color: "from-blue-400 to-indigo-600",
    },
    {
      name: "Communication",
      icon: <FaComments />,
      color: "from-red-400 to-pink-500",
    },
  ];

  const faqs = [
    {
      q: "What does RMGC do?",
      a: "Renewed Minds Global Consult connects talented freelancers, remote workers, and organizations—offering advertising, consulting, and digital solutions across industries.",
    },
    {
      q: "Who can register on RMGC?",
      a: "Freelancers, remote workers, and verified organizations looking to hire professionals or showcase their services can all register on RMGC.",
    },
    {
      q: "Is RMGC available outside Nigeria?",
      a: "Yes. RMGC serves a global audience, helping both local and international clients connect with verified professionals worldwide.",
    },
    {
      q: "How do I join as a service provider?",
      a: "To join, freelancers pay a **one-time registration fee of ₦5,000** to complete their profile and start applying for jobs. Remote workers can register for free, but can upgrade to the **VIP tier** for premium access to higher-paying jobs. Verified organizations pay a registration fee to post jobs and access the talent pool.",
    },
    {
      q: "Are there recurring fees or subscription plans?",
      a: "Freelancers do not have recurring fees beyond the one-time registration. Remote workers can choose a **VIP subscription** for access to high-paying jobs, billed monthly or yearly depending on the plan. Organizations pay a registration fee to post jobs and access premium services.",
    },
    {
      q: "What payment methods are supported?",
      a: "RMGC supports Paystack and Flutterwave for all transactions, allowing payments in Naira, USD, or other supported currencies.",
    },
    {
      q: "Do I need to verify my account?",
      a: "Yes. Freelancers and organizations must verify their account using valid identification and contact details to ensure trust and security on the platform.",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden">
      {/* === HERO SECTION === */}
      <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src={aboutBg}
          alt="About Us Background"
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-orange-800/40"></div>

        {/* ✅ Floating boxes (now client-only) */}
        {particles.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[320px] h-[220px] overflow-visible">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white/80 rounded-md shadow-lg"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    top: `${p.top}%`,
                    left: `${p.left}%`,
                    rotate: `${p.rotation}deg`,
                    opacity: p.depth,
                    filter: "blur(0.8px)",
                    zIndex: 1,
                  }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [p.depth * 0.7, p.depth, p.depth * 0.7],
                    y: [0, -10 * p.depth, 0],
                    x: [0, 3 * p.depth, 0],
                    rotate: [p.rotation, p.rotation + 2, p.rotation],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* === CENTERED TEXT === */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10 text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text drop-shadow-lg"
        >
          About Us
        </motion.h1>

        {/* === SUBTEXT === */}
        <div className="absolute bottom-10 w-11/12 md:w-3/4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 text-center text-white">
          <p className="text-lg md:text-xl italic">
            “Meeting Service Needs and Unlocking Possibilities.”
          </p>
        </div>
      </div>

      {/* === WHO WE ARE === */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
            Who We Are
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            <strong className="text-orange-700">
              Renewed Minds Global Consult (RMGC)
            </strong>{" "}
            is a cutting-edge Advertising & Consulting Agency founded on{" "}
            <strong>9th November 2021</strong> by{" "}
            <strong>Ms Miracle Ikhielea</strong>, alongside{" "}
            <strong>CTO & Personal Assistant, Master Seth Ikhielea</strong>.
          </p>
          <p className="text-lg leading-relaxed mt-5 text-gray-700">
            Our mission is to <strong>bridge the gap</strong> between skilled
            professionals and clients worldwide — empowering both sides through
            technology, trust, and transparent partnerships.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex justify-center items-center"
        >
          <div className="bg-gradient-to-tr from-orange-100 to-pink-50 rounded-3xl shadow-2xl p-10 border border-orange-100/50">
            <p className="text-2xl md:text-3xl font-semibold text-center text-orange-700 italic">
              “Transforming Talent into Opportunity.”
            </p>
          </div>
        </motion.div>
      </div>

      {/* === WHY CHOOSE US === */}
      <div className="bg-gradient-to-br from-orange-600 to-pink-600 text-white py-20 px-6">
        <h2 className="text-5xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto text-lg">
          {[
            "We are built around YOU — your goals, your growth, your success.",
            "Service providers enjoy exposure, fair pricing, and true global reach.",
            "Clients experience verified professionals, transparency, and quality delivery.",
            "We combine technology, ethics, and excellence for a seamless partnership.",
          ].map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition"
            >
              {text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* === LEADERSHIP === */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          Leadership
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {leaders.map((leader, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-xl p-8 text-center border border-gray-200 hover:-translate-y-2 transition-transform"
            >
              <div className="relative w-44 h-44 mx-auto mb-6">
                <Image
                  src={leader.img}
                  alt={leader.name}
                  fill
                  className="rounded-full object-cover border-4 border-orange-400 shadow-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {leader.name}
              </h3>
              <p className="text-sm text-gray-500">{leader.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === CORE VALUES === */}
      <div className="py-20 bg-gradient-to-tr from-gray-900 to-gray-800 text-white">
        <h2 className="text-5xl font-bold text-center mb-14 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          Our Core Values
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className={`p-8 rounded-2xl text-center bg-gradient-to-br ${value.color} shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-2`}
            >
              <div className="text-5xl mb-3">{value.icon}</div>
              <h3 className="text-xl font-semibold">{value.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === GLOBAL REACH === */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-indigo-700 mb-8">
          Our Global Reach
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">
          Though proudly based in <strong>Nigeria</strong>, RMGC transcends
          borders — leveraging innovation to connect talent and clients across
          continents.
        </p>
      </div>

      {/* === COMMUNITY === */}
      <div className="flex flex-wrap justify-center gap-6 pb-20">
        {[
          {
            href: "https://t.me/rmgconsultants",
            color: "from-blue-500 to-cyan-500",
            text: "Join Our Official Telegram",
          },
          {
            href: "https://chat.whatsapp.com/DOc8WntKqOjDKeNhwcOowb",
            color: "from-green-500 to-emerald-600",
            text: "Join WhatsApp for Service Providers",
          },
          {
            href: "https://chat.whatsapp.com/FXsUlpRQ7TTB2BXPRRACBS",
            color: "from-green-500 to-lime-600",
            text: "Join WhatsApp for Clients",
          },
        ].map((btn, i) => (
          <a
            key={i}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-gradient-to-r ${btn.color} text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all`}
          >
            {btn.text}
          </a>
        ))}
      </div>

      {/* === FAQ SECTION === */}
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 py-20 px-6 border-t border-orange-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <FaQuestionCircle className="text-5xl text-orange-500" />
          </div>
          <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8 text-left">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-orange-100 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-orange-600 mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

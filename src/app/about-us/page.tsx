"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHandshake,
  FaShieldAlt,
  FaUserTie,
  FaComments,
  FaChevronDown,
  FaGlobe,
  FaTelegram,
  FaWhatsapp,
  FaArrowRight,
} from "react-icons/fa";

import aboutBg from "../../assets/images/aboutUs.jpg";
import founderImg from "../../assets/images/mi.jpg";
import ctoImg from "../../assets/images/seth.jpeg";
import ccoImg from "../../assets/images/Ukachi.jpg";

/* ── palette ── */
const OR = "#FF6B1A";
const ORL = "#FF8C47";
const ORANGE_GRADIENT =
  "linear-gradient(135deg, #FFFFFF 0%, #FFF1E6 45%, #FFE0C7 100%)";
const INK = "#111111"; // touch-of-black for headings/icons on light bg
const BODY = "#4B5563";
const MUTED = "#6B7280";
const HAIRLINE = "rgba(17,17,17,0.08)";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: OR,
        marginBottom: "12px",
      }}
    >
      {children}
    </p>
  );
}

function HeadingSlash({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <h2
      style={{
        fontSize: "clamp(32px, 5vw, 52px)",
        fontWeight: 800,
        color: dark ? INK : "#FFFFFF",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        position: "relative",
        display: "inline-block",
        paddingBottom: "14px",
        marginBottom: "28px",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "48px",
          height: "3px",
          background: `linear-gradient(90deg, ${OR}, ${ORL})`,
          borderRadius: "2px",
        }}
      />
    </h2>
  );
}

/* ── FAQ accordion item ── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      style={{
        borderBottom: `1px solid ${HAIRLINE}`,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: open ? OR : INK,
            transition: "color 0.2s",
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <FaChevronDown
          size={14}
          color={open ? OR : "#9CA3AF"}
          style={{
            flexShrink: 0,
            transition: "transform 0.3s, color 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: BODY,
                paddingBottom: "20px",
                margin: 0,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════ */

const AboutUs: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const leaders = [
    { name: "Miracle Ikhielea", role: "Founder & CEO", img: founderImg },
    { name: "Seth Ikhielea", role: "CTO & Personal Assistant", img: ctoImg },
    { name: "David Ukachi", role: "Chief Communication Officer", img: ccoImg },
  ];

  const values = [
    {
      name: "Transparency",
      icon: <FaHandshake size={28} />,
      desc: "Open processes, honest communication, no hidden agendas.",
    },
    {
      name: "Integrity",
      icon: <FaShieldAlt size={28} />,
      desc: "We do what we say and say what we mean — every time.",
    },
    {
      name: "Professionalism",
      icon: <FaUserTie size={28} />,
      desc: "High standards in delivery, conduct, and client relations.",
    },
    {
      name: "Communication",
      icon: <FaComments size={28} />,
      desc: "Clear, timely, and respectful dialogue at every touchpoint.",
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
      a: "Freelancers pay a one-time registration fee of ₦5,000 to complete their profile and start uploading gigs. Remote workers can register for free, and upgrade to VIP for premium access. Organizations pay a registration fee to post jobs.",
    },
    {
      q: "Are there recurring fees or subscription plans?",
      a: "Freelancers have no recurring fees beyond the one-time registration. Remote workers can choose a VIP subscription for high-paying jobs, billed yearly. Organizations pay a yearly subscription to post jobs and receive applications.",
    },
    {
      q: "What payment methods are supported?",
      a: "RMGC supports Paystack and Flutterwave (Card Only) for all transactions, allowing payments in Naira, USD, or other supported currencies.",
    },
    {
      q: "Do I need to verify my account?",
      a: "Yes. All users must verify their account using valid identification and contact details to ensure trust and security on the platform.",
    },
  ];

  const communityLinks = [
    {
      href: "https://t.me/rmgconsultants",
      icon: <FaTelegram size={18} />,
      label: "Telegram Community",
      sub: "Official channel",
    },
    {
      href: "https://chat.whatsapp.com/DOc8WntKqOjDKeNhwcOowb",
      icon: <FaWhatsapp size={18} />,
      label: "WhatsApp — Providers",
      sub: "For service providers",
    },
    {
      href: "https://chat.whatsapp.com/FXsUlpRQ7TTB2BXPRRACBS",
      icon: <FaWhatsapp size={18} />,
      label: "WhatsApp — Clients",
      sub: "For clients & businesses",
    },
  ];

  return (
    <section
      style={{
        background: "#FFFFFF",
        color: INK,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ══ HERO — photo with white/orange gradient overlay (touch of black only behind text) ══ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "560px",
          maxHeight: "800px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image with parallax */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${scrollY * 0.3}px)`,
            willChange: "transform",
          }}
        >
          <Image
            src={aboutBg}
            alt="About Us"
            fill
            style={{ objectFit: "cover", opacity: 0.35 }}
            priority
          />
        </div>

        {/* Gradient overlay: light orange/white fading to a touch of black near the text for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,241,230,0.55) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.78) 100%)",
          }}
        />

        {/* RMGC watermark */}
        <div
          style={{
            position: "absolute",
            fontSize: "clamp(120px, 25vw, 280px)",
            fontWeight: 900,
            color: "rgba(255,107,26,0.08)",
            letterSpacing: "-0.04em",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 1,
          }}
        >
          RMGC
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: ORL,
              marginBottom: "20px",
            }}
          >
            Renewed Minds Global Consult
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontSize: "clamp(52px, 11vw, 110px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              margin: "0 0 28px",
              color: "#FFFFFF",
            }}
          >
            About
            <br />
            <span style={{ color: OR }}>Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            style={{
              fontSize: "18px",
              color: "#E5E7EB",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &quot;Meeting Service Needs and Unlocking Possibilities.&quot;
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{ marginTop: "48px" }}
          >
            <div
              style={{
                width: "1px",
                height: "60px",
                background: `linear-gradient(to bottom, ${OR}, transparent)`,
                margin: "0 auto",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* ══ WHO WE ARE — white ══ */}
      <div
        style={{
          background: "#FFFFFF",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="who-grid"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <SectionLabel>Our story</SectionLabel>
            <HeadingSlash>Who We Are</HeadingSlash>
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.8,
                color: BODY,
                marginBottom: "20px",
              }}
            >
              <strong style={{ color: INK }}>
                Renewed Minds Global Consult (RMGC)
              </strong>{" "}
              is a cutting-edge Advertising & Consulting Agency, founded on{" "}
              <strong style={{ color: INK }}>9th November 2021</strong> by{" "}
              <strong style={{ color: OR }}>Ms Miracle Ikhielea</strong>,
              alongside{" "}
              <strong style={{ color: INK }}>CTO Master Seth Ikhielea</strong>.
            </p>
            <p style={{ fontSize: "17px", lineHeight: 1.8, color: BODY }}>
              Our mission is to{" "}
              <strong style={{ color: INK }}>bridge the gap</strong> between
              skilled professionals and clients worldwide — empowering both
              sides through technology, trust, and transparent partnerships.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div
              style={{
                position: "relative",
                padding: "48px 40px",
                borderRadius: "20px",
                background: ORANGE_GRADIENT,
                border: `1px solid ${HAIRLINE}`,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(255,107,26,0.12)",
              }}
            >
              {/* decorative corner */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "120px",
                  height: "120px",
                  background: `radial-gradient(circle at top right, ${OR}22, transparent 70%)`,
                }}
              />
              <p
                style={{
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 700,
                  color: INK,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                &quot;Transforming <span style={{ color: OR }}>Talent</span> into{" "}
                <span style={{ color: OR }}>Opportunity</span>.&quot;
              </p>
              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "24px",
                  borderTop: `1px solid ${HAIRLINE}`,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                {[
                  ["Est.", "2021"],
                  ["Reach", "Global"],
                  ["Users", "Verified"],
                  ["Support", "24/7"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: MUTED,
                      }}
                    >
                      {l}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: 700,
                        color: OR,
                      }}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ WHY CHOOSE US — white→orange gradient ══ */}
      <div
        style={{
          background: ORANGE_GRADIENT,
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel>Our advantage</SectionLabel>
            <HeadingSlash>Why Choose Us</HeadingSlash>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2px",
            }}
          >
            {[
              {
                num: "01",
                text: "Built around YOU — your goals, your growth, your success.",
              },
              {
                num: "02",
                text: "Service providers enjoy exposure, fair pricing, and true global reach.",
              },
              {
                num: "03",
                text: "Clients experience verified professionals, transparency, and quality delivery.",
              },
              {
                num: "04",
                text: "We combine technology, ethics, and excellence for a seamless partnership.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  padding: "36px 32px",
                  background: "#FFFFFF",
                  borderTop: `3px solid ${i === 0 ? OR : "transparent"}`,
                  transition: "border-color 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderTopColor =
                    OR)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderTopColor =
                    "transparent")
                }
              >
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#E8E2DC",
                    lineHeight: 1,
                  }}
                >
                  {item.num}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    lineHeight: 1.7,
                    color: BODY,
                  }}
                >
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ LEADERSHIP — white ══ */}
      <div
        style={{
          background: "#FFFFFF",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>The people behind RMGC</SectionLabel>
          <HeadingSlash>Leadership</HeadingSlash>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {leaders.map((leader, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: "20px",
                overflow: "hidden",
                transition:
                  "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 2px 12px rgba(17,17,17,0.04)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "#FF6B1A60";
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 28px rgba(255,107,26,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = HAIRLINE;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 2px 12px rgba(17,17,17,0.04)";
              }}
            >
              {/* Image area — touch of black via dark base + gradient scrim */}
              <div
                style={{
                  position: "relative",
                  height: "280px",
                  overflow: "hidden",
                  background: "#0F0F0F",
                }}
              >
                <Image
                  src={leader.img}
                  alt={leader.name}
                  fill
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: "24px 28px 28px" }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: OR,
                  }}
                >
                  {leader.role}
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 700,
                    color: INK,
                  }}
                >
                  {leader.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ CORE VALUES — white→orange gradient ══ */}
      <div
        style={{
          background: ORANGE_GRADIENT,
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "100px 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <SectionLabel>What we stand for</SectionLabel>
            <HeadingSlash>Core Values</HeadingSlash>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  padding: "36px 28px",
                  background: "#FFFFFF",
                  borderRadius: "16px",
                  border: `1px solid ${HAIRLINE}`,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxShadow: "0 2px 12px rgba(17,17,17,0.04)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "#FF6B1A50";
                  el.style.boxShadow = "0 8px 24px rgba(255,107,26,0.14)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = HAIRLINE;
                  el.style.boxShadow = "0 2px 12px rgba(17,17,17,0.04)";
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "#FF6B1A14",
                    border: "1px solid #FF6B1A28",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: OR,
                    marginBottom: "20px",
                  }}
                >
                  {val.icon}
                </div>
                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: INK,
                  }}
                >
                  {val.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: MUTED,
                    lineHeight: 1.6,
                  }}
                >
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ GLOBAL REACH — white ══ */}
      <div
        style={{
          background: "#FFFFFF",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#FF6B1A14",
              border: "1px solid #FF6B1A28",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: OR,
            }}
          >
            <FaGlobe size={24} />
          </div>
          <SectionLabel>Where we operate</SectionLabel>
          <HeadingSlash>Global Reach</HeadingSlash>
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.8,
              color: BODY,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Though proudly based in{" "}
            <strong style={{ color: INK }}>Nigeria</strong>, RMGC transcends
            borders — leveraging innovation to connect talent and clients across
            continents.
          </p>
        </motion.div>
      </div>

      {/* ══ COMMUNITY — white→orange gradient ══ */}
      <div
        style={{
          background: ORANGE_GRADIENT,
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <SectionLabel>Stay connected</SectionLabel>
            <HeadingSlash>Join the Community</HeadingSlash>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {communityLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px 24px",
                  background: "#FFFFFF",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: "14px",
                  textDecoration: "none",
                  transition:
                    "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                  color: "inherit",
                  boxShadow: "0 2px 12px rgba(17,17,17,0.04)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "#FF6B1A55";
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = "0 10px 24px rgba(255,107,26,0.14)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = HAIRLINE;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "0 2px 12px rgba(17,17,17,0.04)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#FF6B1A14",
                    border: "1px solid #FF6B1A28",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: OR,
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: INK,
                    }}
                  >
                    {link.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: MUTED }}>
                    {link.sub}
                  </p>
                </div>
                <FaArrowRight size={12} color={MUTED} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FAQ — white ══ */}
      <div
        style={{
          background: "#FFFFFF",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <SectionLabel>Got questions?</SectionLabel>
          <HeadingSlash>Frequently Asked</HeadingSlash>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>

      {/* ══ FOOTER CTA — touch of black panel, set within the light page ══ */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "100px 24px",
          overflow: "hidden",
          background: "#0E0E0E",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${OR}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: ORL,
              marginBottom: "16px",
            }}
          >
            Ready to get started?
          </p>
          <h2
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 32px",
              color: "#FFFFFF",
            }}
          >
            Join RMGC Today
          </h2>
          <a
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: `linear-gradient(135deg, ${OR}, #E85D0A)`,
              color: "#FFFFFF",
              padding: "16px 36px",
              borderRadius: "100px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 4px 24px ${OR}40`,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "scale(1.04)";
              el.style.boxShadow = `0 8px 32px ${OR}60`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = "scale(1)";
              el.style.boxShadow = `0 4px 24px ${OR}40`;
            }}
          >
            Get Started <FaArrowRight size={14} />
          </a>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .who-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
};

export default AboutUs;

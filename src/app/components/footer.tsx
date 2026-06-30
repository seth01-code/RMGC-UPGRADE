"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FcCurrencyExchange } from "react-icons/fc";
import { FaTiktok } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";

import { useExchangeRate } from "../hooks/useExchangeRate";
import newRequest from "../utils/newRequest";

import facebook from "../../assets/images/facebook.png";
import linkedin from "../../assets/images/linkedin.png";
import instagram from "../../assets/images/instagram.png";
import language from "../../assets/images/language.png";
import Accessibility from "../../assets/images/accessibility.png";

interface User {
  id: string;
  username: string;
  email: string;
  country?: string;
  createdAt: string;
}

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentUser: { country?: string } | null = isMounted
    ? JSON.parse(localStorage.getItem("currentUser") || "null")
    : null;

  const { countryCurrency } = useExchangeRate(currentUser?.country || "USD");

  const { data: userData } = useQuery<User>({
    queryKey: ["authenticatedUser"],
    queryFn: () => newRequest.get("/users/me").then((res) => res.data),
  });

  const date = moment(userData?.createdAt || new Date()).format("YYYY");

  const socials = [
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@rmgconsult?_t=ZM-8uMUlARof38&_r=1",
      icon: <FaTiktok className="text-[17px]" />,
    },
    {
      label: "Facebook",
      href: "#",
      icon: <Image src={facebook} alt="Facebook" width={17} height={17} />,
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: <Image src={linkedin} alt="LinkedIn" width={17} height={17} />,
    },
    {
      label: "Gmail",
      href: "mailto:support@renewedmindsglobalconsult.com",
      icon: <SiGmail className="text-[17px]" />,
    },
    {
      label: "Instagram",
      href: "#",
      icon: <Image src={instagram} alt="Instagram" width={17} height={17} />,
    },
  ];

  return (
    <footer className="relative bg-[#ffffff] overflow-hidden">
      {/* Top orange border accent — centered, partial width */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] max-w-120 h-px bg-linear-to-r from-transparent via-orange-500/60 to-transparent" />

      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-50 rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 py-14">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-5">
            <Image
              src="/logoo.webp"
              alt="RMGC Logo"
              width={72}
              height={72}
              className="rounded-xl"
            />
            <p className="text-[12.5px] text-[#444] leading-relaxed max-w-45">
              Connecting organizations, freelancers, and remote talent
              worldwide.
            </p>
            {/* Social row */}
            <div className="flex items-center gap-3 mt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-[#0e0e0e] border border-[#1e1e1e] flex items-center justify-center text-[#444] hover:text-orange-500 hover:border-orange-500/30 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-orange-500 uppercase mb-4">
              {t("footer.aboutUs")}
            </p>
            <p className="text-[12.5px] text-[#444] leading-relaxed">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Support */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-orange-500 uppercase mb-4">
              {t("footer.support")}
            </p>
            <ul className="space-y-2.5">
              {[
                { label: t("footer.privacyPolicy"), href: "/terms-privacy" },
                { label: t("footer.termsOfService"), href: "/terms-privacy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[12.5px] text-[#444] hover:text-[#ccc] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-[#2a2a2a] group-hover:bg-orange-500 group-hover:w-4 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-orange-500 uppercase mb-4">
              {t("footer.contact")}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-[#333] mt-0.5 text-[11px] uppercase tracking-wider shrink-0">
                  Email
                </span>
                <a
                  href="mailto:support@renewedmindsglobalconsult.com"
                  className="text-[12px] text-[#555] hover:text-orange-500 transition-colors break-all leading-snug"
                >
                  support@renewedmindsglobalconsult.com
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-[#333] mt-0.5 text-[11px] uppercase tracking-wider shrink-0">
                  Addr
                </span>
                <span className="text-[12px] text-[#555] leading-snug">
                  10, Orija Street, Lagos, Nigeria.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-[#141414] mb-8" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left — copyright */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-orange-500" />
              <span className="text-[12px] font-bold text-[#333] tracking-widest uppercase">
                RMGC
              </span>
            </div>
            <span className="w-px h-3.5 bg-[#1e1e1e]" />
            <span className="text-[11.5px] text-[#333]">
              © {date} Renewed Minds Global Consult
            </span>
          </div>

          {/* Right — locale controls */}
          <div className="flex items-center gap-1">
            {[
              {
                content: (
                  <>
                    <Image
                      src={language}
                      alt="Language"
                      width={14}
                      height={14}
                    />
                    <span>{t("footer.english")}</span>
                  </>
                ),
              },
              {
                content: (
                  <>
                    <FcCurrencyExchange className="text-[14px]" />
                    <span>{isMounted ? countryCurrency : "USD"}</span>
                  </>
                ),
              },
              {
                content: (
                  <Image
                    src={Accessibility}
                    alt="Accessibility"
                    width={14}
                    height={14}
                  />
                ),
              },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-[#444] hover:text-[#ccc] px-3 py-1.5 rounded-lg border border-transparent hover:border-[#1e1e1e] transition-all"
              >
                {item.content}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

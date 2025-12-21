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

import { useExchangeRate } from "../../hooks/useExchangeRate";
import newRequest from "../../utils/newRequest";

// Assets
import facebook from "../../../assets/images/facebook.png";
import linkedin from "../../../assets/images/linkedin.png";
import instagram from "../../../assets/images/instagram.png";
import language from "../../../assets/images/language.png";
import Accessibility from "../../../assets/images/accessibility.png";

// Types
interface User {
  id: string;
  username: string;
  email: string;
  country?: string;
  createdAt: string;
}

const WorkerFooter: React.FC = () => {
  const { t } = useTranslation();

  // Track client mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client-safe localStorage
  const currentUser: { country?: string } | null = isMounted
    ? JSON.parse(localStorage.getItem("currentUser") || "null")
    : null;

  // Currency hook
  const { countryCurrency } = useExchangeRate(currentUser?.country || "USD");

  // Fetch authenticated user
  const { data: userData } = useQuery<User>({
    queryKey: ["authenticatedUser"],
    queryFn: () => newRequest.get("/users/me").then((res) => res.data),
  });

  const date = moment(userData?.createdAt || new Date()).format("YYYY");

  return (
    <footer className="relative w-full mt-10 rounded-t-[10px] text-gray-100 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 rounded-t-[10px]"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10 rounded-t-[10px]"></div>

      {/* Content */}
      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 z-20 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo */}
          <div className="flex flex-col space-y-4">
            <Image
              src="/logoo.webp"
              alt="RMGC Logo"
              width={96}
              height={96}
              className="rounded-lg"
            />
          </div>

          {/* About */}
          <div>
            <h2 className="text-lg font-semibold">{t("footer.aboutUs")}</h2>
            <p className="text-sm font-light mt-4 leading-relaxed">
              {t("footer.aboutText")}
            </p>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-lg font-semibold">{t("footer.support")}</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/organization/terms-privacy"
                  className="text-sm font-light hover:text-gray-300 transition"
                >
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/organization/terms-privacy"
                  className="text-sm font-light hover:text-gray-300 transition"
                >
                  {t("footer.termsOfService")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold">{t("footer.contact")}</h2>
            <p className="text-sm font-light mt-4">
              {t("footer.email")}:{" "}
              <a
                href="mailto:support@renewedmindsglobalconsult.com"
                className="text-blue-500 underline"
              >
                support@renewedmindsglobalconsult.com
              </a>
            </p>
            <p className="text-sm font-light">
              {t("footer.address")}: 10, Orija Street, Lagos, Nigeria.
            </p>
          </div>
        </div>

        <hr className="border-gray-500 opacity-50 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
          {/* Left */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h2 className="text-lg font-semibold">RMGC</h2>
            <span className="text-sm">{`© Renewed Minds Global Consult, ${date}`}</span>
          </div>

          {/* Right */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Socials */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.tiktok.com/@rmgconsult?_t=ZM-8uMUlARof38&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
              >
                <FaTiktok className="text-2xl text-gray-400" />
              </a>
              <Image
                src={facebook}
                alt="Facebook"
                width={24}
                height={24}
                className="hover:scale-110 transition"
              />
              <Image
                src={linkedin}
                alt="LinkedIn"
                width={24}
                height={24}
                className="hover:scale-110 transition"
              />
              <a
                href="mailto:support@renewedmindsglobalconsult.com"
                className="hover:scale-110 transition"
              >
                <SiGmail className="text-2xl text-gray-400" />
              </a>
              <Image
                src={instagram}
                alt="Instagram"
                width={24}
                height={24}
                className="hover:scale-110 transition"
              />
            </div>

            {/* Language */}
            <div className="flex items-center gap-2">
              <Image src={language} alt="Language" width={24} height={24} />
              <span>{t("footer.english")}</span>
            </div>

            {/* Currency */}
            <div className="flex items-center gap-2">
              <FcCurrencyExchange className="text-2xl" />
              <span>{isMounted ? countryCurrency : "USD"}</span>
            </div>

            {/* Accessibility */}
            <Image
              src={Accessibility}
              alt="Accessibility"
              width={24}
              height={24}
              className="hover:scale-110 transition"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WorkerFooter;

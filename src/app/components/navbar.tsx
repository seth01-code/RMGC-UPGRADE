"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { TbMessages, TbLayoutDashboard, TbShoppingCart, TbBriefcase, TbVideo, TbUsers, TbLogout, TbShieldCheck, TbLayoutGrid, TbPlus } from "react-icons/tb";
import Image from "next/image";
import CategoriesBar from "./CategoriesBar";
import Announcements from "./Announcement";
import { Orbitron } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-orbitron",
});

interface User {
  username: string;
  img?: string;
  isSeller?: boolean;
  isAdmin?: boolean;
}

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isDark = isHome && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    setCurrentUser(storedUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setProfileOpen(false);
    window.location.href = "/login";
  };

  const roleLabel = currentUser?.isAdmin
    ? "Admin account"
    : currentUser?.isSeller
    ? "Freelancer account"
    : "Client account";

  const iconBtn = `w-9 h-9 rounded-[10px] border flex items-center justify-center text-[17px] transition-all duration-150 ${
    isDark
      ? "border-[#1e1e1e] text-[#444] hover:text-orange-500 hover:border-orange-500/40 hover:bg-orange-500/5"
      : "border-[#e5e5e5] text-[#bbb] hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-50"
  }`;

  return (
    <>
      <Announcements />
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isDark
            ? "bg-[#080808] border-b border-[#141414]"
            : "bg-white border-b border-[#f0f0f0]"
        }`}
      >
        <div className="mx-auto flex items-center justify-between px-6 md:px-10 max-w-350 h-15">

          {/* ── Logo ── */}
          <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
            <Link
              href="/"
              className={`${orbitron.variable} font-(family-name:--font-orbitron) text-[20px] tracking-widest select-none flex items-end gap-0`}
            >
              <span className="text-orange-500">RM</span>
              <span className={isDark ? "text-white" : "text-[#111]"}>GC</span>
              <motion.span
                className="text-orange-500 ml-0.5 text-[22px]"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                style={{ display: "inline-block", lineHeight: 1 }}
              >
                .
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">

            {currentUser?.isAdmin && (
              <Link href="/admin" className={iconBtn} title="Admin panel">
                <TbShieldCheck />
              </Link>
            )}

            {currentUser?.isSeller && (
              <Link href="/seller" className={iconBtn} title="Seller dashboard">
                <TbLayoutDashboard />
              </Link>
            )}

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar trigger */}
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className={`flex items-center gap-2.5 rounded-[11px] border px-2.5 py-1.5 transition-all duration-150 cursor-pointer ${
                    isDark
                      ? "bg-[#0e0e0e] border-[#1e1e1e] hover:border-[#2a2a2a]"
                      : "bg-[#f9f9f9] border-[#e8e8e8] hover:border-[#d0d0d0]"
                  }`}
                >
                  <div className="w-7.5 h-7.5 rounded-[7px] overflow-hidden shrink-0">
                    <Image
                      src={
                        currentUser.img ||
                        "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                      }
                      alt="Profile"
                      width={30}
                      height={30}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-[13px] font-semibold max-w-22.5 truncate hidden sm:block ${
                      isDark ? "text-[#ccc]" : "text-[#222]"
                    }`}
                  >
                    {currentUser.username}
                  </span>
                  <HiChevronDown
                    className={`text-[13px] transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    } ${isDark ? "text-[#383838]" : "text-[#bbb]"}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
                      className="absolute top-[calc(100%+8px)] right-0 bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl w-55 z-50 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-4 py-3.5 border-b border-[#141414] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[9px] overflow-hidden shrink-0 border border-[#1e1e1e]">
                          <Image
                            src={
                              currentUser.img ||
                              "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                            }
                            alt="Profile"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#ddd] truncate">{currentUser.username}</p>
                          <p className="text-[11px] text-[#383838] mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block shrink-0" />
                            {roleLabel}
                          </p>
                        </div>
                      </div>

                      <div className="p-1.5">
                        {/* Seller links */}
                        {currentUser.isSeller && (
                          <>
                            <SectionLabel label="Workspace" />
                            <DropdownItem href="/mygigs" icon={<TbLayoutGrid />} label="My gigs" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/add" icon={<TbPlus />} label="Add new gig" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/orders" icon={<TbShoppingCart />} label={t("navbar.orders")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/chat" icon={<TbMessages />} label={t("navbar.messages")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/meetings" icon={<TbVideo />} label="Meetings" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/seller/job" icon={<TbBriefcase />} label="Client job requests" onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Buyer links */}
                        {!currentUser.isSeller && !currentUser.isAdmin && (
                          <>
                            <SectionLabel label="Workspace" />
                            <DropdownItem href="/orders" icon={<TbShoppingCart />} label={t("navbar.orders")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/profile" icon={<TbUsers />} label="Freelancer profiles" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/allgigs" icon={<TbLayoutGrid />} label="Browse gigs" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/chat" icon={<TbMessages />} label={t("navbar.messages")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/meetings" icon={<TbVideo />} label="Meetings" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/jobs" icon={<TbBriefcase />} label="Post jobs & proposals" onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Admin links */}
                        {currentUser.isAdmin && (
                          <>
                            <SectionLabel label="Admin" />
                            <DropdownItem href="/admin" icon={<TbLayoutDashboard />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/admin/messages" icon={<TbMessages />} label="Messages" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/admin/sellers" icon={<TbUsers />} label="Sellers" onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Logout */}
                        <div className="h-px bg-[#141414] mx-1 my-1.5" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-[12.5px] font-medium text-[#4a4a4a] hover:bg-[#1a0808] hover:text-red-400 transition-all"
                        >
                          <TbLogout className="text-red-500 text-[15px]" />
                          {t("navbar.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login">
                <button
                  className={`text-[13px] font-semibold px-5 py-2 rounded-[9px] transition-all active:scale-[0.97] ${
                    isDark
                      ? "bg-orange-600 hover:bg-orange-500 text-white"
                      : "bg-[#0a0a0a] hover:bg-[#222] text-white"
                  }`}
                >
                  {t("navbar.signIn")}
                </button>
              </Link>
            )}
          </div>
        </div>

        <CategoriesBar />
      </nav>
    </>
  );
};

const SectionLabel = ({ label }: { label: string }) => (
  <p className="text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-[0.08em] px-3 pt-2 pb-1">
    {label}
  </p>
);

const DropdownItem = ({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[12.5px] font-medium text-[#555] hover:bg-[#151515] hover:text-[#ccc] transition-all"
  >
    <span className="text-orange-500 text-[15px] shrink-0">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
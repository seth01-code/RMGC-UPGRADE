"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoLogOutOutline } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";
import { MdOutlineAdd, MdAdminPanelSettings } from "react-icons/md";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaTasks } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiChevronDown } from "react-icons/hi";
import Image from "next/image";
import CategoriesBar from "./CategoriesBar";
import Announcements from "./Announcement";
import { Orbitron } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

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
  };

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
        <div className="mx-auto flex items-center justify-between px-6 md:px-10 max-w-[1400px] h-16">

          {/* ── Logo ── */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              href="/"
              className={`font-[var(--font-orbitron)] text-[22px] font-bold tracking-wide select-none ${orbitron.variable}`}
            >
              <span className="text-orange-500">RM</span>
              <span className={isDark ? "text-white" : "text-[#111]"}>GC</span>
              <motion.span
                className="text-orange-500 ml-0.5"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ display: "inline-block" }}
              >
                .
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-4">

            {/* Admin icon */}
            {currentUser?.isAdmin && (
              <Link
                href="/admin"
                className={`text-xl transition-colors ${
                  isDark ? "text-[#444] hover:text-orange-500" : "text-[#bbb] hover:text-orange-500"
                }`}
                title="Admin panel"
              >
                <MdAdminPanelSettings />
              </Link>
            )}

            {/* Seller dashboard icon */}
            {currentUser?.isSeller && (
              <Link
                href="/seller"
                className={`text-xl transition-colors ${
                  isDark ? "text-[#444] hover:text-orange-500" : "text-[#bbb] hover:text-orange-500"
                }`}
                title="Seller dashboard"
              >
                <LuLayoutDashboard />
              </Link>
            )}

            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar trigger */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none"
                >
                  <div
                    className={`w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0 border-2 ${
                      isDark ? "border-[#1e1e1e]" : "border-[#e5e5e5]"
                    }`}
                  >
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
                  <span
                    className={`text-[13px] font-semibold max-w-[100px] truncate hidden sm:block ${
                      isDark ? "text-[#ccc]" : "text-[#333]"
                    }`}
                  >
                    {currentUser.username}
                  </span>
                  <HiChevronDown
                    className={`text-[14px] transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    } ${isDark ? "text-[#444]" : "text-[#bbb]"}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-12 right-0 bg-[#0e0e0e] border border-[#1e1e1e] rounded-2xl w-56 z-50 overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-[#161616]">
                        <p className="text-[13px] font-bold text-[#ccc]">{currentUser.username}</p>
                        <p className="text-[11px] text-[#444] mt-0.5">
                          {currentUser.isAdmin ? "Admin account" : currentUser.isSeller ? "Freelancer account" : "Client account"}
                        </p>
                      </div>

                      <div className="p-2">
                        {/* Seller links */}
                        {currentUser.isSeller && (
                          <>
                            <DropdownItem href="/mygigs" icon={<MdOutlineAdd />} label={t("navbar.Gigs")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/add" icon={<MdOutlineAdd />} label={t("navbar.Add New Gig")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/orders" icon={<HiOutlineShoppingCart />} label={t("navbar.orders")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/chat" icon={<TbMessages />} label={t("navbar.messages")} onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Buyer links */}
                        {!currentUser.isSeller && !currentUser.isAdmin && (
                          <>
                            <DropdownItem href="/orders" icon={<HiOutlineShoppingCart />} label={t("navbar.orders")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/allgigs" icon={<FaTasks />} label={t("allGigs")} onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/chat" icon={<TbMessages />} label={t("navbar.messages")} onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Admin links */}
                        {currentUser.isAdmin && (
                          <>
                            <DropdownItem href="/admin" icon={<LuLayoutDashboard />} label="Dashboard" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/admin/messages" icon={<TbMessages />} label="Messages" onClick={() => setProfileOpen(false)} />
                            <DropdownItem href="/admin/sellers" icon={<FaTasks />} label="Sellers" onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        {/* Separator + logout */}
                        <div className="h-px bg-[#161616] my-1.5" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#555] hover:bg-[#1a0808] hover:text-red-400 transition-all"
                        >
                          <IoLogOutOutline className="text-red-500 text-base" />
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
                  className={`text-[13px] font-bold px-5 py-2 rounded-lg transition-colors ${
                    isDark
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-[#080808] hover:bg-[#222] text-white"
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
    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#555] hover:bg-[#161616] hover:text-[#ccc] transition-all"
  >
    <span className="text-orange-500 text-base">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
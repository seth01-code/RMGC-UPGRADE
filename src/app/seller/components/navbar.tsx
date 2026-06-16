"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoLogOutOutline } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";
import { MdOutlineAdd, MdAdminPanelSettings } from "react-icons/md";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { FaTasks } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Orbitron, Poppins } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-orbitron",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

interface User {
  username: string;
  img?: string;
  isSeller?: boolean;
  isAdmin?: boolean;
}

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({
  href,
  icon,
  label,
  collapsed,
  active,
  onClick,
  danger,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
  danger?: boolean;
}) => {
  const base =
    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group w-full";

  const state = danger
    ? "text-neutral-500 hover:bg-red-50 hover:text-red-500"
    : active
    ? "bg-[#f97316] text-white shadow-sm shadow-orange-200"
    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900";

  const inner = (
    <>
      {/* Active indicator bar */}
      {active && !danger && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-full opacity-60" />
      )}

      <span
        className={`text-[17px] shrink-0 transition-colors ${
          active ? "text-white" : danger ? "group-hover:text-red-500" : ""
        }`}
      >
        {icon}
      </span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden whitespace-nowrap leading-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
          {label}
          <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${state}`}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href!} className={`${base} ${state}`}>
      {inner}
    </Link>
  );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) =>
  collapsed ? (
    <div className="mx-3 my-2 h-px bg-neutral-200" />
  ) : (
    <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400 select-none">
      {label}
    </p>
  );

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
      role === "Admin"
        ? "bg-purple-100 text-purple-600"
        : role === "Freelancer"
        ? "bg-orange-100 text-[#f97316]"
        : "bg-neutral-100 text-neutral-500"
    }`}
  >
    {role}
  </span>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SellerNavbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    setCurrentUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const role = currentUser?.isAdmin
    ? "Admin"
    : currentUser?.isSeller
    ? "Freelancer"
    : "Client";

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 68 : 224 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 h-screen bg-white border-r border-neutral-200 z-50 flex flex-col overflow-hidden"
      >
        {/* ── Logo + toggle ── */}
        <div
          className={`flex items-center border-b border-neutral-100 px-3 h-[60px] shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`${orbitron.variable} ${poppins.variable} select-none`}
              >
                <Link
                  href="/"
                  className="text-[20px] font-bold font-[var(--font-orbitron)] relative inline-block"
                >
                  <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-neutral-400 bg-clip-text text-transparent">
                    RM
                  </span>
                  <span className="font-[var(--font-poppins)] font-semibold text-neutral-800">
                    GC
                  </span>
                  <span className="text-[#f97316] text-2xl absolute -right-3 top-0 leading-none">
                    .
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors shrink-0"
          >
            {collapsed ? (
              <HiChevronRight className="text-[13px]" />
            ) : (
              <HiChevronLeft className="text-[13px]" />
            )}
          </button>
        </div>

        {/* ── User strip ── */}
        {currentUser ? (
          <div
            className={`flex items-center gap-3 px-3 py-3 border-b border-neutral-100 shrink-0 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-neutral-200 shrink-0">
              <Image
                src={currentUser.img || FALLBACK_AVATAR}
                alt={currentUser.username}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden min-w-0 flex flex-col gap-1"
                >
                  <p className="text-[13px] font-bold text-neutral-900 truncate leading-none">
                    {currentUser.username}
                  </p>
                  <RoleBadge role={role} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-[60px] border-b border-neutral-100 shrink-0 flex items-center justify-center px-3">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <Link href="/login">
                    <button className="w-full bg-[#f97316] hover:bg-orange-600 text-white text-[12px] font-bold py-2 rounded-xl transition-colors">
                      {t("navbar.signIn")}
                    </button>
                  </Link>
                </motion.div>
              )}
              {collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link href="/login">
                    <div className="w-9 h-9 bg-[#f97316] hover:bg-orange-600 rounded-xl flex items-center justify-center transition-colors">
                      <IoLogOutOutline className="text-white text-[16px]" />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Nav links ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 flex flex-col gap-0.5 scrollbar-none">
          {currentUser?.isAdmin && (
            <>
              <SectionLabel label="Admin" collapsed={collapsed} />
              <NavItem
                href="/admin"
                icon={<MdAdminPanelSettings />}
                label="Dashboard"
                collapsed={collapsed}
                active={pathname === "/admin"}
              />
              <NavItem
                href="/admin/messages"
                icon={<TbMessages />}
                label="Messages"
                collapsed={collapsed}
                active={pathname.startsWith("/admin/messages")}
              />
              <NavItem
                href="/admin/sellers"
                icon={<FaTasks />}
                label="Sellers"
                collapsed={collapsed}
                active={pathname.startsWith("/admin/sellers")}
              />
            </>
          )}

          {currentUser?.isSeller && (
            <>
              <SectionLabel label="Freelancer" collapsed={collapsed} />
              <NavItem
                href="/seller"
                icon={<LuLayoutDashboard />}
                label="Dashboard"
                collapsed={collapsed}
                active={pathname === "/seller"}
              />
              <NavItem
                href="/mygigs"
                icon={<FaTasks />}
                label={t("navbar.Gigs")}
                collapsed={collapsed}
                active={pathname.startsWith("/mygigs")}
              />
              <NavItem
                href="/add"
                icon={<MdOutlineAdd />}
                label={t("navbar.Add New Gig")}
                collapsed={collapsed}
                active={pathname === "/add"}
              />
              <NavItem
                href="/orders"
                icon={<HiOutlineShoppingCart />}
                label={t("navbar.orders")}
                collapsed={collapsed}
                active={pathname.startsWith("/orders")}
              />
              <NavItem
                href="/chat"
                icon={<TbMessages />}
                label={t("navbar.messages")}
                collapsed={collapsed}
                active={pathname.startsWith("/chat")}
              />
            </>
          )}

          {currentUser && !currentUser.isSeller && !currentUser.isAdmin && (
            <>
              <SectionLabel label="Buyer" collapsed={collapsed} />
              <NavItem
                href="/orders"
                icon={<HiOutlineShoppingCart />}
                label={t("navbar.orders")}
                collapsed={collapsed}
                active={pathname.startsWith("/orders")}
              />
              <NavItem
                href="/allgigs"
                icon={<FaTasks />}
                label={t("allGigs")}
                collapsed={collapsed}
                active={pathname.startsWith("/allgigs")}
              />
              <NavItem
                href="/chat"
                icon={<TbMessages />}
                label={t("navbar.messages")}
                collapsed={collapsed}
                active={pathname.startsWith("/chat")}
              />
            </>
          )}
        </nav>

        {/* ── Bottom — logout ── */}
        {currentUser && (
          <div className="px-2 py-3 border-t border-neutral-100 shrink-0">
            <NavItem
              icon={<IoLogOutOutline />}
              label={t("navbar.logout")}
              collapsed={collapsed}
              onClick={handleLogout}
              danger
            />
          </div>
        )}
      </motion.aside>

      {/* ── Page push spacer ── */}
      <motion.div
        animate={{ marginLeft: collapsed ? 68 : 224 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        id="sidebar-page-content"
      />
    </>
  );
};

export default SellerNavbar;
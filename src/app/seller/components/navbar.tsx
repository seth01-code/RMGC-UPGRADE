"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoLogOutOutline } from "react-icons/io5";
import { TbCalendarEvent, TbMessages } from "react-icons/tb";
import {
  MdOutlineAdd,
  MdAdminPanelSettings,
  MdOutlineWork,
} from "react-icons/md";
import {
  HiOutlineShoppingCart,
  HiChevronLeft,
  HiChevronRight,
  HiMenuAlt2,
  HiX,
} from "react-icons/hi";
import { FaTasks } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
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

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
const useIsLargeScreen = () => {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLarge(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isLarge;
};

// ─── Nav Item ─────────────────────────────────────────────────────────────────
const NavItem = ({
  href,
  icon,
  label,
  collapsed,
  active,
  onClick,
  onNavigate,
  danger,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
  onNavigate?: () => void;
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
    <Link href={href!} onClick={onNavigate} className={`${base} ${state}`}>
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

// ─── Logo ─────────────────────────────────────────────────────────────────────
const Logo = ({
  size,
  onClick,
}: {
  size: "sm" | "lg";
  onClick?: () => void;
}) => (
  <Link
    href="/"
    onClick={onClick}
    className={`${orbitron.variable} ${poppins.variable} ${
      size === "lg" ? "text-[20px]" : "text-[18px]"
    } font-bold relative inline-block select-none`}
  >
    <span className="bg-linear-to-r from-orange-500 via-amber-400 to-neutral-400 bg-clip-text text-transparent">
      RM
    </span>
    <span className="font-(--font-poppins) text-neutral-800">GC</span>
    <span
      className={`text-[#f97316] ${
        size === "lg" ? "text-2xl -right-3" : "text-xl -right-2.5"
      } absolute top-0 leading-none`}
    >
      .
    </span>
  </Link>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SellerNavbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isLargeScreen = useIsLargeScreen();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("currentUser") || "null",
    );
    setCurrentUser(storedUser);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.location.href = "http://localhost:3000/login";
  };

  const role = currentUser?.isAdmin
    ? "Admin"
    : currentUser?.isSeller
      ? "Freelancer"
      : "Client";

  const closeMobile = () => setMobileOpen(false);

  // ── Dispatch collapse event so LayoutShell can sync margin-left ──
  const handleHeaderToggle = () => {
    if (isLargeScreen) {
      setCollapsed((c) => {
        const next = !c;
        window.dispatchEvent(
          new CustomEvent("sidebar-collapse-change", {
            detail: { collapsed: next },
          }),
        );
        return next;
      });
    } else {
      setMobileOpen(false);
    }
  };

  const effectiveCollapsed = isLargeScreen && collapsed;
  const sidebarWidth = isLargeScreen ? (collapsed ? 68 : 224) : 272;

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 z-30 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
        >
          <HiMenuAlt2 className="text-[18px]" />
        </button>
      </div>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeMobile}
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-neutral-200 z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* ── Logo + toggle ── */}
        <div
          className={`flex items-center border-b border-neutral-100 px-3 h-14 lg:h-15 shrink-0 ${
            effectiveCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <AnimatePresence initial={false}>
            {!effectiveCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Logo size="lg" onClick={closeMobile} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleHeaderToggle}
            aria-label={isLargeScreen ? "Toggle sidebar" : "Close menu"}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors shrink-0"
          >
            {isLargeScreen ? (
              effectiveCollapsed ? (
                <HiChevronRight className="text-[13px]" />
              ) : (
                <HiChevronLeft className="text-[13px]" />
              )
            ) : (
              <HiX className="text-[15px]" />
            )}
          </button>
        </div>

        {/* ── User strip ── */}
        {currentUser ? (
          <div
            className={`flex items-center gap-3 px-3 py-3 border-b border-neutral-100 shrink-0 ${
              effectiveCollapsed ? "justify-center" : ""
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
              {!effectiveCollapsed && (
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
          <div className="h-14 lg:h-15 border-b border-neutral-100 shrink-0 flex items-center justify-center px-3">
            <AnimatePresence initial={false}>
              {!effectiveCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <Link href="/login" onClick={closeMobile}>
                    <button className="w-full bg-[#f97316] hover:bg-orange-600 text-white text-[12px] font-bold py-2 rounded-xl transition-colors">
                      {t("navbar.signIn")}
                    </button>
                  </Link>
                </motion.div>
              )}
              {effectiveCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link href="/login" onClick={closeMobile}>
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
              <SectionLabel label="Admin" collapsed={effectiveCollapsed} />
              <NavItem
                href="/admin"
                icon={<MdAdminPanelSettings />}
                label="Dashboard"
                collapsed={effectiveCollapsed}
                active={pathname === "/admin"}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/admin/messages"
                icon={<TbMessages />}
                label="Messages"
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/admin/messages")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/admin/sellers"
                icon={<FaTasks />}
                label="Sellers"
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/admin/sellers")}
                onNavigate={closeMobile}
              />
            </>
          )}

          {currentUser?.isSeller && (
            <>
              <SectionLabel label="Freelancer" collapsed={effectiveCollapsed} />
              <NavItem
                href="/seller"
                icon={<LuLayoutDashboard />}
                label="Dashboard"
                collapsed={effectiveCollapsed}
                active={pathname === "/seller"}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/mygigs"
                icon={<FaTasks />}
                label={t("navbar.Gigs")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/mygigs")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/add"
                icon={<MdOutlineAdd />}
                label={t("navbar.Add New Gig")}
                collapsed={effectiveCollapsed}
                active={pathname === "/add"}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/orders"
                icon={<HiOutlineShoppingCart />}
                label={t("navbar.orders")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/orders")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/chat"
                icon={<TbMessages />}
                label={t("navbar.messages")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/chat")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/meetings"
                icon={<TbCalendarEvent />}
                label="Meetings"
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/meetings")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/seller/job"
                icon={<MdOutlineWork />}
                label="Client Job Requests"
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/seller/job")}
                onNavigate={closeMobile}
              />
            </>
          )}

          {currentUser && !currentUser.isSeller && !currentUser.isAdmin && (
            <>
              <SectionLabel label="Buyer" collapsed={effectiveCollapsed} />
              <NavItem
                href="/orders"
                icon={<HiOutlineShoppingCart />}
                label={t("navbar.orders")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/orders")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/allgigs"
                icon={<FaTasks />}
                label={t("allGigs")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/allgigs")}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/chat"
                icon={<TbMessages />}
                label={t("navbar.messages")}
                collapsed={effectiveCollapsed}
                active={pathname.startsWith("/chat")}
                onNavigate={closeMobile}
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
              collapsed={effectiveCollapsed}
              onClick={() => {
                handleLogout();
                closeMobile();
              }}
              danger
            />
          </div>
        )}
      </motion.aside>

      {/* ── Page push spacer (kept for non-LayoutShell pages) ── */}
      <motion.div
        animate={{ marginLeft: isLargeScreen ? (collapsed ? 68 : 224) : 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        id="sidebar-page-content"
      />
    </>
  );
};

export default SellerNavbar;

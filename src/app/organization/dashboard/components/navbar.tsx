"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MdVerified } from "react-icons/md";

interface OrgData {
  name: string;
  logo: string;
  industry?: string;
}

interface User {
  username: string;
  img?: string;
  organization?: OrgData;
}

const OrganizationNavbar = () => {
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  /* Load user safely */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /* Logout */
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    router.push("/login");
  };

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const org = currentUser?.organization;

  const navLinks = [
    { name: "Jobs", href: "/organization/jobs" },
    { name: "Applicants", href: "/organization/applicants" },
    { name: "Billing", href: "/organization/billing" },
    // { name: "Settings", href: "/organization/settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* LEFT */}
        <Link href="/organization/dashboard">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={org?.logo || "/noimage.jpg"}
                alt="Org Logo"
                width={44}
                height={44}
                className="object-cover"
              />
            </div>

            <div className="truncate">
              <div className="flex items-center gap-1 font-semibold text-gray-900">
                {org?.name || "Organization"}
                {org && <MdVerified className="w-5 h-5 text-[#1DA1F2]" />}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {org?.industry || "Industry"}
              </p>
            </div>
          </div>
        </Link>

        {/* CENTER */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-orange-600 transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Notifications */}
          {/* <div className="relative hidden sm:block" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-3 text-sm"
                >
                  <p className="text-gray-500 text-center">
                    No notifications yet
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={
                    currentUser?.img ||
                    "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                  }
                  alt="User"
                  fill
                  className="object-cover rounded-full"
                  sizes="36px"
                />
              </div>

              <span className="hidden sm:block text-sm font-medium truncate max-w-[140px]">
                {currentUser?.username}
              </span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg text-sm"
                >
                  <Link
                    href="/organization/settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 shadow-lg"
            >
              <div className="flex justify-between p-4 border-b">
                <span className="font-semibold">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-orange-600"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default OrganizationNavbar;

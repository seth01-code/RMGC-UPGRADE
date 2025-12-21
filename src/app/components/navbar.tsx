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
import Image from "next/image";
import CategoriesBar from "./CategoriesBar";
import Announcements from "./Announcement";
import { Orbitron, Poppins } from "next/font/google";
import { motion } from "framer-motion";

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

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => setActive(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <>
      <Announcements />
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          active || pathname !== "/"
            ? "bg-gradient-to-r from-orange-100 to-white text-black shadow-md"
            : "bg-gradient-to-r from-black to-gray-800 text-white"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6 md:px-12 max-w-[1400px]">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`text-2xl sm:text-3xl font-bold tracking-wide select-none ${orbitron.variable} ${poppins.variable}`}
          >
            <Link
              href="/"
              className="relative inline-block font-[var(--font-orbitron)]"
            >
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-gray-300 bg-clip-text text-transparent drop-shadow-sm">
                RM
              </span>
              <span
                className={`font-[var(--font-poppins)] font-semibold transition-colors duration-500 ${
                  active ? "text-black" : "text-gray-300"
                }`}
              >
                GC
              </span>
              <motion.span
                className="absolute -right-3 top-0 text-orange-500 text-3xl"
                animate={{ y: [0, -2, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                .
              </motion.span>
            </Link>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 font-medium text-sm sm:text-base">
            {currentUser?.isAdmin && (
              <Link
                href="/admin"
                className="text-xl sm:text-2xl hover:text-orange-500 transition-colors"
              >
                <MdAdminPanelSettings />
              </Link>
            )}

            {currentUser?.isSeller && (
              <Link
                href="/seller"
                className="text-xl sm:text-2xl hover:text-orange-500 transition-colors"
              >
                <LuLayoutDashboard />
              </Link>
            )}

            {currentUser ? (
              <div
                className="relative cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 relative rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image
                      src={
                        currentUser.img ||
                        "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                      }
                      alt="Profile Picture"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">
                    {currentUser.username}
                  </span>
                </div>

                {profileOpen && (
                  <div className="absolute top-10 sm:top-12 right-0 p-3 sm:p-5 bg-gradient-to-r from-[#000000] to-[#130F40] rounded-lg shadow-lg border flex flex-col gap-2 sm:gap-4 text-white w-44 sm:w-56 transition-all ease-in-out z-50">
                    {currentUser.isSeller && (
                      <>
                        <Link
                          href="/mygigs"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <MdOutlineAdd className="text-base sm:text-lg" />{" "}
                          {t("navbar.Gigs")}
                        </Link>
                        <Link
                          href="/add"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <MdOutlineAdd className="text-base sm:text-lg" />{" "}
                          {t("navbar.Add New Gig")}
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <HiOutlineShoppingCart className="text-base sm:text-lg" />{" "}
                          {t("navbar.orders")}
                        </Link>
                        <Link
                          href="/chat"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <TbMessages className="text-base sm:text-lg" />{" "}
                          {t("navbar.messages")}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <IoLogOutOutline className="text-base sm:text-lg" />{" "}
                          {t("navbar.logout")}
                        </button>
                      </>
                    )}

                    {!currentUser.isSeller && !currentUser.isAdmin && (
                      <>
                        <Link
                          href="/orders"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <HiOutlineShoppingCart className="text-base sm:text-lg" />{" "}
                          {t("navbar.orders")}
                        </Link>
                        <Link
                          href="/allgigs"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <FaTasks className="text-base sm:text-lg" />{" "}
                          {t("allGigs")}
                        </Link>
                        <Link
                          href="/chat"
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <TbMessages className="text-base sm:text-lg" />{" "}
                          {t("navbar.messages")}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <IoLogOutOutline className="text-base sm:text-lg" />{" "}
                          {t("navbar.logout")}
                        </button>
                      </>
                    )}

                    {currentUser.isAdmin && (
                      <>
                        <Link
                          href="/admin/"
                          className="p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/admin/messages"
                          className={`p-2 rounded-md transition text-sm sm:text-base ${
                            pathname.startsWith("/admin/messages")
                              ? "bg-orange-300 text-black"
                              : "text-white"
                          }`}
                        >
                          Messages
                        </Link>
                        <Link
                          href="/admin/sellers"
                          className={`p-2 rounded-md transition text-sm sm:text-base ${
                            pathname.startsWith("/admin/sellers")
                              ? "bg-orange-300 text-black"
                              : "text-white"
                          }`}
                        >
                          Sellers
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white hover:text-orange-200 rounded-md transition text-sm sm:text-base"
                        >
                          <IoLogOutOutline className="text-base sm:text-lg" />{" "}
                          {t("navbar.logout")}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition duration-300 text-sm sm:text-base ${
                    active || pathname !== "/"
                      ? "bg-black text-white hover:bg-gray-700"
                      : "bg-orange-400 text-white hover:bg-orange-500"
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

export default Navbar;

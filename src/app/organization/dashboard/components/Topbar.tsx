"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";

interface User {
  username: string;
  img?: string;
  vipSubscription?: { active: boolean };
  organization?: { name: string; logo: string };
}

interface TopbarProps {
  user: User | null;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, onLogout }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New applicant for Frontend Developer",
      time: "2h ago",
      unread: true,
    },
    { id: 2, message: "Job posting approved", time: "1d ago", unread: true },
    {
      id: 3,
      message: "Subscription renewed successfully",
      time: "3d ago",
      unread: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className="
        sticky top-0 z-50
        w-full
        bg-transparent
        backdrop-blur-md
        px-4 py-3
      "
    >
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          {user?.organization && (
            <Link
              href="/organization/dashboard"
              className="flex items-center gap-2 min-w-0"
            >
              <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-200 shrink-0">
                <Image
                  src={user.organization.logo}
                  alt={user.organization.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-1 text-sm font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-[320px]">
                <span className="truncate">{user.organization.name}</span>
                {user.vipSubscription?.active && (
                  <MdVerified className="w-5 h-5 text-blue-500 shrink-0" />
                )}
              </div>
            </Link>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Notifications */}
          {/* <div className="relative">
            <button
              onClick={() => setNotificationsOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white" />
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="fixed left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[90vw] max-w-[20rem]bg-white shadow-xl bg-white rounded-xl border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-3 text-sm font-semibold text-gray-700 border-b">
                    Notifications
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between gap-2"
                        >
                          <div className={notif.unread ? "font-semibold" : ""}>
                            <div>{notif.message}</div>
                            <div className="text-xs text-gray-400">
                              {notif.time}
                            </div>
                          </div>

                          {notif.unread && (
                            <button
                              onClick={() =>
                                setNotifications((prev) =>
                                  prev.filter((n) => n.id !== notif.id)
                                )
                              }
                              className="text-green-500 hover:text-green-600"
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}

          {/* Profile */}
          {user && (
            <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur px-3 py-1 rounded-full">
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src={
                    user.img ||
                    "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                  }
                  alt="User"
                  fill
                  className="object-cover"
                />
              </div>

              <span className="text-sm truncate max-w-[90px] sm:max-w-[140px]">
                {user.username}
              </span>

              <button
                onClick={onLogout}
                className="p-1 rounded-md hover:bg-gray-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

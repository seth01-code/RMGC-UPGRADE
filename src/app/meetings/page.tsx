"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import newRequest from "../utils/newRequest";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  FaVideo,
  FaTimes,
  FaRegClock,
  FaCheck,
  FaBan,
  FaHourglassHalf,
  FaArrowLeft,
} from "react-icons/fa";
import { LuCalendarDays } from "react-icons/lu";

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

const statusConfig: Record<
  string,
  { label: string; chip: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Awaiting response",
    chip: "bg-orange-50 text-orange-600",
    icon: <FaHourglassHalf className="text-[10px]" />,
  },
  accepted: {
    label: "Confirmed",
    chip: "bg-green-50 text-green-600",
    icon: <FaCheck className="text-[10px]" />,
  },
  declined: {
    label: "Declined",
    chip: "bg-red-50 text-red-500",
    icon: <FaBan className="text-[10px]" />,
  },
  cancelled: {
    label: "Cancelled",
    chip: "bg-neutral-100 text-neutral-400",
    icon: <FaBan className="text-[10px]" />,
  },
  completed: {
    label: "Completed",
    chip: "bg-blue-50 text-blue-500",
    icon: <FaCheck className="text-[10px]" />,
  },
};

const MeetingsPage = () => {
  const [tab, setTab] = useState<"asBuyer" | "asSeller">("asBuyer");
  const [isSeller, setIsSeller] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        const seller = !!JSON.parse(stored)?.isSeller;
        setIsSeller(seller);
        // Sellers land on requests made of them, since that's what they're
        // most likely checking; buyers land on what they've requested.
        setTab(seller ? "asSeller" : "asBuyer");
      }
    } catch {
      // ignore malformed/missing currentUser
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["myMeetings"],
    queryFn: async () => (await newRequest.get("/meetings/mine")).data,
  });

  const cancel = async (id: string) => {
    try {
      await newRequest.patch(`/meetings/${id}/cancel`);
      toast.success("Meeting cancelled.");
      queryClient.invalidateQueries({ queryKey: ["myMeetings"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel meeting.");
    }
  };

  const list = data?.[tab] || [];

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3.5 mb-1.5"
        >
          <Link
            href="/"
            title="Back to home"
            className="w-10 h-10 rounded-2xl bg-white border border-[#eee] flex items-center justify-center shrink-0 hover:bg-[#fafafa] hover:border-[#e0e0e0] transition"
          >
            <FaArrowLeft className="text-[13px] text-[#555]" />
          </Link>
          <div className="w-11 h-11 rounded-2xl bg-[#0a0a0a] flex items-center justify-center shrink-0">
            <FaVideo className="text-orange-400 text-[16px]" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-[#0a0a0a] leading-none tracking-tight">
              Your meetings
            </h1>
            <p className="text-[12.5px] text-[#999] mt-1">
              {isSeller
                ? "Video calls with clients before they book you"
                : "Video calls to vet freelancers before you commit"}
            </p>
          </div>
        </motion.div>

        {/* ── Segmented tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="inline-flex bg-[#ececec] rounded-full p-1 mt-7 mb-7"
        >
          {(["asBuyer", "asSeller"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2 text-[12.5px] font-bold rounded-full transition-colors ${
                tab === t ? "text-white" : "text-[#777] hover:text-[#333]"
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="meetingsTabPill"
                  className="absolute inset-0 bg-[#0a0a0a] rounded-full"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">
                {t === "asBuyer" ? "Requested by you" : "Requested of you"}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[84px] bg-white rounded-2xl border border-[#f0f0f0] animate-pulse"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#eee] flex items-center justify-center">
              <LuCalendarDays className="text-[24px] text-[#ccc]" />
            </div>
            <p className="text-[14px] font-bold text-[#333]">
              No meetings here yet
            </p>
            <p className="text-[12.5px] text-[#aaa] max-w-[260px]">
              {tab === "asBuyer"
                ? "Schedule a call from any gig page to vet a freelancer before ordering."
                : "Meeting requests from clients will show up here."}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {list.map((m: any, i: number) => {
                const date = new Date(m.proposedTime);
                const day = date
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .toUpperCase();
                const num = date.getDate();
                const time = date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                });
                const status = statusConfig[m.status];

                return (
                  <motion.div
                    key={m._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-[#eee] hover:border-[#e0e0e0] hover:shadow-sm transition-all p-4"
                  >
                    {/* Date chip */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#fafafa] border border-[#f0f0f0] shrink-0">
                      <span className="text-[9px] font-black text-orange-500 tracking-wide leading-none">
                        {day}
                      </span>
                      <span className="text-[16px] font-black text-[#111] leading-none mt-0.5">
                        {num}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        src={m.peerImg || FALLBACK_AVATAR}
                        alt={m.peerUsername}
                        fill
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#111] truncate leading-tight">
                        {m.peerUsername}
                      </p>
                      <p className="text-[11.5px] text-[#999] truncate mt-0.5">
                        {m.gigTitle}
                      </p>
                      <p className="text-[11px] text-[#666] font-semibold flex items-center gap-1 mt-1">
                        <FaRegClock className="text-[9px] text-[#bbb]" />
                        {time}
                      </p>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {m.status === "accepted" ? (
                        <Link
                          href={`/meetings/${m._id}`}
                          className="flex items-center gap-1.5 text-[12px] font-bold bg-orange-500 text-white px-4 py-2.5 rounded-full hover:bg-orange-600 transition shadow-sm shadow-orange-200"
                        >
                          <FaVideo className="text-[11px]" /> Join
                        </Link>
                      ) : (
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-full ${status.chip}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      )}

                      {tab === "asBuyer" &&
                        ["pending", "accepted"].includes(m.status) && (
                          <button
                            onClick={() => cancel(m._id)}
                            title="Cancel meeting"
                            className="w-8 h-8 rounded-full bg-[#f5f5f5] text-[#aaa] hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition shrink-0"
                          >
                            <FaTimes className="text-[11px]" />
                          </button>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;

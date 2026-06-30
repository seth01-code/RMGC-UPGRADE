"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Image from "next/image";
import newRequest from "../../utils/newRequest";
import { toast } from "sonner";
import { FaRegCalendarAlt, FaCheck, FaTimes, FaVideo } from "react-icons/fa";

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

type Meeting = {
  _id: string;
  peerImg?: string;
  peerUsername: string;
  gigTitle?: string;
  proposedTime?: string;
  status?: string;
};

const MeetingRequestsPanel = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ asSeller?: Meeting[] }>({
    queryKey: ["myMeetings"],
    queryFn: async () => (await newRequest.get("/meetings/mine")).data,
  });

  const respond = async (id: string, action: "accept" | "decline") => {
    try {
      await newRequest.patch(`/meetings/${id}/respond`, { action });
      toast.success(action === "accept" ? "Meeting accepted." : "Meeting declined.");
      queryClient.invalidateQueries({ queryKey: ["myMeetings"] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e?.response?.data?.message || e?.message || "Something went wrong.");
    }
  };

  const asSeller: Meeting[] = data?.asSeller || [];
  const pending: Meeting[] = asSeller.filter((m) => m.status === "pending");
  const accepted: Meeting[] = asSeller.filter((m) => m.status === "accepted");

  if (isLoading) return null;
  if (pending.length === 0 && accepted.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6"
    >
      <h2 className="text-[13px] font-bold text-neutral-900 tracking-tight flex items-center gap-2.5 uppercase mb-5">
        <span className="block w-1 h-4 rounded-full bg-[#f97316]" />
        Meeting requests
        {pending.length > 0 && (
          <span className="text-[10px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
            {pending.length}
          </span>
        )}
      </h2>

      <div className="flex flex-col gap-3">
        {pending.map((m: Meeting) => (
          <div key={m._id} className="flex items-center gap-3 border border-[#f0f0f0] rounded-xl p-3.5">
            <div className="relative w-10 h-10 shrink-0">
              <Image src={m.peerImg || FALLBACK_AVATAR} alt={m.peerUsername} fill className="rounded-full object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-neutral-900 truncate">{m.peerUsername}</p>
              <p className="text-[11px] text-neutral-400 truncate">{m.gigTitle}</p>
              <p className="text-[11px] text-orange-500 font-semibold flex items-center gap-1 mt-0.5">
                <FaRegCalendarAlt className="text-[10px]" />
                {new Date(m.proposedTime).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => respond(m._id, "accept")} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition">
                <FaCheck className="text-[12px]" />
              </button>
              <button onClick={() => respond(m._id, "decline")} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition">
                <FaTimes className="text-[12px]" />
              </button>
            </div>
          </div>
        ))}

        {accepted.map((m: Meeting) => (
          <div key={m._id} className="flex items-center gap-3 border border-orange-100 bg-orange-50/40 rounded-xl p-3.5">
            <div className="relative w-10 h-10 shrink-0">
              <Image src={m.peerImg || FALLBACK_AVATAR} alt={m.peerUsername} fill className="rounded-full object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-neutral-900 truncate">{m.peerUsername}</p>
              <p className="text-[11px] text-neutral-400 truncate">{m.gigTitle} · confirmed</p>
            </div>
            <a
              href={`/meetings/${m._id}`}
              className="flex items-center gap-1.5 text-[11.5px] font-bold bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition shrink-0"
            >
              <FaVideo className="text-[11px]" /> Join
            </a>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default MeetingRequestsPanel;
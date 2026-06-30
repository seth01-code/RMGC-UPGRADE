"use client";

import React, { useState } from "react";
import { FaRegCalendarAlt, FaTimes } from "react-icons/fa";
import newRequest from "../../utils/newRequest"; // adjust path to match your project structure
import { toast } from "sonner";

interface Props {
  gigId: string;
  onClose: () => void;
}

const ScheduleMeetingModal: React.FC<Props> = ({ gigId, onClose }) => {
  const [proposedTime, setProposedTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // min datetime = now, formatted for datetime-local input
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedTime) {
      toast.error("Pick a date and time first.");
      return;
    }
    setSubmitting(true);
    try {
      await newRequest.post("/meetings/request", {
        gigId,
        proposedTime: new Date(proposedTime).toISOString(),
        note,
      });
      toast.success("Meeting request sent! You'll be notified when the freelancer responds.");
      onClose();
    } catch (err: unknown) {
      // Safely extract an error message from unknown error shape
      let message = "Failed to send request.";
      if (err && typeof err === "object") {
        // Narrow the unknown error to a shape we expect (e.g. axios-like)
        const errObj = err as { response?: { data?: unknown }; message?: unknown };
        const respData = errObj.response?.data;
        // If response.data is an object with message string
        if (respData && typeof respData === "object" && "message" in (respData as object)) {
          const msg = (respData as { message?: unknown }).message;
          if (typeof msg === "string") message = msg;
        } else if (typeof respData === "string") {
          message = respData;
        } else if (typeof errObj.message === "string") {
          message = errObj.message;
        }
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#bbb] hover:text-[#333] transition"
        >
          <FaTimes className="text-[15px]" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <FaRegCalendarAlt className="text-white text-[13px]" />
          </div>
          <h2 className="text-[16px] font-black text-[#0a0a0a]">Schedule a meeting</h2>
        </div>
        <p className="text-[12.5px] text-[#999] mb-5">
          Hop on a video call with the freelancer before placing your order. They&apos;ll get an
          email and can accept or decline.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#bbb]">
              Proposed date &amp; time
            </label>
            <input
              type="datetime-local"
              required
              min={minDateTime}
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="border border-[#eee] rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[#222] focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#bbb]">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What would you like to discuss?"
              className="border border-[#eee] rounded-xl px-3.5 py-2.5 text-[13px] resize-none focus:outline-none focus:border-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black text-[13.5px] py-3 rounded-xl transition"
          >
            {submitting ? "Sending request…" : "Send meeting request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
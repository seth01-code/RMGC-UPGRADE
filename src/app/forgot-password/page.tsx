"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import newRequest from "../utils/newRequest";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMail, HiArrowRight, HiArrowLeft } from "react-icons/hi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import ClipLoader from "react-spinners/ClipLoader";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await newRequest.post("/auth/forgot-password", { email });
      toast.success(response.data.message || "Reset link sent!");
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glows */}
      <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-orange-500/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[400px]"
      >
        <AnimatePresence mode="wait">

          {/* ── Step 1 — Email form ── */}
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#f0f0f0] rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              {/* Orange top bar */}
              <div className="h-1 bg-orange-500 w-full" />

              <div className="px-8 py-10">

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <HiOutlineMail className="text-orange-500 text-[26px]" />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px w-5 bg-orange-500" />
                    <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                      Account recovery
                    </span>
                    <div className="h-px w-5 bg-orange-500" />
                  </div>
                  <h1 className="text-[24px] font-extrabold text-[#111] mb-2">
                    Reset your password
                  </h1>
                  <p className="text-[13px] text-[#aaa] leading-relaxed">
                    Enter the email linked to your account and we'll send you a reset link.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.14em] text-[#aaa] uppercase mb-1.5 block">
                      Email address
                    </label>
                    <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all duration-200 bg-white ${
                      focused
                        ? "border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                        : "border-[#f0f0f0] hover:border-[#e0e0e0]"
                    }`}>
                      <HiOutlineMail className={`text-[17px] flex-shrink-0 transition-colors ${
                        focused ? "text-orange-500" : "text-[#ccc]"
                      }`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="you@example.com"
                        required
                        className="bg-transparent outline-none w-full text-[13.5px] text-[#111] placeholder:text-[#ccc]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#111] hover:bg-orange-500 disabled:bg-[#f5f5f5] disabled:text-[#ccc] text-white text-[13.5px] font-bold py-3.5 rounded-xl transition-all duration-200 mt-2"
                  >
                    {loading ? (
                      <ClipLoader size={14} color="#fff" />
                    ) : (
                      <>
                        Send reset link
                        <HiArrowRight className="text-[15px]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Back to login */}
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 text-[12.5px] font-semibold text-[#bbb] hover:text-orange-500 mt-4 transition-colors"
                >
                  <HiArrowLeft className="text-[13px]" />
                  Back to sign in
                </button>
              </div>
            </motion.div>

          ) : (

            /* ── Step 2 — Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#f0f0f0] rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="h-1 bg-orange-500 w-full" />

              <div className="px-8 py-10 flex flex-col items-center text-center">

                {/* Animated check icon */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-6"
                >
                  <HiOutlineShieldCheck className="text-green-500 text-[30px]" />
                </motion.div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px w-5 bg-orange-500" />
                  <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                    Email sent
                  </span>
                  <div className="h-px w-5 bg-orange-500" />
                </div>

                <h2 className="text-[22px] font-extrabold text-[#111] mb-2">
                  Check your inbox
                </h2>
                <p className="text-[13px] text-[#aaa] leading-relaxed max-w-[280px]">
                  We've sent a password reset link to
                </p>
                <div className="flex items-center gap-2 mt-2 mb-8">
                  <HiOutlineMail className="text-[#ccc] text-[13px]" />
                  <span className="text-[13px] font-semibold text-[#333] truncate max-w-[260px]">
                    {email}
                  </span>
                </div>

                {/* Steps */}
                <div className="w-full space-y-2 mb-8">
                  {[
                    "Open the email from RMGC",
                    "Click the reset link inside",
                    "Create your new password",
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#fafafa] border border-[#f5f5f5] text-left"
                    >
                      <span className="w-5 h-5 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-[9px] font-bold text-orange-500 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-[#888]">{step}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-orange-500 text-white text-[13.5px] font-bold py-3.5 rounded-xl transition-all duration-200"
                >
                  <HiArrowLeft className="text-[14px]" />
                  Back to sign in
                </button>

                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="mt-3 text-[12px] text-[#ccc] hover:text-orange-500 transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <span className="w-1 h-1 rounded-full bg-orange-500" />
          <p className="text-[11px] text-[#ccc] font-medium">
            Secured by RMGC — link expires in 15 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
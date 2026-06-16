"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import newRequest from "../utils/newRequest";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMail, HiOutlineShieldCheck } from "react-icons/hi";
import { IoReloadOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";

export default function OTPVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpExpired, setOtpExpired] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email");
    if (queryEmail) {
      setEmail(queryEmail);
      localStorage.setItem("email", queryEmail);
    } else {
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        toast.error("Email is missing, please restart the verification process.");
        router.push("/register");
      }
    }
    startTimer();
    return () => { if (timerId) clearInterval(timerId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    if (timerId) clearInterval(timerId);
    setTimeLeft(120);
    setOtpExpired(false);
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); setOtpExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Split-input handlers ──
  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const otpValue = otp.join("");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Email is missing."); return; }
    if (otpValue.length < 6) { toast.error("Please enter all 6 digits."); return; }
    setVerifying(true);
    try {
      const response = await newRequest.post("/auth/verify-otp", { email, otp: otpValue });
      toast.success("OTP verified successfully!");
      localStorage.removeItem("email");
      const { role, tier } = response.data || {};
      if (role === "remote_worker" && tier === "vip") router.push("/payment/remote-vip");
      else if (role === "remote_worker" && tier === "free") router.push("/terms-privacy");
      else if (role === "organization") router.push("/login");
      else router.push("/terms-privacy");
    } catch (err: any) {
      toast.error(err.response?.data || "Invalid OTP, please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) { toast.error("Email is missing!"); return; }
    setResending(true);
    try {
      await newRequest.post("/auth/resend-otp", { email: storedEmail });
      toast.success("A new OTP has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      startTimer();
      document.getElementById("otp-0")?.focus();
    } catch (err: any) {
      toast.error(err.response?.data || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const progress = ((120 - timeLeft) / 120) * 100;
  const isLow = timeLeft <= 30 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">

      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Orange corner glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white border border-[#f0f0f0] rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Progress bar top */}
          <div className="h-1 bg-[#f5f5f5] w-full">
            <motion.div
              className={`h-full transition-colors duration-500 ${
                isLow ? "bg-red-400" : otpExpired ? "bg-[#eee]" : "bg-orange-500"
              }`}
              style={{ width: `${otpExpired ? 100 : progress}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          <div className="px-8 py-10">

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <HiOutlineShieldCheck className="text-orange-500 text-[26px]" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px w-5 bg-orange-500" />
                <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                  Verification
                </span>
                <div className="h-px w-5 bg-orange-500" />
              </div>
              <h1 className="text-[24px] font-extrabold text-[#111] mb-2">
                Check your inbox
              </h1>
              <p className="text-[13px] text-[#aaa] leading-relaxed">
                We sent a 6-digit code to
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <HiOutlineMail className="text-[#ccc] text-[14px]" />
                <span className="text-[13px] font-semibold text-[#333] truncate max-w-[260px]">
                  {email}
                </span>
              </div>
            </div>

            {/* OTP input boxes */}
            <form onSubmit={handleVerifyOTP}>
              <div className="flex items-center justify-center gap-2.5 mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`w-11 h-14 text-center text-[20px] font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white text-[#111] ${
                      digit
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-[#f0f0f0] focus:border-orange-300 focus:bg-orange-500/3"
                    }`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center mb-6">
                <AnimatePresence mode="wait">
                  {!otpExpired ? (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg ${
                        isLow
                          ? "bg-red-50 text-red-400 border border-red-100"
                          : "bg-[#f7f7f7] text-[#aaa] border border-[#f0f0f0]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-red-400 animate-pulse" : "bg-orange-500 animate-pulse"}`} />
                      Code expires in {formatTime(timeLeft)}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="expired"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-400 border border-red-100"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Code expired
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Verify button */}
              <button
                type="submit"
                disabled={verifying || otpExpired || otpValue.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-orange-500 disabled:bg-[#f0f0f0] disabled:text-[#ccc] text-white text-[13.5px] font-bold py-3.5 rounded-xl transition-all duration-200"
              >
                {verifying ? (
                  <ClipLoader size={14} color="#fff" />
                ) : (
                  <>
                    <HiOutlineShieldCheck className="text-[16px]" />
                    Verify code
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-[#f5f5f5]" />
              <span className="text-[11px] text-[#ccc]">or</span>
              <div className="h-px flex-1 bg-[#f5f5f5]" />
            </div>

            {/* Resend */}
            <button
              onClick={handleResendOTP}
              disabled={resending || (!otpExpired && timeLeft > 90)}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#888] hover:text-orange-500 border border-[#f0f0f0] hover:border-orange-200 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending ? (
                <ClipLoader size={12} color="#f97316" />
              ) : (
                <>
                  <IoReloadOutline className="text-[14px]" />
                  Resend code
                </>
              )}
            </button>

            {/* Help text */}
            <p className="text-center text-[11.5px] text-[#ccc] mt-5 leading-relaxed">
              Didn't receive it? Check your spam folder.
              <br />
              Wrong email?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-orange-500 font-semibold hover:underline"
              >
                Start over
              </button>
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <span className="w-1 h-1 rounded-full bg-orange-500" />
          <p className="text-[11px] text-[#ccc] font-medium">
            Secured by RMGC — codes expire after 2 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
}
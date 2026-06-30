/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdAlternateEmail } from "react-icons/md";
import { FaFingerprint, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import newRequest from "../utils/newRequest";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "sonner";

import logo from "../../assets/logoo.webp";
import backgroundImage from "../../assets/wallpaper.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("currentUser");
    if (userCookie) {
      localStorage.setItem("currentUser", userCookie);
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await newRequest.post("/auth/login", { username, password });
      const userData = res.data;
      localStorage.setItem("currentUser", JSON.stringify(userData));

      if (userData.role === "organization") {
        router.push(
          userData.vipSubscription?.active
            ? "/organization/dashboard"
            : "/organization/terms-privacy",
        );
      } else if (userData.role === "remote_worker") {
        router.push("/remote/dashboard");
      } else if (userData.isSeller) {
        router.push("/seller");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.error === "account_suspended") {
        toast.error("Account Suspended", {
          description:
            data.reason ||
            "Your account has been suspended. Please contact support.",
          duration: 8000,
          style: {
            background: "#fff7f0",
            border: "1px solid #fed7aa",
            color: "#111",
          },
        });
        setLoading(false);
        return;
      }

      setError(
        data?.error === "Incorrect password"
          ? "Incorrect password. Please try again."
          : data?.error || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex overflow-hidden">
      {/* ── Left panel — background image (desktop only) ── */}
      <div className="hidden lg:block relative w-[55%] shrink-0">
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Corner glow */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="RMGC"
              width={36}
              height={36}
              className="rounded-xl object-cover"
            />
            <div>
              <p className="text-white font-extrabold text-[15px] leading-none tracking-wide">
                <span className="text-orange-500">RM</span>GC
              </p>
              <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
                Platform
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="space-y-4">
            <div className="h-px w-10 bg-orange-500" />
            <h2 className="text-[32px] font-extrabold text-white leading-tight max-w-[340px]">
              Connecting talent,{" "}
              <span className="text-orange-500">globally.</span>
            </h2>
            <p className="text-[13px] text-white/50 max-w-[300px] leading-relaxed">
              Freelancers, organizations, and remote talent — all on one trusted
              platform.
            </p>

            {/* Stats strip */}
            <div className="flex items-center gap-6 pt-4">
              {[
                { value: "350+", label: "Freelancers" },
                { value: "480+", label: "Projects" },
                { value: "6", label: "Countries" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`${i > 0 ? "pl-6 border-l border-white/10" : ""}`}
                >
                  <p className="text-[16px] font-extrabold text-white">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-[11px] text-white/25">
            © {new Date().getFullYear()} Renewed Minds Global Consult
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12 relative">
        {/* Subtle top orange line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500 lg:hidden" />

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <Image
              src={logo}
              alt="RMGC"
              width={32}
              height={32}
              className="rounded-xl object-cover"
            />
            <p className="font-extrabold text-[15px] text-[#111]">
              <span className="text-orange-500">RM</span>GC
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Welcome back
              </span>
            </div>
            <h1 className="text-[28px] font-extrabold text-[#111] leading-tight">
              Sign in to your account
            </h1>
            <p className="text-[13px] text-[#aaa] mt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-orange-500 font-semibold hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-[10px] font-bold tracking-[0.14em] text-[#aaa] uppercase mb-1.5 block">
                Username
              </label>
              <div
                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all duration-200 bg-white ${
                  focusedField === "username"
                    ? "border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                    : "border-[#f0f0f0] hover:border-[#e0e0e0]"
                }`}
              >
                <MdAlternateEmail
                  className={`text-[17px] flex-shrink-0 transition-colors ${
                    focusedField === "username"
                      ? "text-orange-500"
                      : "text-[#ccc]"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="bg-transparent outline-none w-full text-[13.5px] text-[#111] placeholder:text-[#ccc]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-[0.14em] text-[#aaa] uppercase block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-orange-500 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all duration-200 bg-white ${
                  focusedField === "password"
                    ? "border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
                    : "border-[#f0f0f0] hover:border-[#e0e0e0]"
                }`}
              >
                <FaFingerprint
                  className={`text-[17px] flex-shrink-0 transition-colors ${
                    focusedField === "password"
                      ? "text-orange-500"
                      : "text-[#ccc]"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="bg-transparent outline-none w-full text-[13.5px] text-[#111] placeholder:text-[#ccc]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#ccc] hover:text-orange-500 transition-colors flex-shrink-0"
                >
                  {showPassword ? (
                    <FaRegEyeSlash className="text-[15px]" />
                  ) : (
                    <FaRegEye className="text-[15px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-400 text-[12px] font-medium px-4 py-3 rounded-xl"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2.5 bg-[#111] hover:bg-orange-500 disabled:bg-[#f5f5f5] disabled:text-[#ccc] text-white text-[13.5px] font-bold py-3.5 rounded-xl transition-all duration-200 mt-2"
            >
              {loading ? (
                <ClipLoader size={14} color="#fff" />
              ) : (
                <>
                  Sign in
                  <HiArrowRight className="text-[15px]" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[#f5f5f5]" />
            <span className="text-[11px] text-[#ddd]">or</span>
            <div className="h-px flex-1 bg-[#f5f5f5]" />
          </div>

          {/* Register CTA */}
          <Link href="/register">
            <div className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-[#888] hover:text-orange-500 border border-[#f0f0f0] hover:border-orange-200 py-3 rounded-xl transition-all">
              Create a new account →
            </div>
          </Link>

          {/* Footer note */}
          <p className="text-center text-[11px] text-[#ddd] mt-6 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link
              href="/terms-privacy"
              className="text-[#bbb] hover:text-orange-500 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/terms-privacy"
              className="text-[#bbb] hover:text-orange-500 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

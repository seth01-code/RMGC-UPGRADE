"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import newRequest from "../../utils/newRequest";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  LockOpen,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  LockKeyhole,
  Loader2,
} from "lucide-react";

function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, Math.ceil((score * 4) / 5));
}

const strengthConfig = [
  { label: "", color: "" },
  { label: "Weak", color: "#EF4444" },
  { label: "Fair", color: "#F97316" },
  { label: "Good", color: "#EAB308" },
  { label: "Strong", color: "#22C55E" },
];

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = newPassword.length > 0 ? getStrength(newPassword) : 0;
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = passwordsMatch && newPassword.length >= 8;

  useEffect(() => {
    if (!token) toast.error("Invalid or expired password reset link.");
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await newRequest.post("/auth/reset-password", {
        resetToken: token,
        newPassword,
      });
      toast.success(res.data?.message || "Password reset successful!");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Orange header */}
          <div className="bg-orange-600 px-8 pt-8 pb-10 relative">
            {/* Scallop cutout */}
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-white rounded-t-2xl" />

            {/* Lock badge */}
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-5">
              <LockOpen size={22} className="text-white" />
            </div>

            <h1 className="text-2xl font-semibold text-white mb-1.5">
              Reset your password
            </h1>
            <p className="text-sm text-orange-100 leading-relaxed">
              Choose a strong new password to keep your account safe.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8 pt-2">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* New password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Key size={16} />
                      </span>
                      <input
                        type={showNew ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full h-11 pl-10 pr-11 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Strength meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-0.75 rounded-full transition-all duration-300"
                              style={{
                                background:
                                  i <= strength
                                    ? strengthConfig[strength].color
                                    : "#E5E7EB",
                              }}
                            />
                          ))}
                        </div>
                        {strength > 0 && (
                          <p
                            className="text-xs mt-1 font-medium"
                            style={{ color: strengthConfig[strength].color }}
                          >
                            {strengthConfig[strength].label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Key size={16} />
                      </span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full h-11 pl-10 pr-11 border rounded-lg bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          passwordMismatch
                            ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
                            : passwordsMatch
                            ? "border-green-400 focus:ring-green-400/30 focus:border-green-400"
                            : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Match hint */}
                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {passwordsMatch ? (
                          <>
                            <CheckCircle2 size={13} className="text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} className="text-red-400" />
                            <span className="text-xs text-red-500">
                              Passwords do not match
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className={`w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-2 ${
                      canSubmit && !loading
                        ? "bg-orange-600 hover:bg-orange-700 active:scale-[0.985] text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Resetting…
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={16} />
                        Reset password
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-center text-xs text-gray-400">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-orange-600 font-medium hover:underline inline-flex items-center gap-0.5"
                      >
                        Back to login
                        <ArrowRight size={12} />
                      </button>
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={30} className="text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
                    Password reset!
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    You&apos;re all set. Redirecting you to login…
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="mt-5 w-full h-11 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    Go to login <ArrowRight size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Having trouble?{" "}
          <a
            href="mailto:support@renewedmindsglobalconsult.com"
            className="text-orange-600 hover:underline"
          >
            Contact support
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
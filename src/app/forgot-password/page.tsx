"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import newRequest from "../utils/newRequest";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await newRequest.post("/auth/forgot-password", {
        email,
      });
      toast.success(response.data.message || "Reset link sent!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-100"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow-md transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-orange-600 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

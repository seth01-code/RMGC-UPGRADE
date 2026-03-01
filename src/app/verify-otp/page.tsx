"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import newRequest from "../utils/newRequest";
import { toast } from "react-toastify";

export default function OTPVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [otpExpired, setOtpExpired] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [email, setEmail] = useState<string>("");

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
        toast.error(
          "Email is missing, please restart the verification process."
        );
        router.push("/register");
      }
    }

    startTimer();

    return () => {
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    if (timerId) clearInterval(timerId);

    setTimeLeft(120);
    setOtpExpired(false);

    const newTimerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          setOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerId(newTimerId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please restart the process.");
      return;
    }

    try {
      const response = await newRequest.post("/auth/verify-otp", {
        email,
        otp,
      });

      toast.success("OTP verified successfully!");
      localStorage.removeItem("email");

      const userRole = response.data?.role;
      const userTier = response.data?.tier;

      if (userRole === "remote_worker" && userTier === "vip") {
        router.push("/payment/remote-vip");
      } else if (userRole === "remote_worker" && userTier === "free") {
        router.push("/terms-privacy");
      } else if (userRole === "organization") {
        router.push("/login");
      } else {
        router.push("/terms-privacy");
      }
    } catch (err: any) {
      toast.error(err.response?.data || "Invalid OTP, please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const storedEmail = localStorage.getItem("email");

      if (!storedEmail) {
        toast.error(
          "Email is missing! Please restart the verification process."
        );
        return;
      }

      const response = await newRequest.post("/auth/resend-otp", {
        email: storedEmail,
      });

      if (response.status === 200) {
        toast.success("A new OTP has been sent to your email.");
        startTimer();
      }
    } catch (err: any) {
      console.error("Error resending OTP:", err);
      toast.error(
        err.response?.data || "Failed to resend OTP. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-800 shadow-2xl shadow-black rounded-xl p-8 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center text-green-400 tracking-wide">
          Verify Your Account
        </h2>

        <p className="text-gray-300 text-center">
          Enter the OTP sent to{" "}
          <strong className="text-white">{email}</strong>
        </p>

        <div
          className={`flex justify-center text-lg font-semibold ${
            timeLeft <= 30 ? "text-red-400" : "text-gray-400"
          }`}
        >
          OTP expires in: <span className="ml-2">{formatTime(timeLeft)}</span>
        </div>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="p-4 border border-gray-600 bg-gray-700 rounded-lg text-center text-xl tracking-widest text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          maxLength={6}
        />

        <button
          type="submit"
          onClick={handleVerifyOTP}
          className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
        >
          Verify OTP
        </button>

        {otpExpired && (
          <div className="text-center mt-4">
            <span className="text-gray-400">Your OTP has expired.</span>
            <button
              onClick={handleResendOTP}
              className="text-green-400 hover:underline font-semibold ml-2"
            >
              Resend OTP
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Didn't receive the OTP? Check your spam folder or click resend.
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdAlternateEmail } from "react-icons/md";
import { FaFingerprint, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import newRequest from "../utils/newRequest";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";

import logo from "../../assets/logoo.webp";
import backgroundImage from "../../assets/wallpaper.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get("currentUser");
    if (userCookie) {
      localStorage.setItem("currentUser", userCookie);
      router.push("/");
    }
  }, [router]);

  const togglePasswordView = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await newRequest.post("/auth/login", { username, password });
      const userData = res.data;

      localStorage.setItem("currentUser", JSON.stringify(userData));

      // ✅ Conditional redirect
      if (userData.role === "organization") {
        if (!userData.vipSubscription?.active) {
          router.push("/organization/terms-privacy");
        } else {
          router.push("/organization/dashboard");
        }
      } else if (userData.role === "remote_worker") {
        if (!userData.vipSubscription?.active) {
          router.push("/remote/terms-privacy");
        } else {
          router.push("/remote/dashboard");
        }
      } else {
        router.push("/");
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.data.error === "Incorrect password") {
          setError("Incorrect password. Please try again.");
        } else {
          setError(err.response.data.error || "Something went wrong.");
        }
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Login Card */}
      <div className="relative w-[90%] max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20 flex flex-col items-center gap-6">
        <Image
          src={logo}
          alt="logo"
          width={64}
          height={64}
          className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-md"
        />

        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-sm text-gray-300">
          No account?{" "}
          <Link href="/register" className="text-orange-400 hover:underline">
            Sign Up
          </Link>
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 text-sm"
        >
          {/* Username */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 focus-within:ring-2 focus-within:ring-orange-400">
            <MdAlternateEmail className="text-orange-400 text-lg" />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent outline-none w-full text-white placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3 relative focus-within:ring-2 focus-within:ring-orange-400">
            <FaFingerprint className="text-orange-400 text-lg" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="bg-transparent outline-none w-full text-white placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <FaRegEyeSlash
                className="absolute right-4 cursor-pointer text-gray-300 hover:text-orange-400"
                onClick={togglePasswordView}
              />
            ) : (
              <FaRegEye
                className="absolute right-4 cursor-pointer text-gray-300 hover:text-orange-400"
                onClick={togglePasswordView}
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-xs text-center font-medium">
              {error}
            </p>
          )}

          {/* Forgot Password */}
          <div className="flex justify-between items-center text-xs text-gray-300">
            <span>Forgot your password?</span>
            <Link
              href="/forgot-password"
              className="text-orange-400 hover:underline"
            >
              Reset Here
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 transition rounded-xl text-white font-semibold shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

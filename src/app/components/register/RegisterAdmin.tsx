"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";

export default function RegisterAdmin() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    img: "",
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdmin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!admin.email.endsWith("@renewedmindsglobalconsult.com")) {
      toast.error("Only company emails can register as Admin");
      setLoading(false);
      return;
    }

    let imageUrl = admin.img;

    if (file) {
      try {
        const uploaded = await upload(file);
        imageUrl = uploaded?.url || "";
      } catch {
        toast.error("Error uploading image");
        setLoading(false);
        return;
      }
    }

    const payload = { ...admin, img: imageUrl || "", isAdmin: true };

    try {
      await newRequest.post("/auth/register", payload);
      toast.success("OTP sent! Please check your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(admin.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-8 md:py-12 font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-orange-200 overflow-hidden"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Register as <span className="text-orange-500">Admin</span>
        </h1>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-orange-300 shadow-md bg-orange-50 flex items-center justify-center">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload className="w-8 sm:w-10 h-8 sm:h-10 text-orange-400" />
              )}
            </div>
            <label
              htmlFor="fileUploadWorker"
              className="absolute -bottom-2 right-1 sm:right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full cursor-pointer shadow-md transition"
            >
              Upload
            </label>
            <input
              id="fileUploadWorker"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              value={admin.username}
              onChange={handleChange}
              className="mt-1 p-3 border rounded-xl w-full text-black placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="admin@renewedmindsglobalconsult.com"
              value={admin.email}
              onChange={handleChange}
              className="mt-1 p-3 border rounded-xl w-full text-black placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Password
            </label>
            <div className="relative mt-1">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={admin.password}
                onChange={handleChange}
                className="p-3 border rounded-xl w-full text-black pr-12 placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              placeholder="+234..."
              value={admin.phone}
              onChange={handleChange}
              className="mt-1 p-3 border rounded-xl w-full text-black placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Country
            </label>
            <input
              name="country"
              type="text"
              placeholder="Nigeria"
              value={admin.country}
              onChange={handleChange}
              className="mt-1 p-3 border rounded-xl w-full text-black placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold tracking-wide transition-transform transform hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register as Admin"}
        </button>
      </form>
    </div>
  );
}

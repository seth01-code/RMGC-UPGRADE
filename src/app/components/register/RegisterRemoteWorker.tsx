"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";

function RegisterRemoteWorker() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [worker, setWorker] = useState<any>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    state: "",
    address: "",
    dob: "",
    yearsOfExperience: "",
    portfolioLink: "",
    languages: "",
    services: "",
    desc: "",
    socialLinks: { linkedin: "", twitter: "", facebook: "" },
    tier: "free",
  });

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setWorker((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: any) => {
    const { name, value } = e.target;
    setWorker((prev: any) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleFileChange = (e: any) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleTierChange = (tier: "free" | "vip") => {
    setWorker((prev: any) => ({ ...prev, tier }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let imgUrl = "";
    if (file) {
      try {
        const uploaded = await upload(file);
        imgUrl = uploaded?.url || "";
      } catch {
        toast.error("Failed to upload profile image.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      username: worker.username,
      fullName: worker.fullName,
      email: worker.email,
      password: worker.password,
      phone: worker.phone,
      country: worker.country,
      stateOfResidence: worker.state,
      address: worker.address,
      dob: worker.dob,
      yearsOfExperience: worker.yearsOfExperience,
      portfolioLink: worker.portfolioLink ? [worker.portfolioLink] : [],
      languages: worker.languages
        ? worker.languages.split(",").map((s: string) => s.trim())
        : [],
      services: worker.services
        ? worker.services.split(",").map((s: string) => s.trim())
        : [],
      desc: worker.desc,
      socialLinks: worker.socialLinks,
      role: "remote_worker",
      tier: worker.tier === "vip" ? "vip" : "free",
      img: imgUrl,
    };

    try {
      // Always go to OTP verification first
      await newRequest.post("/auth/register", payload);
      toast.success("OTP sent! Please verify your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(worker.email)}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 px-4 sm:px-6 md:px-10 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-orange-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-1">
            Register Remote Worker <span className="text-orange-500">RMGC</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Create a remote worker profile and choose your tier.
          </p>
        </div>

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

        {/* Tier Selection */}
        <div className="mb-10">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            Choose a Tier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free */}
            <div
              onClick={() => handleTierChange("free")}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                worker.tier === "free"
                  ? "border-orange-400 shadow-lg bg-orange-50/40"
                  : "border-gray-200 bg-white shadow-sm"
              } hover:shadow-md active:scale-[0.98]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Free</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Access to basic jobs.
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  Free
                </span>
              </div>
              <ul className="mt-3 text-xs text-gray-500 space-y-1">
                <li>• Entry-level jobs only</li>
                <li>• Basic visibility</li>
                <li>• No subscription</li>
              </ul>
            </div>

            {/* VIP */}
            <div
              onClick={() => handleTierChange("vip")}
              className={`cursor-pointer p-4 rounded-xl border transition-all ${
                worker.tier === "vip"
                  ? "border-orange-400 shadow-lg bg-orange-50/40"
                  : "border-gray-200 bg-white shadow-sm"
              } hover:shadow-md active:scale-[0.98]`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">VIP</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Access all job categories.
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-medium text-orange-600">
                  Paid
                </span>
              </div>
              <ul className="mt-3 text-xs text-gray-500 space-y-1">
                <li>• Access to high-paying jobs</li>
                <li>• Priority visibility</li>
                <li>• Subscription required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <section className="space-y-10">
          {/* Personal */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Username"
                name="username"
                placeholder="dev_sam"
                onChange={handleChange}
              />
              <InputField
                label="Full Name"
                name="fullName"
                placeholder="John Doe"
                onChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                placeholder="email@example.com"
                onChange={handleChange}
              />

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full pr-10 text-sm sm:text-base focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <InputField
                label="Phone"
                name="phone"
                placeholder="+234 812..."
                onChange={handleChange}
              />
              <InputField
                label="Country"
                name="country"
                placeholder="Nigeria"
                onChange={handleChange}
              />
              <InputField
                label="State"
                name="state"
                placeholder="Lagos"
                onChange={handleChange}
              />
              <InputField
                label="Address"
                name="address"
                placeholder="Street, City"
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                onChange={handleChange}
              />
              <InputField
                label="Years of Experience"
                name="yearsOfExperience"
                placeholder="2"
                onChange={handleChange}
              />
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                Short Bio
              </label>
              <textarea
                name="desc"
                placeholder="Tell us about your experience..."
                onChange={handleChange}
                className="mt-1 p-3 border rounded-lg w-full h-24 sm:h-28 text-sm sm:text-base focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Skills & Links */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Work & Links
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Portfolio Link"
                name="portfolioLink"
                placeholder="https://..."
                onChange={handleChange}
              />
              <InputField
                label="Languages (comma separated)"
                name="languages"
                placeholder="English, Yoruba"
                onChange={handleChange}
              />
              <InputField
                label="Services (comma separated)"
                name="services"
                placeholder="UI/UX, Web Dev"
                onChange={handleChange}
              />
              <InputField
                label="LinkedIn"
                name="linkedin"
                placeholder="LinkedIn URL"
                onChange={handleSocialChange}
              />
              <InputField
                label="Twitter"
                name="twitter"
                placeholder="@handle"
                onChange={handleSocialChange}
              />
              <InputField
                label="Facebook"
                name="facebook"
                placeholder="Facebook profile"
                onChange={handleSocialChange}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-10 w-full py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 text-sm sm:text-base"
        >
          {loading
            ? "Processing..."
            : worker.tier === "vip"
            ? "Register (VIP)"
            : "Register (Free)"}
        </button>
      </form>
    </div>
  );
}

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  onChange,
}: any) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className="mt-1 p-3 border rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-orange-400"
    />
  </div>
);

export default RegisterRemoteWorker;

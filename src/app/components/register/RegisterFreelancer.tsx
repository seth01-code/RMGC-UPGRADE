"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";

function RegisterFreelancer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState<any>({
    username: "",
    fullName: "",
    dob: "",
    address: "",
    phone: "",
    country: "",
    email: "",
    password: "",
    profilePicture: "",
    yearsOfExperience: "",
    stateOfResidence: "",
    countryOfResidence: "",
    isSeller: true,
    desc: "",
    nextOfKin: {
      fullName: "",
      phone: "",
    },
  });

  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));

    // Age check for 18+
    if (name === "dob") {
      const birthDate = new Date(value);

      if (isNaN(birthDate.getTime())) return; // Guard against invalid dates

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      // Check if birthday has occurred this year
      const hasBirthdayPassedThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());

      if (!hasBirthdayPassedThisYear) {
        age--;
      }

      if (age < 18) {
        toast.error("You must be at least 18 years old to register.");
        setUser((prev) => ({ ...prev, dob: "" })); // Clear invalid DOB
      }
    }
  };

  const handleNextOfKinChange = (e: any) => {
    setUser((prev: any) => ({
      ...prev,
      nextOfKin: { ...prev.nextOfKin, [e.target.name]: e.target.value },
    }));
  };

  const handleLanguagesInput = (e: any) => {
    const values = e.target.value
      .split(",")
      .map((lang: string) => lang.trim())
      .filter(Boolean);
    setLanguages(values);
  };

  const handleServicesInput = (e: any) => {
    const values = e.target.value
      .split(",")
      .map((service: string) => service.trim())
      .filter(Boolean);
    setServices(values);
  };

  const handleFileChange = (e: any) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = user.profilePicture;

    if (file) {
      try {
        const uploadedImage = await upload(file);
        imageUrl = uploadedImage?.url || "";
      } catch {
        toast.error("Error uploading image. Please try again.");
        setLoading(false);
        return;
      }
    }

    const userData = {
      ...user,
      img: imageUrl,
      languages,
      services,
    };

    try {
      // Store registration data temporarily via backend
      await newRequest.post("/auth/register", userData);

      toast.success("OTP sent! Please check your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(user.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 md:p-12 border border-orange-100 relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Register as Freelancer <span className="text-orange-500">RMGC</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Join the community of skilled freelancers and showcase your talent.
          </p>
        </div>

        {/* Profile Upload */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-32 h-32">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-300 shadow-lg bg-orange-50 flex items-center justify-center">
              {preview ? (
                <Image
                  src={preview}
                  alt="Profile Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload className="w-10 h-10 text-orange-400" />
              )}
            </div>
            <label
              htmlFor="fileUpload"
              className="absolute -bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-md transition"
            >
              Upload
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Upload a clear profile picture
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-10">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                onChange={handleChange}
              />
              <InputField
                label="Username"
                name="username"
                onChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
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
                    placeholder="Enter password"
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full pr-12 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                onChange={handleChange}
              />
              <InputField label="Phone" name="phone" onChange={handleChange} />
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Country"
                name="country"
                onChange={handleChange}
              />
              <InputField
                label="State of Residence"
                name="stateOfResidence"
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  name="address"
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TagInput
                label="Languages"
                tags={languages}
                onChange={handleLanguagesInput}
                color="orange"
              />
              <TagInput
                label="Services"
                tags={services}
                onChange={handleServicesInput}
                color="green"
              />
            </div>
          </section>

          {/* Experience & Bio */}
          <section>
            <InputField
              label="Years of Experience"
              name="yearsOfExperience"
              onChange={handleChange}
            />
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="desc"
                placeholder="Write a short bio about yourself"
                onChange={handleChange}
                className="mt-1 p-3 border rounded-lg w-full h-28 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
          </section>

          {/* Next of Kin */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Next of Kin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="fullName"
                onChange={handleNextOfKinChange}
              />
              <InputField
                label="Phone"
                name="phone"
                onChange={handleNextOfKinChange}
              />
            </div>
          </section>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-10 w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register & Login"}
        </button>
      </form>
    </div>
  );
}

/* Reusable Components */
const InputField = ({ label, name, type = "text", onChange }: any) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      name={name}
      type={type}
      onChange={onChange}
      className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all"
    />
  </div>
);

const TagInput = ({ label, tags, onChange, color }: any) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      placeholder="Type and separate with commas"
      onChange={onChange}
      className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
    />
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag: string, i: number) => (
        <span
          key={i}
          className={`bg-${color}-100 text-${color}-700 px-3 py-1 rounded-lg text-sm`}
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default RegisterFreelancer;

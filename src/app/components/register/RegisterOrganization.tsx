"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";

function RegisterOrganization() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [org, setOrg] = useState<any>({
    username: "",
    email: "",
    password: "",
    description: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    logo: "",
    address: "",
    state: "",
    country: "",
    industry: "",
    companySize: "",
    socialLinks: { linkedin: "", twitter: "", facebook: "" },
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setOrg((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: any) => {
    const { name, value } = e.target;
    setOrg((prev: any) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
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

    try {
      const today = new Date();
      const yyyy = today.getFullYear().toString();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const datePart = `${yyyy}${mm}${dd}`;

      // Generate random 2-digit number 01–99
      const randomPart = String(Math.floor(Math.random() * 99) + 1).padStart(
        2,
        "0"
      );

      const regNumber = `${datePart}${randomPart}`; // e.g. 2025112701

      // 2️⃣ Upload logo if exists
      let logoUrl = org.logo;
      if (file) {
        try {
          const uploadedLogo = await upload(file);
          logoUrl = uploadedLogo?.url || "";
        } catch {
          toast.error("Error uploading logo. Please try again.");
          setLoading(false);
          return;
        }
      }

      // 3️⃣ Prepare organization data
      const orgData = {
        username: org.username,
        email: org.email,
        password: org.password,
        role: "organization",
        img: logoUrl,
        organizationName: org.username,
        organizationRegNumber: regNumber,
        organizationWebsite: org.website,
        organizationDescription: org.description,
        organizationContactEmail: org.contactEmail || org.email,
        organizationContactPhone: org.contactPhone,
        organizationState: org.state,
        organizationCountry: org.country,
        organizationIndustry: org.industry,
        organizationCompanySize: org.companySize,
        organizationSocialLinks: org.socialLinks,
        address: org.address,
        country: org.country,
      };

      // 4️⃣ Send registration request
      await newRequest.post("/auth/register", orgData);
      toast.success("OTP sent! Verify your organization email.");
      router.push(`/verify-otp?email=${org.email}`);
    } catch (err: any) {
      toast.error(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 px-4 sm:px-6 md:px-10 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-orange-100 relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
            Register Organization <span className="text-orange-500">RMGC</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Join RMGC to post jobs and hire top global talent.
          </p>
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-orange-300 shadow-lg bg-orange-50 flex items-center justify-center">
              {preview ? (
                <Image
                  src={preview}
                  alt="Logo Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload className="w-8 sm:w-10 h-8 sm:h-10 text-orange-400" />
              )}
            </div>
            <label
              htmlFor="fileUpload"
              className="absolute -bottom-2 right-1 sm:right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full cursor-pointer shadow-md transition"
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
          <p className="text-gray-500 text-xs sm:text-sm mt-2">
            Upload your company logo
          </p>
        </div>

        {/* Basic Info */}
        <section className="space-y-8 sm:space-y-10">
          {/* Organization Details */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Organization Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Organization Name"
                name="username"
                placeholder="e.g. RMGC Ltd."
                onChange={handleChange}
              />
              <InputField
                label="Official Email"
                name="email"
                placeholder="company@example.com"
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
                    className="p-3 border rounded-lg w-full pr-10 focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm sm:text-base"
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
                label="Contact Email"
                name="contactEmail"
                placeholder="HR or Support Email"
                onChange={handleChange}
              />
              <InputField
                label="Contact Phone"
                name="contactPhone"
                placeholder="+234 812 345 6789"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <InputField
                label="Website"
                name="website"
                placeholder="https://yourcompany.com"
                onChange={handleChange}
              />
              <InputField
                label="Industry"
                name="industry"
                placeholder="Technology, Finance, etc."
                onChange={handleChange}
              />
              <InputField
                label="Company Size"
                name="companySize"
                placeholder="e.g. 1-10, 50-100"
                onChange={handleChange}
              />
              <InputField
                label="State"
                name="state"
                placeholder="Lagos"
                onChange={handleChange}
              />
              <InputField
                label="Country"
                name="country"
                placeholder="Nigeria"
                onChange={handleChange}
              />
              <InputField
                label="Address"
                name="address"
                placeholder="123 RMGC Street"
                onChange={handleChange}
              />
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Write about your organization"
                onChange={handleChange}
                className="mt-1 p-3 border rounded-lg w-full h-24 sm:h-28 text-sm sm:text-base focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              Social Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <InputField
                label="LinkedIn"
                name="linkedin"
                placeholder="LinkedIn profile"
                onChange={handleSocialChange}
              />
              <InputField
                label="Twitter"
                name="twitter"
                placeholder="Twitter handle"
                onChange={handleSocialChange}
              />
              <InputField
                label="Facebook"
                name="facebook"
                placeholder="Facebook page"
                onChange={handleSocialChange}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 sm:mt-10 w-full py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? "Registering..." : "Register Organization"}
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
      className="mt-1 p-3 border rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all"
    />
  </div>
);

export default RegisterOrganization;

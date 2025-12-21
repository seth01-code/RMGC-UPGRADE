"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Loader2,
  Upload,
  AlertCircle,
  XCircle,
} from "lucide-react";
import newRequest from "../../utils/newRequest";
import uploadToCloudinary from "../../utils/upload";
import { motion, AnimatePresence } from "framer-motion";
import OrganizationFooter from "../dashboard/components/footer";
import Topbar from "../dashboard/components/Topbar";

/* ---------------- Reusable Labeled Input ---------------- */
function LabeledInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 relative">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border p-3 rounded-xl focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-orange-500"
        }`}
      />

      {error && (
        <AlertCircle className="absolute right-3 top-9 w-4 h-4 text-red-500" />
      )}
    </div>
  );
}

export default function OrganizationSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [org, setOrg] = useState({
    name: "",
    website: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    state: "",
    country: "",
    industry: "",
    companySize: "",
    linkedin: "",
    twitter: "",
    facebook: "",
  });

  const [errors, setErrors] = useState({
    linkedin: false,
    twitter: false,
    facebook: false,
  });

  /* ---------------- Fetch Profile ---------------- */
  useEffect(() => {
    newRequest
      .get("/users/profile")
      .then((res) => {
        const u = res.data;
        setUser(u);
        setLogoPreview(u?.organization?.logo || null);

        setOrg({
          name: u.organization?.name || "",
          website: u.organization?.website || "",
          description: u.organization?.description || "",
          contactEmail: u.organization?.contactEmail || "",
          contactPhone: u.organization?.contactPhone || "",
          address: u.organization?.address || "",
          state: u.organization?.state || "",
          country: u.organization?.country || "",
          industry: u.organization?.industry || "",
          companySize: u.organization?.companySize || "",
          linkedin: u.organization?.socialLinks?.linkedin || "",
          twitter: u.organization?.socialLinks?.twitter || "",
          facebook: u.organization?.socialLinks?.facebook || "",
        });
      })
      .catch(() => setErrorMsg("Failed to load user profile."));
  }, []);

  /* ---------------- Helpers ---------------- */
  const normalize = (platform: string, value: string) => {
    if (!value) return "";
    const base: Record<string, string> = {
      linkedin: "https://www.linkedin.com/in/",
      twitter: "https://twitter.com/",
      facebook: "https://facebook.com/",
    };
    if (value.startsWith("http")) return value;
    return base[platform] + value.replace("@", "");
  };

  const validUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (["linkedin", "twitter", "facebook"].includes(name)) {
      const fixed = normalize(name, value);
      setErrors((prev) => ({ ...prev, [name]: !validUrl(fixed) }));
    }

    setOrg({ ...org, [name]: value });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  /* ---------------- Save ---------------- */
  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");

    let uploadedLogoUrl: string | null = null;

    if (selectedFile) {
      const uploaded = await uploadToCloudinary(selectedFile);
      if (uploaded) uploadedLogoUrl = uploaded.url;
    }

    const fixedLinks = {
      linkedin: normalize("linkedin", org.linkedin),
      twitter: normalize("twitter", org.twitter),
      facebook: normalize("facebook", org.facebook),
    };

    try {
      await newRequest.patch("/users/profile", {
        organization: {
          ...org,
          socialLinks: fixedLinks,
          ...(uploadedLogoUrl ? { logo: uploadedLogoUrl } : {}),
        },
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("currentUser");
          window.location.href = "/login";
        }}
      />

      {/* Toasts */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Changes saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          Organization Settings
        </h1>

        {/* Logo */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Organization Logo</h2>

          <div className="flex items-center gap-6">
            {logoPreview && (
              <Image
                src={logoPreview}
                width={120}
                height={120}
                alt="Organization Logo"
                className="rounded-xl object-cover"
              />
            )}

            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-3 bg-orange-600 text-white rounded-xl flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload New Logo
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleLogo}
              className="hidden"
            />
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <h2 className="font-semibold">Organization Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <LabeledInput label="Organization Name" name="name" value={org.name} onChange={handleChange} />
            <LabeledInput label="Website" name="website" value={org.website} onChange={handleChange} />
            <LabeledInput label="Industry" name="industry" value={org.industry} onChange={handleChange} />
            <LabeledInput label="Company Size" name="companySize" value={org.companySize} onChange={handleChange} />
            <LabeledInput label="Contact Email" name="contactEmail" value={org.contactEmail} onChange={handleChange} type="email" />
            <LabeledInput label="Contact Phone" name="contactPhone" value={org.contactPhone} onChange={handleChange} />
            <LabeledInput label="Address" name="address" value={org.address} onChange={handleChange} />
            <LabeledInput label="State" name="state" value={org.state} onChange={handleChange} />
            <LabeledInput label="Country" name="country" value={org.country} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Organization Description
            </label>
            <textarea
              name="description"
              value={org.description}
              onChange={handleChange}
              className="border p-3 rounded-xl h-32 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <h2 className="font-semibold">Social Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <LabeledInput label="LinkedIn" name="linkedin" value={org.linkedin} onChange={handleChange} error={errors.linkedin} />
            <LabeledInput label="Twitter" name="twitter" value={org.twitter} onChange={handleChange} error={errors.twitter} />
            <LabeledInput label="Facebook" name="facebook" value={org.facebook} onChange={handleChange} error={errors.facebook} />
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-xl flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <OrganizationFooter />
    </>
  );
}

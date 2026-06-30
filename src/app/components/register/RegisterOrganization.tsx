"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

// ── Shared primitives ─────────────────────────────────────────────────────────

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="block text-[11px] font-bold tracking-[0.12em] text-[#888] uppercase">
      {children}
    </label>
    {hint && <span className="text-[10.5px] text-[#ccc]">{hint}</span>}
  </div>
);

const SectionHead = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px w-3 bg-orange-500 shrink-0" />
    <p className="text-[10.5px] font-bold tracking-[0.18em] text-orange-500 uppercase whitespace-nowrap">
      {children}
    </p>
    <div className="flex-1 h-px bg-[#f0f0f0]" />
  </div>
);

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e8e8e8] rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all";

const textareaCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e8e8e8] rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none min-h-[90px]";

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterOrganization() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [org, setOrg] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setOrg((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setOrg((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [e.target.name]: e.target.value },
    }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date();
      const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      const regNumber = `${datePart}${String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")}`;

      let logoUrl = org.logo;
      if (file) {
        try {
          const uploaded = await upload(file);
          logoUrl = uploaded?.url || "";
        } catch {
          toast.error("Logo upload failed."); setLoading(false); return;
        }
      }

      await newRequest.post("/auth/register", {
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
      });

      toast.success("OTP sent — verify your organization email.");
      router.push(`/verify-otp?email=${org.email}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Logo upload ── */}
      <div className="flex items-center gap-4">
        <label htmlFor="orgLogo" className="cursor-pointer group relative shrink-0">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#e0e0e0] group-hover:border-orange-400 bg-[#fafafa] overflow-hidden flex items-center justify-center transition-all relative">
            {preview ? (
              <Image src={preview} alt="Logo" fill className="object-cover rounded-2xl" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-[#ccc] group-hover:text-orange-400 transition-colors">
                <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v6M1.5 4.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <input id="orgLogo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        <div>
          <p className="text-[13px] font-bold text-[#111]">Company logo</p>
          <p className="text-[11.5px] text-[#bbb] mt-0.5">JPG or PNG · recommended 400×400</p>
        </div>
      </div>

      {/* ── Account credentials ── */}
      <div>
        <SectionHead>Account credentials</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Organization name</Label>
            <input name="username" type="text" placeholder="e.g. Acme Nigeria Ltd." value={org.username} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Official email</Label>
            <input name="email" type="email" placeholder="company@example.com" value={org.email} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label hint="Min. 8 characters">Password</Label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={org.password} onChange={handleChange} className={`${inputCls} pr-10`} required />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-3 flex items-center text-[#bbb] hover:text-[#666] transition">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Company info ── */}
      <div>
        <SectionHead>Company information</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Contact email</Label>
            <input name="contactEmail" type="email" placeholder="hr@company.com" value={org.contactEmail} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Contact phone</Label>
            <input name="contactPhone" type="text" placeholder="+234 812 345 6789" value={org.contactPhone} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Website</Label>
            <input name="website" type="text" placeholder="https://company.com" value={org.website} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Industry</Label>
            <input name="industry" type="text" placeholder="e.g. Technology, Finance" value={org.industry} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Company size</Label>
            <input name="companySize" type="text" placeholder="e.g. 10–50" value={org.companySize} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>State</Label>
            <input name="state" type="text" placeholder="Lagos" value={org.state} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Country</Label>
            <input name="country" type="text" placeholder="Nigeria" value={org.country} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Address</Label>
            <input name="address" type="text" placeholder="123 Victoria Island" value={org.address} onChange={handleChange} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <Label hint="Max 400 chars">About the organization</Label>
            <textarea name="description" placeholder="Describe what your organization does, its mission, and what kind of talent you're looking for…" value={org.description} onChange={handleChange} className={textareaCls} maxLength={400} />
          </div>
        </div>
      </div>

      {/* ── Social links ── */}
      <div>
        <SectionHead>Social presence</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "linkedin", placeholder: "linkedin.com/company/…" },
            { name: "twitter", placeholder: "@yourhandle" },
            { name: "facebook", placeholder: "facebook.com/…" },
          ].map(({ name, placeholder }) => (
            <div key={name}>
              <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
              <input
                name={name}
                type="text"
                placeholder={placeholder}
                value={org.socialLinks[name as keyof typeof org.socialLinks]}
                onChange={handleSocialChange}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#0A0A0A] hover:bg-orange-500 text-white text-[13.5px] font-black tracking-wide rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering organization…</>
        ) : "Register organization →"}
      </button>
    </form>
  );
}
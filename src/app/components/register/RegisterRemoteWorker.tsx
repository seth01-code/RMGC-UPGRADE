"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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

// ── Tier config ───────────────────────────────────────────────────────────────

const tiers = [
  {
    key: "free" as const,
    label: "Free",
    badge: "Free forever",
    badgeCls: "text-green-600 bg-green-50 border-green-100",
    features: ["Entry-level job listings", "Basic profile visibility", "No subscription needed"],
  },
  {
    key: "vip" as const,
    label: "VIP",
    badge: "Subscription",
    badgeCls: "text-orange-600 bg-orange-50 border-orange-100",
    features: ["All job categories unlocked", "Priority profile placement", "Access to high-paying roles"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterRemoteWorker() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [langInput, setLangInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const [worker, setWorker] = useState({
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
    desc: "",
    socialLinks: { linkedin: "", twitter: "", facebook: "" },
    tier: "free" as "free" | "vip",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setWorker((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setWorker((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [e.target.name]: e.target.value },
    }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
  };

  const addTag = (
    input: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) => {
    const t = input.trim();
    if (t && !list.includes(t)) setList([...list, t]);
    setInput("");
  };

  const removeTag = (tag: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imgUrl = "";
    if (file) {
      try {
        const uploaded = await upload(file);
        imgUrl = uploaded?.url || "";
      } catch {
        toast.error("Image upload failed."); setLoading(false); return;
      }
    }
    try {
      await newRequest.post("/auth/register", {
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
        languages,
        services,
        desc: worker.desc,
        socialLinks: worker.socialLinks,
        role: "remote_worker",
        tier: worker.tier,
        img: imgUrl,
      });
      toast.success("OTP sent — verify your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(worker.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Avatar ── */}
      <div className="flex items-center gap-4">
        <label htmlFor="workerAvatar" className="cursor-pointer group relative shrink-0">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#e0e0e0] group-hover:border-orange-400 bg-[#fafafa] overflow-hidden flex items-center justify-center transition-all relative">
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover rounded-2xl" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-[#ccc] group-hover:text-orange-400 transition-colors">
                <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v6M1.5 4.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <input id="workerAvatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        <div>
          <p className="text-[13px] font-bold text-[#111]">Profile photo</p>
          <p className="text-[11.5px] text-[#bbb] mt-0.5">JPG or PNG · optional</p>
        </div>
      </div>

      {/* ── Tier selection ── */}
      <div>
        <SectionHead>Choose your tier</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tiers.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setWorker((prev) => ({ ...prev, tier: t.key }))}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                worker.tier === t.key
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-[#ebebeb] bg-white hover:border-orange-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    worker.tier === t.key ? "border-orange-500" : "border-[#ddd]"
                  }`}>
                    {worker.tier === t.key && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                  </div>
                  <p className="text-[13.5px] font-black text-[#111]">{t.label}</p>
                </div>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${t.badgeCls}`}>
                  {t.badge}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 pl-6">
                {t.features.map((f) => (
                  <p key={f} className="text-[11.5px] text-[#777] flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">✓</span> {f}
                  </p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Personal info ── */}
      <div>
        <SectionHead>Personal information</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Username</Label>
            <input name="username" type="text" placeholder="e.g. dev_sam" value={worker.username} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Full name</Label>
            <input name="fullName" type="text" placeholder="e.g. Samuel Bello" value={worker.fullName} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Email</Label>
            <input name="email" type="email" placeholder="you@example.com" value={worker.email} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label hint="Min. 8 characters">Password</Label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={worker.password} onChange={handleChange} className={`${inputCls} pr-10`} required />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-3 flex items-center text-[#bbb] hover:text-[#666] transition">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <input name="phone" type="text" placeholder="+234 812…" value={worker.phone} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label hint="Must be 18+">Date of birth</Label>
            <input name="dob" type="date" value={worker.dob} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Country</Label>
            <input name="country" type="text" placeholder="Nigeria" value={worker.country} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>State</Label>
            <input name="state" type="text" placeholder="Lagos" value={worker.state} onChange={handleChange} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <input name="address" type="text" placeholder="Street, City" value={worker.address} onChange={handleChange} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Work & skills ── */}
      <div>
        <SectionHead>Work & skills</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Years of experience</Label>
            <input name="yearsOfExperience" type="number" min="0" placeholder="e.g. 4" value={worker.yearsOfExperience} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>Portfolio link</Label>
            <input name="portfolioLink" type="text" placeholder="https://yourportfolio.com" value={worker.portfolioLink} onChange={handleChange} className={inputCls} />
          </div>

          {/* Languages tag input */}
          <div>
            <Label hint="Press Enter to add">Languages</Label>
            <input
              type="text"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(langInput, languages, setLanguages, setLangInput); }
              }}
              placeholder="e.g. English"
              className={inputCls}
            />
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {languages.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-[11.5px] font-semibold bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t, languages, setLanguages)} className="text-orange-400 hover:text-orange-600 leading-none">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Services tag input */}
          <div>
            <Label hint="Press Enter to add">Services</Label>
            <input
              type="text"
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(serviceInput, services, setServices, setServiceInput); }
              }}
              placeholder="e.g. UI Design"
              className={inputCls}
            />
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {services.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-[11.5px] font-semibold bg-[#f5f5f5] text-[#555] border border-[#ebebeb] px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t, services, setServices)} className="text-[#bbb] hover:text-[#555] leading-none">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label hint="Max 300 chars">Short bio</Label>
            <textarea name="desc" placeholder="Describe your experience, specialties, and what kind of remote roles you're looking for…" value={worker.desc} onChange={handleChange} className={textareaCls} maxLength={300} />
          </div>
        </div>
      </div>

      {/* ── Social links ── */}
      <div>
        <SectionHead>Online presence</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "linkedin", placeholder: "linkedin.com/in/…" },
            { name: "twitter", placeholder: "@yourhandle" },
            { name: "facebook", placeholder: "facebook.com/…" },
          ].map(({ name, placeholder }) => (
            <div key={name}>
              <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
              <input
                name={name}
                type="text"
                placeholder={placeholder}
                value={worker.socialLinks[name as keyof typeof worker.socialLinks]}
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
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering…</>
        ) : worker.tier === "vip" ? "Register as VIP →" : "Register for free →"}
      </button>
    </form>
  );
}
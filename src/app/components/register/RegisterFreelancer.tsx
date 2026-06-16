"use client";

import React, { useState } from "react";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, FileText, Link2, FileUp, X, Loader2, CheckCircle2, Wand2 } from "lucide-react";
import Image from "next/image";

// ── Shared primitives ──────────────────────────────────────────────────────

const Label = ({ children, hint, badge }: { children: React.ReactNode; hint?: string; badge?: boolean }) => (
  <div className="flex items-center justify-between mb-1.5">
    <div className="flex items-center gap-2">
      <label className="block text-[11px] font-bold tracking-[0.12em] text-[#888] uppercase">
        {children}
      </label>
      {badge && (
        <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          auto-filled
        </span>
      )}
    </div>
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

const inputFilledCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-green-50 border border-green-200 rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all";

const textareaCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e8e8e8] rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none min-h-[90px]";

const textareaFilledCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-green-50 border border-green-200 rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none min-h-[90px]";

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterFreelancer() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Smart populate state
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [populating, setPopulating] = useState(false);
  const [populated, setPopulated] = useState(false);
  const [populateError, setPopulateError] = useState("");

  // Track which fields were auto-filled so we can highlight them
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  const [user, setUser] = useState({
    username: "",
    fullName: "",
    dob: "",
    address: "",
    phone: "",
    country: "",
    email: "",
    password: "",
    yearsOfExperience: "",
    stateOfResidence: "",
    isSeller: true,
    desc: "",
    nextOfKin: { fullName: "", phone: "" },
  });
  const [portfolioData, setPortfolioData] = useState<object | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    // If user edits an auto-filled field, remove the highlight
    setAutoFilled((prev) => { const n = new Set(prev); n.delete(name); return n; });

    if (name === "dob") {
      const birth = new Date(value);
      if (isNaN(birth.getTime())) return;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const hasPassed =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
      if (!hasPassed) age--;
      if (age < 18) {
        toast.error("You must be at least 18 to register.");
        setUser((prev) => ({ ...prev, dob: "" }));
      }
    }
  };

  const handleNextOfKinChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUser((prev) => ({
      ...prev,
      nextOfKin: { ...prev.nextOfKin, [e.target.name]: e.target.value },
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
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.filter((t) => t !== tag));

  // ── Smart populate — calls /portfolio/analyze-temp (no auth needed)
const handlePopulate = async () => {
  if (!portfolioUrl.trim() && !portfolioFile) {
    setPopulateError("Add a portfolio URL or upload a file first.");
    return;
  }
  setPopulateError("");
  setPopulating(true);

  try {
    const formData = new FormData();
    if (portfolioFile) formData.append("files", portfolioFile);
    if (portfolioUrl.trim()) formData.append("url", portfolioUrl.trim());

    const res = await newRequest.post("/portfolio/analyze-temp", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const p = res.data.portfolio;
    const filled = new Set<string>();

    const descParts: string[] = [];
    if (p.headline) descParts.push(p.headline);
    if (p.skills?.length) descParts.push(`\nCore skills: ${p.skills.slice(0, 6).join(", ")}.`);
    const newDesc = descParts.join("\n\n").trim();

    setUser((prev) => {
      const updated = { ...prev };
      if (newDesc) { updated.desc = newDesc; filled.add("desc"); }
      if (p.experience) { updated.yearsOfExperience = String(p.experience); filled.add("yearsOfExperience"); }
      return updated;
    });

    if (p.services?.length > 0) {
      setServices((prev) => [...new Set([...prev, ...p.services])]);
      filled.add("services");
    }

    setAutoFilled(filled);
    setPortfolioData(p);
    setPopulated(true);
    toast.success("Profile details populated from your portfolio!");
  } catch (err: any) {
    const msg = err.response?.data?.message || "Couldn't read your portfolio. Try again.";
    setPopulateError(msg);
    toast.error(msg);
  } finally {
    setPopulating(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = "";
    if (file) {
      try {
        const uploaded = await upload(file);
        imageUrl = uploaded?.url || "";
      } catch {
        toast.error("Image upload failed."); setLoading(false); return;
      }
    }
    try {
      await newRequest.post("/auth/register", {
  ...user,
  img: imageUrl,
  languages,
  services,
  portfolio: portfolioData
    ? { status: "completed", analyzedAt: new Date(), ...portfolioData }
    : undefined,
});
      toast.success("OTP sent — check your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(user.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Avatar ── */}
      <div className="flex items-center gap-4">
        <label htmlFor="freelancerAvatar" className="cursor-pointer group relative shrink-0">
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
          <input id="freelancerAvatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        <div>
          <p className="text-[13px] font-bold text-[#111]">Profile photo</p>
          <p className="text-[11.5px] text-[#bbb] mt-0.5">JPG or PNG · optional</p>
        </div>
      </div>

      {/* ── Smart Portfolio Builder ── */}
      <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#fafafa] border-b border-[#f0f0f0]">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-black text-[#111]">Fill from your portfolio</p>
            <p className="text-[11px] text-[#aaa] mt-0.5">
              Share your CV or portfolio link and we'll fill in your bio, skills and services for you
            </p>
          </div>
          {populated && (
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-bold text-green-600">Applied</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* URL input */}
          <div>
            <Label>Portfolio or website URL</Label>
            <div className="flex items-center gap-2 bg-white border border-[#e8e8e8] rounded-xl px-3.5 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Link2 className="w-3.5 h-3.5 text-[#ccc] flex-shrink-0" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="flex-1 bg-transparent outline-none text-[13.5px] text-[#111] placeholder:text-[#ccc]"
              />
              {portfolioUrl && (
                <button type="button" onClick={() => setPortfolioUrl("")} className="text-[#ccc] hover:text-[#888]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* File upload */}
          <div>
            <Label hint="PDF, DOCX, DOC">Or upload your CV / portfolio file</Label>
            <label
              htmlFor="portfolioDoc"
              className="flex items-center gap-2.5 bg-white border border-dashed border-[#e8e8e8] hover:border-orange-300 hover:bg-orange-50/40 rounded-xl px-3.5 py-3 cursor-pointer transition-all group"
            >
              <FileUp className="w-4 h-4 text-[#ccc] group-hover:text-orange-400 flex-shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                {portfolioFile ? (
                  <p className="text-[12.5px] font-semibold text-orange-600 truncate">{portfolioFile.name}</p>
                ) : (
                  <p className="text-[12.5px] text-[#bbb]">Click to choose a file</p>
                )}
              </div>
              {portfolioFile && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setPortfolioFile(null); }}
                  className="text-[#ccc] hover:text-red-400 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <input
                id="portfolioDoc"
                type="file"
                accept=".pdf,.docx,.doc,.ppt,.pptx,.txt"
                className="hidden"
                onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Error */}
          {populateError && (
            <p className="text-[11.5px] text-red-500 flex items-center gap-1.5">
              <X className="w-3 h-3 shrink-0" /> {populateError}
            </p>
          )}

          {/* CTA button */}
          <button
            type="button"
            onClick={handlePopulate}
            disabled={populating || (!portfolioUrl.trim() && !portfolioFile)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black tracking-wide transition-all ${
              populated
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-[#0A0A0A] hover:bg-orange-500 text-white disabled:bg-[#f0f0f0] disabled:text-[#bbb] disabled:cursor-not-allowed"
            }`}
          >
            {populating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Reading your portfolio…</>
            ) : populated ? (
              <><CheckCircle2 className="w-4 h-4" /> Profile filled — run again to refresh</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Fill my profile</>
            )}
          </button>

          {populated && (
            <p className="text-[11px] text-[#aaa] text-center -mt-1">
              Fields marked <span className="text-green-500 font-bold">auto-filled</span> below were populated from your portfolio. You can edit them freely.
            </p>
          )}
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div>
        <SectionHead>Basic information</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Full name</Label>
            <input name="fullName" type="text" placeholder="e.g. Emeka Obi" value={user.fullName} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Username</Label>
            <input name="username" type="text" placeholder="e.g. emeka_dev" value={user.username} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Email</Label>
            <input name="email" type="email" placeholder="you@example.com" value={user.email} onChange={handleChange} className={inputCls} required />
          </div>
          <div className="sm:col-span-2">
            <Label hint="Min. 8 characters">Password</Label>
            <div className="relative">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={user.password} onChange={handleChange} className={`${inputCls} pr-10`} required />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-3 flex items-center text-[#bbb] hover:text-[#666] transition">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <Label hint="Must be 18+">Date of birth</Label>
            <input name="dob" type="date" value={user.dob} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <Label>Phone</Label>
            <input name="phone" type="text" placeholder="+234 800 000 0000" value={user.phone} onChange={handleChange} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Location ── */}
      <div>
        <SectionHead>Location</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Country</Label>
            <input name="country" type="text" placeholder="Nigeria" value={user.country} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <Label>State of residence</Label>
            <input name="stateOfResidence" type="text" placeholder="Lagos" value={user.stateOfResidence} onChange={handleChange} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <input name="address" type="text" placeholder="123 Main Street, Ikeja" value={user.address} onChange={handleChange} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Skills ── */}
      <div>
        <SectionHead>Skills & expertise</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Languages */}
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

          {/* Services */}
          <div>
            <Label hint="Press Enter to add" badge={autoFilled.has("services")}>Services</Label>
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
        </div>
      </div>

      {/* ── Experience & Bio ── */}
      <div>
        <SectionHead>Experience</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label badge={autoFilled.has("yearsOfExperience")}>Years of experience</Label>
            <input
              name="yearsOfExperience"
              type="number"
              min="0"
              placeholder="e.g. 3"
              value={user.yearsOfExperience}
              onChange={handleChange}
              className={autoFilled.has("yearsOfExperience") ? inputFilledCls : inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <Label hint="Max 300 chars" badge={autoFilled.has("desc")}>Short bio</Label>
            <textarea
              name="desc"
              placeholder="Describe your background, specialties, and what makes you stand out…"
              value={user.desc}
              onChange={handleChange}
              className={autoFilled.has("desc") ? textareaFilledCls : textareaCls}
              maxLength={300}
            />
            <p className="text-[10.5px] text-[#ccc] text-right mt-1">{user.desc.length}/300</p>
          </div>
        </div>
      </div>

      {/* ── Next of Kin ── */}
      <div>
        <SectionHead>Next of kin</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Full name</Label>
            <input name="fullName" type="text" placeholder="e.g. Ngozi Obi" value={user.nextOfKin.fullName} onChange={handleNextOfKinChange} className={inputCls} />
          </div>
          <div>
            <Label>Phone</Label>
            <input name="phone" type="text" placeholder="+234 800 000 0000" value={user.nextOfKin.phone} onChange={handleNextOfKinChange} className={inputCls} />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#0A0A0A] hover:bg-orange-500 text-white text-[13.5px] font-black tracking-wide rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
        ) : "Create freelancer account →"}
      </button>
    </form>
  );
}
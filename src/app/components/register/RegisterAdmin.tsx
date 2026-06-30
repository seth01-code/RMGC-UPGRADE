"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

// ── Shared field primitives ───────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-bold tracking-[0.12em] text-[#888] uppercase mb-1.5">
    {children}
  </label>
);

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e8e8e8] rounded-xl placeholder:text-[#ccc] focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all";

// ─────────────────────────────────────────────────────────────────────────────

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAdmin((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      toast.error("Only @renewedmindsglobalconsult.com emails can register as Admin.");
      setLoading(false);
      return;
    }

    let imageUrl = admin.img;
    if (file) {
      try {
        const uploaded = await upload(file);
        imageUrl = uploaded?.url || "";
      } catch {
        toast.error("Image upload failed. Try again.");
        setLoading(false);
        return;
      }
    }

    try {
      await newRequest.post("/auth/register", { ...admin, img: imageUrl, isAdmin: true });
      toast.success("OTP sent — check your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(admin.email)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <label htmlFor="adminAvatar" className="cursor-pointer group relative shrink-0">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#e0e0e0] group-hover:border-orange-400 bg-[#fafafa] overflow-hidden flex items-center justify-center transition-all">
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
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M4.5 1.5v6M1.5 4.5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <input id="adminAvatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
        <div>
          <p className="text-[13px] font-bold text-[#111]">Profile photo</p>
          <p className="text-[11.5px] text-[#bbb] mt-0.5">JPG or PNG · optional</p>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2.5 px-3.5 py-3 bg-orange-50 border border-orange-100 rounded-xl">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-orange-500 mt-0.5 shrink-0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <p className="text-[11.5px] text-orange-700 leading-relaxed">
          Admin accounts require a <span className="font-bold">@renewedmindsglobalconsult.com</span> email address.
        </p>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <input name="username" type="text" placeholder="e.g. admin_john" value={admin.username} onChange={handleChange} className={inputCls} required />
        </div>

        <div>
          <Label>Phone</Label>
          <input name="phone" type="text" placeholder="+234 800 000 0000" value={admin.phone} onChange={handleChange} className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <Label>Company email</Label>
          <input name="email" type="email" placeholder="you@renewedmindsglobalconsult.com" value={admin.email} onChange={handleChange} className={inputCls} required />
        </div>

        <div className="sm:col-span-2">
          <Label>Password</Label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={admin.password}
              onChange={handleChange}
              className={`${inputCls} pr-10`}
              required
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-[#bbb] hover:text-[#666] transition">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label>Country</Label>
          <input name="country" type="text" placeholder="Nigeria" value={admin.country} onChange={handleChange} className={inputCls} />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-[#0A0A0A] hover:bg-orange-500 text-white text-[13.5px] font-black tracking-wide rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Registering…
          </>
        ) : (
          "Create admin account →"
        )}
      </button>
    </form>
  );
}
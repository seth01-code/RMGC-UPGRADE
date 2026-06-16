"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Eye, EyeOff, Upload, Camera, User, Mail, Phone, MapPin, Briefcase, Lock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";
import Footer from "@/app/components/footer";

interface ProfileData {
  username: string;
  email: string;
  desc: string;
  phone: string;
  country: string;
  img: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  yearsOfExperience: string;
}

type PasswordFields = "currentPassword" | "newPassword" | "confirmPassword";

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-400">
      <span className="text-[14px] text-orange-400">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "bg-neutral-50 border-[1.5px] border-neutral-200 rounded-xl px-4 py-3 text-[13px] text-neutral-900 placeholder-neutral-300 outline-none focus:border-orange-400 focus:bg-white transition-all w-full font-['Inter']";

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="w-[3px] h-5 rounded-full bg-orange-500 flex-shrink-0" />
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">{title}</p>
  </div>
);

const EditProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    username: "", email: "", desc: "", phone: "", country: "",
    img: "", currentPassword: "", newPassword: "", confirmPassword: "",
    yearsOfExperience: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<Record<PasswordFields, boolean>>({
    currentPassword: false, newPassword: false, confirmPassword: false,
  });

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => (await newRequest.get("/users/profile")).data,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || "", email: user.email || "",
        desc: user.desc || "", phone: user.phone || "",
        country: user.country || "", img: user.img || "",
        yearsOfExperience: user.yearsOfExperience || "",
        currentPassword: "", newPassword: "", confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
  };

  const togglePassword = (field: PasswordFields) =>
    setPasswordVisible((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    let imageUrl = profile.img;
    if (file) {
      try { 
        const uploadResult = await upload(file);
        imageUrl = typeof uploadResult === "string" ? uploadResult : uploadResult.url;
      }
      catch { toast.error("Failed to upload image"); setSaving(false); return; }
    }
    const payload: any = {
      ...profile,
      img: imageUrl,
    };
    if (profile.newPassword) payload.password = profile.newPassword;
    try {
      await newRequest.patch("/users/profile", payload);
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["userProfile"] as any);
      router.push("/seller");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally { setSaving(false); }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 space-y-4 animate-pulse">
          <div className="h-6 w-40 bg-neutral-200 rounded-lg" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
          <div className="h-48 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-neutral-200 rounded-2xl p-10 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠</span>
          </div>
          <h2 className="text-[15px] font-bold text-neutral-900 mb-1">Failed to load profile</h2>
          <p className="text-[13px] text-neutral-400">Please try again later.</p>
        </div>
      </div>
    );

  const avatarSrc = preview || profile.img || null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex-1 px-4 md:px-8 py-8 max-w-3xl mx-auto w-full">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-[3px] h-7 rounded-full bg-orange-500" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500 mb-0.5">Settings</p>
            <h1 className="text-[22px] font-black tracking-tight text-neutral-900">Edit Profile</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* ── Avatar card ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <SectionTitle title="Profile photo" />
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 ring-2 ring-neutral-100">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-300" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profileImg"
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                </label>
                <input id="profileImg" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900 mb-1">
                  {profile.username || "Your name"}
                </p>
                <p className="text-[12px] text-neutral-400 mb-3">
                  {profile.country || "Location not set"}
                </p>
                <label
                  htmlFor="profileImg"
                  className="inline-flex items-center gap-2 text-[12px] font-bold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 bg-orange-50 px-3.5 py-1.5 rounded-lg cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Change photo
                </label>
              </div>
            </div>
          </div>

          {/* ── Basic info card ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <SectionTitle title="Basic information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Username" icon={<User className="w-3.5 h-3.5" />}>
                <input name="username" type="text" value={profile.username} onChange={handleChange}
                  placeholder="your_username" className={inputCls} />
              </Field>
              <Field label="Email" icon={<Mail className="w-3.5 h-3.5" />}>
                <input name="email" type="email" value={profile.email} onChange={handleChange}
                  placeholder="you@example.com" className={inputCls} />
              </Field>
              <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />}>
                <input name="phone" type="text" value={profile.phone} onChange={handleChange}
                  placeholder="+234..." className={inputCls} />
              </Field>
              <Field label="Country" icon={<MapPin className="w-3.5 h-3.5" />}>
                <input name="country" type="text" value={profile.country} onChange={handleChange}
                  placeholder="Nigeria" className={inputCls} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Years of Experience" icon={<Briefcase className="w-3.5 h-3.5" />}>
                  <input name="yearsOfExperience" type="text" value={profile.yearsOfExperience}
                    onChange={handleChange} placeholder="e.g. 3" className={inputCls} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Bio" icon={<FileText className="w-3.5 h-3.5" />}>
                  <textarea name="desc" value={profile.desc} onChange={handleChange} rows={4}
                    placeholder="Tell clients about your experience, skills, and what makes you stand out..."
                    className={`${inputCls} resize-none`} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Password card ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <SectionTitle title="Change password" />
            <p className="text-[12px] text-neutral-400 mb-5 -mt-2">Leave blank to keep your current password.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["currentPassword", "newPassword", "confirmPassword"] as PasswordFields[]).map((field) => {
                const labels: Record<PasswordFields, string> = {
                  currentPassword: "Current password",
                  newPassword: "New password",
                  confirmPassword: "Confirm password",
                };
                return (
                  <Field key={field} label={labels[field]} icon={<Lock className="w-3.5 h-3.5" />}>
                    <div className="relative">
                      <input
                        name={field}
                        type={passwordVisible[field] ? "text" : "password"}
                        value={profile[field] || ""}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword(field)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {passwordVisible[field]
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                );
              })}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 font-bold text-[13px] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-100 disabled:text-neutral-400 text-white font-bold text-[13px] rounded-xl transition-colors tracking-wide"
            >
              {saving ? "Saving..." : "Save changes →"}
            </button>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;
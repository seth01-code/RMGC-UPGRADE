/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { MdOutlineAttachMoney, MdOutlineWork } from "react-icons/md";
import { BsPersonBadge, BsFileEarmarkText } from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";
import ClipLoader from "react-spinners/ClipLoader";
import newRequest from "../utils/newRequest";
import upload from "../utils/upload";
import { useExchangeRate } from "../hooks/useExchangeRate";

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  currentUser?: any;
}

interface JobFormState {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  skills: string[];
  skillInput: string;
  experienceLevel: "entry" | "mid" | "expert" | "";
  attachmentUrls: string[];
  visibility: "public" | "invite";
}

const INITIAL_STATE: JobFormState = {
  title: "",
  description: "",
  budget: "",
  deadline: "",
  category: "",
  skills: [],
  skillInput: "",
  experienceLevel: "",
  attachmentUrls: [],
  visibility: "public",
};

const MAX_TITLE = 100;
const MAX_DESCRIPTION = 2000;
const MAX_SKILLS = 8;
const MAX_ATTACHMENTS = 5;

const CATEGORIES = [
  "Web Development",
  "Graphic Design",
  "Digital Marketing",
  "Content Writing",
  "Video Editing",
  "App Development",
  "SEO (Search Engine Optimization)",
  "Social Media Management",
  "Mobile App Design",
  "Branding",
  "Photography",
  "Illustration",
  "Logo Design",
  "UI/UX Design",
  "E-commerce Development",
  "Copywriting",
  "Voice Over",
  "Translation Services",
  "Music Production",
  "Business Consulting",
  "Virtual Assistant",
  "Photography Editing",
  "3D Modeling",
  "Animation",
  "Web Scraping",
  "Game Development",
  "Custom Software Development",
  "Cybersecurity",
  "Data Analysis",
  "Blockchain Development",
  "Artificial Intelligence & Machine Learning",
  "Cloud Computing",
];

const STEPS = ["Basics", "Details", "Requirements"];

const PostJobModal: React.FC<PostJobModalProps> = ({
  open,
  onClose,
  currentUser: propUser,
}) => {
  const queryClient = useQueryClient();
  const [localUser, setLocalUser] = useState<any>(propUser ?? null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setLocalUser(JSON.parse(stored));
  }, []);

  const currentUser = localUser ?? propUser;
  const { currencySymbol, countryCurrency, convertToUSD } = useExchangeRate(
    currentUser?.country,
  );
  const [form, setForm] = useState<JobFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<
    Partial<Record<keyof JobFormState, string>>
  >({});
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Track preview URLs so we can show thumbnails for image attachments
  const [attachmentPreviews, setAttachmentPreviews] = useState<
    Record<string, string>
  >({});

  const mutation = useMutation({
    mutationFn: (payload: any) => newRequest.post("/work", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work"] });
      queryClient.invalidateQueries({ queryKey: ["clientWork"] });
      setForm(INITIAL_STATE);
      setAttachmentFiles([]);
      setAttachmentPreviews({});
      setUploadError(null);
      setStep(0);
      onClose();
    },
  });

  const validateStep = (s: number): boolean => {
    const next: Partial<Record<keyof JobFormState, string>> = {};
    if (s === 0) {
      if (!form.title.trim()) next.title = "Give your gig request a title.";
      if (!form.description.trim())
        next.description = "Describe what you need done.";
      if (!form.category) next.category = "Pick a category.";
    }
    if (s === 1) {
      if (!form.budget || Number(form.budget) <= 0)
        next.budget = "Enter a budget greater than zero.";
      if (!form.experienceLevel)
        next.experienceLevel = "Select an experience level.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    const combined = [...attachmentFiles, ...picked].slice(0, MAX_ATTACHMENTS);
    setAttachmentFiles(combined);

    // Generate preview URLs for images so we can render thumbnails
    const newPreviews: Record<string, string> = {};
    picked.forEach((file) => {
      if (file.type.startsWith("image/")) {
        newPreviews[`${file.name}-${file.lastModified}`] =
          URL.createObjectURL(file);
      }
    });
    setAttachmentPreviews((prev) => ({ ...prev, ...newPreviews }));

    setUploadError(null);
    e.target.value = "";
  };

  const removeAttachmentFile = (index: number) => {
    const file = attachmentFiles[index];
    const key = `${file.name}-${file.lastModified}`;

    // Revoke the object URL to avoid memory leaks
    if (attachmentPreviews[key]) {
      URL.revokeObjectURL(attachmentPreviews[key]);
      setAttachmentPreviews((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }

    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Uses the same `upload` utility as Add.tsx — uploads directly to Cloudinary,
  // no backend /upload endpoint needed.
  const uploadAttachments = async (): Promise<string[]> => {
    if (attachmentFiles.length === 0) return [];
    setIsUploading(true);
    setUploadError(null);
    try {
      const results = await Promise.all(
        attachmentFiles.map(async (file) => {
          const result = await upload(file);
          return result?.url || "";
        }),
      );
      // Filter out any empty strings from failed uploads
      return results.filter(Boolean);
    } catch (err) {
      setUploadError(
        "Some attachments failed to upload. Remove them and try again.",
      );
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    try {
      const uploadedUrls = await uploadAttachments();
      const budgetInUSD = convertToUSD(Number(form.budget));
      mutation.mutate({
        title: form.title.trim(),
        description: form.description.trim(),
        budget: budgetInUSD,
        currency: "USD",
        deadline: form.deadline || undefined,
        category: form.category,
        skills: form.skills,
        experienceLevel: form.experienceLevel,
        locationType: "remote",
        attachmentUrls: uploadedUrls,
        visibility: form.visibility,
      });
    } catch {
      // uploadError is already set inside uploadAttachments
    }
  };

  const handleClose = () => {
    if (mutation.isPending || isUploading) return;
    // Revoke all remaining preview URLs
    Object.values(attachmentPreviews).forEach(URL.revokeObjectURL);
    setForm(INITIAL_STATE);
    setErrors({});
    setAttachmentFiles([]);
    setAttachmentPreviews({});
    setUploadError(null);
    setStep(0);
    mutation.reset();
    onClose();
  };

  const addSkill = () => {
    const val = form.skillInput.trim();
    if (!val || form.skills.length >= MAX_SKILLS || form.skills.includes(val))
      return;
    setForm((f) => ({ ...f, skills: [...f.skills, val], skillInput: "" }));
  };

  const removeSkill = (skill: string) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const isBusy = mutation.isPending || isUploading;
  const budgetUSDPreview =
    form.budget && Number(form.budget) > 0
      ? convertToUSD(Number(form.budget))
      : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[3px] px-0 sm:px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-140 bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden border border-[#f0f0f0]"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#f7f7f7]">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-100 shrink-0 bg-orange-50">
                  {currentUser?.img ? (
                    <Image
                      src={currentUser.img}
                      alt={currentUser.username ?? "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[13px] font-bold text-orange-500">
                      {currentUser?.username?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#111] leading-tight">
                    {currentUser?.username ?? "You"}
                  </p>
                  <p className="text-[11px] text-[#bbb] font-medium">
                    Posting a remote gig
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isBusy}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#ccc] hover:text-[#555] hover:bg-[#f5f5f5] transition-all disabled:opacity-40"
                aria-label="Close"
              >
                <HiOutlineX className="text-[16px]" />
              </button>
            </div>

            {/* ── Step indicator ── */}
            <div className="flex items-center px-5 py-3.5 border-b border-[#f7f7f7] bg-[#fafafa]">
              {STEPS.map((label, i) => (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-all ${
                        i < step
                          ? "bg-orange-500 text-white"
                          : i === step
                            ? "bg-[#111] text-white"
                            : "bg-[#ebebeb] text-[#ccc]"
                      }`}
                    >
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span
                      className={`text-[11.5px] font-semibold transition-colors ${
                        i === step ? "text-[#111]" : "text-[#ccc]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 mx-3 h-px transition-colors ${
                        i < step ? "bg-orange-300" : "bg-[#ebebeb]"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── Body ── */}
            <div className="px-5 py-5 space-y-5 max-h-[62vh] overflow-y-auto">
              {/* ── Step 0: Basics ── */}
              {step === 0 && (
                <>
                  <div>
                    <input
                      type="text"
                      value={form.title}
                      maxLength={MAX_TITLE}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="What do you need done? e.g. Design a logo for my brand"
                      className={`w-full text-[15px] font-semibold text-[#111] placeholder:text-[#d0d0d0] placeholder:font-normal outline-none bg-transparent border-b-2 pb-2 transition-colors ${
                        errors.title
                          ? "border-red-300"
                          : "border-[#f0f0f0] focus:border-orange-300"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-red-400">
                        {errors.title}
                      </span>
                      <span className="text-[10px] text-[#ddd]">
                        {form.title.length}/{MAX_TITLE}
                      </span>
                    </div>
                  </div>

                  <div>
                    <textarea
                      value={form.description}
                      maxLength={MAX_DESCRIPTION}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Describe scope, deliverables, and any must-haves. More detail → better pitches."
                      rows={5}
                      className={`w-full text-[13.5px] text-[#333] placeholder:text-[#d0d0d0] bg-[#fafafa] border rounded-xl px-4 py-3 outline-none resize-none transition-colors leading-relaxed ${
                        errors.description
                          ? "border-red-300"
                          : "border-[#f0f0f0] focus:border-orange-300"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-red-400">
                        {errors.description}
                      </span>
                      <span className="text-[10px] text-[#ddd]">
                        {form.description.length}/{MAX_DESCRIPTION}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <MdOutlineWork className="text-[13px]" /> Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, category: cat }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                            form.category === cat
                              ? "bg-[#111] text-white border-[#111]"
                              : "bg-white text-[#999] border-[#eee] hover:border-[#ccc] hover:text-[#555]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && (
                      <p className="text-[11px] text-red-400 mt-1.5">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <BsPersonBadge className="text-[13px]" /> Visibility
                    </label>
                    <div className="flex items-center gap-2">
                      {(["public", "invite"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, visibility: v }))
                          }
                          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                            form.visibility === v
                              ? "bg-[#111] text-white border-[#111]"
                              : "bg-white text-[#999] border-[#eee] hover:border-[#ccc]"
                          }`}
                        >
                          {v === "public" ? "🌍 Public" : "🔒 Invite only"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 1: Details ── */}
              {step === 1 && (
                <>
                  {/* Remote-only notice */}
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
                    <span className="text-[18px]">🌍</span>
                    <div>
                      <p className="text-[12px] font-bold text-orange-600">
                        Remote only
                      </p>
                      <p className="text-[11px] text-orange-400">
                        All gig requests on this platform are remote work.
                      </p>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <MdOutlineAttachMoney className="text-[13px]" /> Budget
                      {countryCurrency && (
                        <span className="ml-auto text-[9.5px] font-bold bg-orange-50 text-orange-400 border border-orange-100 px-2 py-0.5 rounded-md uppercase tracking-wide">
                          {countryCurrency}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#ccc] font-medium">
                        {currencySymbol || "$"}
                      </span>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={form.budget}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, budget: e.target.value }))
                        }
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 text-[16px] font-bold text-[#111] bg-[#fafafa] border rounded-xl outline-none transition-colors ${
                          errors.budget
                            ? "border-red-300"
                            : "border-[#f0f0f0] focus:border-orange-300"
                        }`}
                      />
                    </div>
                    {errors.budget && (
                      <p className="text-[11px] text-red-400 mt-1.5">
                        {errors.budget}
                      </p>
                    )}
                    {!errors.budget &&
                      countryCurrency !== "USD" &&
                      budgetUSDPreview !== null && (
                        <p className="text-[11px] text-[#bbb] mt-1.5">
                          ≈ ${budgetUSDPreview.toLocaleString()} USD —
                          freelancers will see and bid in USD
                        </p>
                      )}
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <HiOutlineClock className="text-[13px]" /> Deadline{" "}
                      <span className="text-[#d0d0d0] font-medium normal-case tracking-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="date"
                      value={form.deadline}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, deadline: e.target.value }))
                      }
                      className="w-full px-4 py-3 text-[13.5px] text-[#111] bg-[#fafafa] border border-[#f0f0f0] rounded-xl outline-none focus:border-orange-300 transition-colors"
                    />
                  </div>

                  {/* Experience level */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <BsFileEarmarkText className="text-[13px]" /> Experience
                      level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["entry", "mid", "expert"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, experienceLevel: lvl }))
                          }
                          className={`py-3 rounded-xl text-[12px] font-bold border transition-all ${
                            form.experienceLevel === lvl
                              ? "bg-[#111] text-white border-[#111]"
                              : "bg-white text-[#999] border-[#eee] hover:border-[#ccc]"
                          }`}
                        >
                          {lvl === "entry"
                            ? "Entry"
                            : lvl === "mid"
                              ? "Mid-level"
                              : "Expert"}
                        </button>
                      ))}
                    </div>
                    {errors.experienceLevel && (
                      <p className="text-[11px] text-red-400 mt-1.5">
                        {errors.experienceLevel}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ── Step 2: Requirements ── */}
              {step === 2 && (
                <>
                  {/* Skills */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <HiOutlineTag className="text-[13px]" /> Required skills
                      <span className="ml-auto text-[#d0d0d0] font-medium normal-case tracking-normal">
                        {form.skills.length}/{MAX_SKILLS}
                      </span>
                    </label>

                    {form.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {form.skills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-[11.5px] font-semibold rounded-lg"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-orange-300 hover:text-orange-600 transition-colors ml-0.5"
                            >
                              <RiCloseLine className="text-[12px]" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.skillInput}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, skillInput: e.target.value }))
                        }
                        onKeyDown={handleSkillKeyDown}
                        placeholder="e.g. Figma, React, Copywriting…"
                        disabled={form.skills.length >= MAX_SKILLS}
                        className="flex-1 px-4 py-2.5 text-[13px] bg-[#fafafa] border border-[#f0f0f0] rounded-xl outline-none focus:border-orange-300 transition-colors disabled:opacity-40"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        disabled={
                          form.skills.length >= MAX_SKILLS ||
                          !form.skillInput.trim()
                        }
                        className="px-4 py-2.5 text-[12px] font-bold bg-[#111] text-white rounded-xl hover:bg-orange-500 transition-all disabled:opacity-30"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[11px] text-[#ccc] mt-1.5">
                      Press Enter or comma to add
                    </p>
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#bbb] uppercase tracking-widest mb-2.5">
                      <HiOutlinePhotograph className="text-[13px]" />{" "}
                      Attachments{" "}
                      <span className="text-[#d0d0d0] font-medium normal-case tracking-normal">
                        (optional, up to {MAX_ATTACHMENTS})
                      </span>
                    </label>

                    {/* Drop zone — matches the DropZone style from Add.tsx */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={
                        isUploading || attachmentFiles.length >= MAX_ATTACHMENTS
                      }
                      className="w-full flex flex-col items-center justify-center gap-2 py-7 border-2 border-dashed border-[#eeeeee] rounded-xl hover:border-orange-200 hover:bg-orange-50/20 transition-all group disabled:opacity-50"
                    >
                      <HiOutlinePhotograph className="text-[22px] text-[#ddd] group-hover:text-orange-400 transition-colors" />
                      <span className="text-[12px] font-semibold text-[#ccc] group-hover:text-orange-500 transition-colors">
                        Click to upload images, PDFs, or docs
                      </span>
                      <span className="text-[10.5px] text-[#ddd]">
                        PNG, JPG, PDF, DOC up to 10MB each
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />

                    {/* Preview grid — images show as thumbnails, docs as file rows */}
                    {attachmentFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {/* Image thumbnails */}
                        {attachmentFiles.filter((f) =>
                          f.type.startsWith("image/"),
                        ).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {attachmentFiles
                              .filter((f) => f.type.startsWith("image/"))
                              .map((file, i) => {
                                const key = `${file.name}-${file.lastModified}`;
                                const preview = attachmentPreviews[key];
                                const globalIndex =
                                  attachmentFiles.indexOf(file);
                                return (
                                  <div
                                    key={key}
                                    className="relative w-20 h-20 shrink-0"
                                  >
                                    {preview ? (
                                      <Image
                                        src={preview}
                                        alt={file.name}
                                        fill
                                        className="object-cover rounded-xl border border-[#f0f0f0]"
                                      />
                                    ) : (
                                      <div className="w-full h-full rounded-xl border border-[#f0f0f0] bg-[#fafafa] flex items-center justify-center">
                                        <HiOutlinePhotograph className="text-[20px] text-[#ddd]" />
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeAttachmentFile(globalIndex)
                                      }
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                                    >
                                      <HiOutlineX className="text-[9px]" />
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {/* Non-image file rows */}
                        {attachmentFiles
                          .filter((f) => !f.type.startsWith("image/"))
                          .map((file) => {
                            const globalIndex = attachmentFiles.indexOf(file);
                            return (
                              <div
                                key={`${file.name}-${file.lastModified}`}
                                className="flex items-center gap-3 p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl"
                              >
                                <HiOutlineDocumentText className="text-orange-400 text-[16px] flex-shrink-0" />
                                <span className="text-[12px] text-[#555] truncate flex-1">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAttachmentFile(globalIndex)
                                  }
                                  disabled={isUploading}
                                  className="text-[#ccc] hover:text-red-400 transition-colors shrink-0 disabled:opacity-40"
                                >
                                  <HiOutlineX className="text-[13px]" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-[11px] text-red-400 mt-2">
                        {uploadError}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4">
                    <p className="text-[10px] font-bold text-[#ccc] uppercase tracking-widest mb-3">
                      Review before posting
                    </p>
                    <div className="space-y-1.5">
                      <SummaryRow label="Title" value={form.title} />
                      <SummaryRow label="Category" value={form.category} />
                      <SummaryRow
                        label="Budget"
                        value={
                          form.budget
                            ? `${currencySymbol || "$"}${Number(form.budget).toLocaleString()}${
                                countryCurrency !== "USD" &&
                                budgetUSDPreview !== null
                                  ? ` (≈ $${budgetUSDPreview.toLocaleString()} USD)`
                                  : ""
                              }`
                            : "—"
                        }
                      />
                      <SummaryRow
                        label="Deadline"
                        value={form.deadline || "Flexible"}
                      />
                      <SummaryRow
                        label="Level"
                        value={form.experienceLevel || "—"}
                      />
                      <SummaryRow label="Work type" value="🌍 Remote" />
                      <SummaryRow label="Visibility" value={form.visibility} />
                      <SummaryRow
                        label="Attachments"
                        value={
                          attachmentFiles.length > 0
                            ? `${attachmentFiles.length} file${attachmentFiles.length !== 1 ? "s" : ""} ready`
                            : "None"
                        }
                      />
                    </div>
                  </div>

                  {mutation.isError && (
                    <div className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      Couldn&rsquo;t post your gig request — please try again.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#f7f7f7] bg-[#fafafa]">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isBusy}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#888] border border-[#eee] hover:bg-white transition-all disabled:opacity-50"
                >
                  ← Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isBusy}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-[#888] border border-[#eee] hover:bg-white transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              <div className="flex-1" />

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#111] hover:bg-orange-500 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isBusy}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#111] hover:bg-orange-500 transition-all disabled:opacity-60"
                >
                  {isBusy ? (
                    <>
                      <ClipLoader size={13} color="#fff" />
                      {isUploading ? "Uploading..." : "Posting..."}
                    </>
                  ) : (
                    "Post gig request 🚀"
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-0.5">
    <span className="text-[11.5px] text-[#ccc]">{label}</span>
    <span className="text-[12px] font-semibold text-[#444] capitalize max-w-65 truncate text-right">
      {value}
    </span>
  </div>
);

export default PostJobModal;

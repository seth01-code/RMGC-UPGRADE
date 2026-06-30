/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useReducer,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import upload from "../utils/upload";
import { gigReducer, INITIAL_STATE, GigState } from "../reducers/gigReducer";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { toast } from "sonner";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlinePlus,
} from "react-icons/hi";
import { IoCloudUploadOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";

type GigField = keyof GigState;

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

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-bold tracking-[0.14em] text-[#888] uppercase">
        {label}
      </label>
      {hint && <span className="text-[10px] text-[#ccc]">{hint}</span>}
    </div>
    {children}
  </div>
);

const inputCls =
  "w-full border-2 border-[#f0f0f0] focus:border-orange-400 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)] rounded-xl px-4 py-3 text-[13.5px] text-[#111] placeholder:text-[#ccc] outline-none transition-all bg-white";

const DropZone = ({
  label,
  icon,
  accept,
  multiple = false,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}) => (
  <label className="group flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-[#f0f0f0] hover:border-orange-300 hover:bg-orange-500/[0.02] rounded-2xl cursor-pointer transition-all">
    <span className="text-[#ccc] group-hover:text-orange-400 text-[22px] transition-colors">
      {icon}
    </span>
    <span className="text-[12px] font-semibold text-[#ccc] group-hover:text-orange-400 transition-colors">
      {label}
    </span>
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      className="hidden"
      onChange={(e) => onChange(Array.from(e.target.files || []))}
    />
  </label>
);

const Section = ({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-[#f0f0f0] rounded-2xl p-6 space-y-5">
    <div>
      <p className="text-[10px] font-bold tracking-[0.16em] text-orange-500 uppercase mb-1">
        {eyebrow}
      </p>
      <h2 className="text-[15px] font-extrabold text-[#111]">{title}</h2>
    </div>
    {children}
  </div>
);

const Add: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const [singleFile, setSingleFile] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [featureInput, setFeatureInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [country, setCountry] = useState("United States");
  const [step, setStep] = useState<1 | 2>(1);

  const currentUser: any =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const { data: userData } = useQuery({
    queryKey: ["userData", currentUser?.id],
    queryFn: () => newRequest.get("/users/me").then((r) => r.data),
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (userData?.country) setCountry(userData.country);
  }, [userData]);

  const { exchangeRate, countryCurrency } = useExchangeRate(country);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name as GigField, value: e.target.value },
    });
  };

  const handleCoverChange = (file: File | undefined) => {
    setSingleFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
    else setCoverPreview("");
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDisplayPrice(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    dispatch({ type: "CHANGE_INPUT", payload: { name: "price", value: raw } });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      dispatch({ type: "ADD_FEATURE", payload: featureInput.trim() });
      setFeatureInput("");
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover = singleFile?.type.startsWith("image/")
        ? (await upload(singleFile))?.url || ""
        : "";
      const uploads = await Promise.all(
        files.map(async (file) => {
          const up = await upload(file);
          return { url: up?.url || "", type: file.type };
        }),
      );
      dispatch({
        type: "ADD_IMAGES",
        payload: {
          cover,
          images: uploads
            .filter((f) => f.type.startsWith("image/"))
            .map((f) => f.url),
          videos: uploads
            .filter((f) => f.type.startsWith("video/"))
            .map((f) => f.url),
          documents: uploads
            .filter((f) => f.type === "application/pdf")
            .map((f) => f.url),
        },
      });
      toast.success("Files uploaded successfully");
    } catch {
      toast.error("Upload failed, please try again");
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (gig: any) => newRequest.post("/gigs", gig).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGigs"] });
      toast.success("Gig created successfully!");
      router.push("/mygigs");
    },
    onError: () => toast.error("Failed to create gig"),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const localAmount = Number(state.price);
    const priceUSDCents = Math.round((localAmount / exchangeRate) * 100);
    mutation.mutate({
      ...state,
      price: Math.round(priceUSDCents / 100),
      priceCents: priceUSDCents,
      originalPrice: localAmount,
      originalCurrency: countryCurrency,
    });
  };

  const imageFiles = files.filter((f) => f.type.startsWith("image/"));
  const videoFiles = files.filter((f) => f.type.startsWith("video/"));
  const pdfFiles = files.filter((f) => f.type === "application/pdf");
  const filteredCats = CATEGORIES.filter((c) =>
    c.toLowerCase().includes(categoryInput.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white">
      

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-orange-500" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              Freelancer tools
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
            Create a new gig
          </h1>
          <p className="text-[13px] text-[#aaa] mt-1.5">
            Fill in the details below to list your service on the marketplace.
          </p>
        </div>

        {/* ── Step tabs ── */}
        <div className="flex items-center gap-1 mb-8 border-b border-[#f0f0f0]">
          {[
            { n: 1 as const, label: "Gig details" },
            { n: 2 as const, label: "Media & samples" },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-semibold transition-colors ${step === s.n ? "text-[#111]" : "text-[#bbb] hover:text-[#888]"}`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${step === s.n ? "bg-orange-500 text-white" : "bg-[#f5f5f5] text-[#bbb]"}`}
              >
                {s.n}
              </span>
              {s.label}
              {step === s.n && (
                <motion.div
                  layoutId="step-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Left */}
                <div className="space-y-6">
                  <Section eyebrow="Basic info" title="About this gig">
                    <Field label="Gig title" hint="Be specific and clear">
                      <input
                        type="text"
                        name="title"
                        value={state.title || ""}
                        onChange={handleChange}
                        placeholder="e.g. I will design a professional logo"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Category">
                      <div className="relative">
                        <input
                          type="text"
                          value={categoryInput}
                          onChange={(e) => {
                            setCategoryInput(e.target.value);
                            setShowDropdown(true);
                            dispatch({
                              type: "CHANGE_INPUT",
                              payload: { name: "cat", value: e.target.value },
                            });
                          }}
                          onFocus={() => setShowDropdown(true)}
                          onBlur={() =>
                            setTimeout(() => setShowDropdown(false), 150)
                          }
                          placeholder="Search or select a category"
                          className={inputCls}
                        />
                        <AnimatePresence>
                          {showDropdown && filteredCats.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#f0f0f0] rounded-2xl shadow-lg z-20 max-h-52 overflow-y-auto p-1.5"
                            >
                              {filteredCats.map((cat, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onMouseDown={() => {
                                    setCategoryInput(cat);
                                    dispatch({
                                      type: "CHANGE_INPUT",
                                      payload: { name: "cat", value: cat },
                                    });
                                    setShowDropdown(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 text-[12.5px] font-medium rounded-xl transition-all ${categoryInput === cat ? "bg-orange-500/10 text-orange-500" : "text-[#555] hover:bg-[#f7f7f7] hover:text-[#111]"}`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Field>

                    <Field label="Description" hint="Min. 100 characters">
                      <textarea
                        name="desc"
                        value={state.desc || ""}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe what you offer, your process, and what makes you different..."
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                  </Section>

                  <Section eyebrow="Thumbnail" title="Cover image">
                    {coverPreview ? (
                      <div className="relative w-full h-[200px] rounded-2xl overflow-hidden border border-[#f0f0f0]">
                        <Image
                          src={coverPreview}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleCoverChange(undefined)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <HiOutlineX className="text-[14px]" />
                        </button>
                      </div>
                    ) : (
                      <label className="group flex flex-col items-center justify-center gap-3 h-[180px] border-2 border-dashed border-[#f0f0f0] hover:border-orange-300 hover:bg-orange-500/[0.02] rounded-2xl cursor-pointer transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-[#f0f0f0] group-hover:border-orange-200 group-hover:bg-orange-500/5 flex items-center justify-center transition-all">
                          <HiOutlinePhotograph className="text-[22px] text-[#ccc] group-hover:text-orange-400 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-[13px] font-semibold text-[#bbb] group-hover:text-orange-400 transition-colors">
                            Click to upload cover image
                          </p>
                          <p className="text-[11px] text-[#ccc] mt-0.5">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleCoverChange(e.target.files?.[0])
                          }
                        />
                      </label>
                    )}
                  </Section>
                </div>

                {/* Right */}
                <div className="space-y-6">
                  <Section eyebrow="Service details" title="Pricing & delivery">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Delivery time" hint="In days">
                        <input
                          type="number"
                          name="deliveryTime"
                          min={1}
                          value={state.deliveryTime || 1}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Revisions">
                        <input
                          type="number"
                          name="revisionNumber"
                          min={1}
                          value={state.revisionNumber || 1}
                          onChange={handleChange}
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <Field label="Price" hint="In your local currency">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#bbb]">
                          {country === "Nigeria" ? "₦" : "$"}
                        </span>
                        <input
                          type="text"
                          name="price"
                          value={displayPrice}
                          onChange={handlePriceChange}
                          placeholder="0.00"
                          className={`${inputCls} pl-8`}
                        />
                      </div>
                      {Number(state.price) > 0 && exchangeRate !== 1 && (
                        <p className="text-[11px] text-[#bbb] mt-1.5 pl-1">
                          ≈ $
                          {(Number(state.price) / exchangeRate).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          USD stored
                        </p>
                      )}
                    </Field>

                    <Field label="Short service title">
                      <input
                        name="shortTitle"
                        value={state.shortTitle || ""}
                        onChange={handleChange}
                        placeholder="e.g. Professional logo design"
                        className={inputCls}
                      />
                    </Field>

                    <Field
                      label="Short description"
                      hint="Appears in search results"
                    >
                      <textarea
                        name="shortDesc"
                        value={state.shortDesc || ""}
                        onChange={handleChange}
                        rows={3}
                        placeholder="One-line pitch for your gig..."
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                  </Section>

                  <Section eyebrow="Inclusions" title="What's included">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        placeholder="e.g. Source files included"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-[#111] hover:bg-orange-500 text-white rounded-xl transition-all"
                      >
                        <HiOutlinePlus className="text-[16px]" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <AnimatePresence>
                        {state.features.map((f: string) => (
                          <motion.button
                            key={f}
                            type="button"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            onClick={() =>
                              dispatch({ type: "REMOVE_FEATURE", payload: f })
                            }
                            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[12px] font-semibold px-3 py-1.5 rounded-xl hover:bg-red-50 hover:text-red-400 hover:border-red-100 transition-all"
                          >
                            <HiOutlineCheck className="text-[11px]" />
                            {f}
                            <HiOutlineX className="text-[10px] opacity-60" />
                          </motion.button>
                        ))}
                      </AnimatePresence>
                      {state.features.length === 0 && (
                        <p className="text-[12px] text-[#ccc]">
                          No features added yet.
                        </p>
                      )}
                    </div>
                  </Section>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-orange-500 text-white text-[13.5px] font-bold py-3.5 rounded-xl transition-all"
                  >
                    Continue to media
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6h8M6 2l4 4-4 4"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2 — Sample media only ══ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl"
              >
                <Section eyebrow="Sample work" title="Upload media files">
                  <p className="text-[12.5px] text-[#aaa] leading-relaxed -mt-2">
                    Add images, videos, or PDF documents that showcase your
                    work.
                  </p>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-2">
                      Images
                    </p>
                    <DropZone
                      label="Click to upload images"
                      icon={<HiOutlinePhotograph />}
                      accept="image/*"
                      multiple
                      onChange={(f) =>
                        setFiles((p) => [
                          ...p,
                          ...f.filter((x) => x.type.startsWith("image/")),
                        ])
                      }
                    />
                    {imageFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {imageFiles.map((file) => (
                          <div
                            key={file.name + file.lastModified}
                            className="relative w-20 h-20"
                          >
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              fill
                              className="object-cover rounded-xl border border-[#f0f0f0]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((p) => p.filter((f) => f !== file))
                              }
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                            >
                              <HiOutlineX className="text-[9px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-2">
                      Videos
                    </p>
                    <DropZone
                      label="Click to upload videos"
                      icon={<HiOutlineVideoCamera />}
                      accept="video/*"
                      multiple
                      onChange={(f) =>
                        setFiles((p) => [
                          ...p,
                          ...f.filter((x) => x.type.startsWith("video/")),
                        ])
                      }
                    />
                    {videoFiles.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3">
                        {videoFiles.map((file) => (
                          <div
                            key={file.name + file.lastModified}
                            className="flex items-center gap-3 p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl"
                          >
                            <HiOutlineVideoCamera className="text-orange-400 text-[16px] flex-shrink-0" />
                            <span className="text-[12px] text-[#555] truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((p) => p.filter((f) => f !== file))
                              }
                              className="text-[#ccc] hover:text-red-400 transition-colors"
                            >
                              <HiOutlineX className="text-[13px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-[#bbb] uppercase mb-2">
                      Documents
                    </p>
                    <DropZone
                      label="Click to upload PDFs"
                      icon={<HiOutlineDocumentText />}
                      accept="application/pdf"
                      multiple
                      onChange={(f) =>
                        setFiles((p) => [
                          ...p,
                          ...f.filter((x) => x.type === "application/pdf"),
                        ])
                      }
                    />
                    {pdfFiles.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3">
                        {pdfFiles.map((file) => (
                          <div
                            key={file.name + file.lastModified}
                            className="flex items-center gap-3 p-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl"
                          >
                            <HiOutlineDocumentText className="text-orange-400 text-[16px] flex-shrink-0" />
                            <span className="text-[12px] text-[#555] truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((p) => p.filter((f) => f !== file))
                              }
                              className="text-[#ccc] hover:text-red-400 transition-colors"
                            >
                              <HiOutlineX className="text-[13px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {(imageFiles.length > 0 ||
                    videoFiles.length > 0 ||
                    pdfFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-[#111] hover:bg-[#111] text-[#111] hover:text-white text-[13px] font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      {uploading ? (
                        <ClipLoader size={14} color="currentColor" />
                      ) : (
                        <IoCloudUploadOutline className="text-[17px]" />
                      )}
                      {uploading
                        ? "Uploading..."
                        : `Upload ${imageFiles.length + videoFiles.length + pdfFiles.length} file${imageFiles.length + videoFiles.length + pdfFiles.length !== 1 ? "s" : ""}`}
                    </button>
                  )}
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom action bar ── */}
          <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-[#f0f0f0]">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#aaa] hover:text-orange-500 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M10 6H2M6 10L2 6l4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back to details
              </button>
            )}
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/mygigs")}
                className="text-[13px] font-semibold text-[#bbb] hover:text-[#555] px-4 py-3 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-[#f5f5f5] disabled:text-[#ccc] text-white text-[13.5px] font-bold px-8 py-3 rounded-xl transition-all"
              >
                {mutation.isPending ? (
                  <ClipLoader size={14} color="#fff" />
                ) : (
                  <>
                    Publish gig
                    <HiOutlineCheck className="text-[15px]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;

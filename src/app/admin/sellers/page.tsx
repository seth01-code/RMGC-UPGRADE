"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import newRequest from "../../utils/newRequest";
import { FaTrash, FaGlobe } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import {
  LuBrain,
  LuUpload,
  LuLink,
  LuFileText,
  LuCircleCheck,
  LuClock,
  LuCircleX,
  LuChevronDown,
  LuChevronUp,
  LuTrash2,
  LuStar,
  LuBriefcase,
  LuLayers,
  LuAward,
  LuImage,
} from "react-icons/lu";
import Footer from "@/app/components/footer";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Portfolio {
  status: "pending" | "processing" | "completed" | "failed" | null;
  headline?: string;
  experience?: number;
  skills?: string[];
  services?: string[];
  industries?: string[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    outcomes: string;
    images?: string[];
  }[];
  gallery?: string[];
  confidence_score?: number;
  analyzedAt?: string;
}

interface Seller {
  _id: string;
  username: string;
  email: string;
  img?: string;
  country?: string;
  yearsOfExperience?: string;
  services?: string[];
  portfolio?: Portfolio;
}

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Portfolio["status"] }) => {
  if (!status)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-neutral-100 text-neutral-400 uppercase tracking-wide">
        No portfolio
      </span>
    );

  const map: Record<
    NonNullable<Portfolio["status"]>,
    { icon: React.ReactNode; label: string; bg: string }
  > = {
    pending: {
      icon: <LuClock className="text-[11px]" />,
      label: "Pending",
      bg: "bg-amber-50 text-amber-600",
    },
    processing: {
      icon: <LuBrain className="text-[11px] animate-pulse" />,
      label: "AI processing",
      bg: "bg-blue-50 text-blue-600",
    },
    completed: {
      icon: <LuCircleCheck className="text-[11px]" />,
      label: "Completed",
      bg: "bg-green-50 text-green-600",
    },
    failed: {
      icon: <LuCircleX className="text-[11px]" />,
      label: "Failed",
      bg: "bg-red-50 text-red-600",
    },
  };

  const { icon, label, bg } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${bg}`}
    >
      {icon} {label}
    </span>
  );
};

// ─────────────────────────────────────────────
// CONFIDENCE BAR
// ─────────────────────────────────────────────

const ConfidenceBar = ({ score }: { score: number }) => {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-neutral-500 w-8 text-right">
        {pct}%
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────
// IMAGE THUMBNAIL ROW
// Plain <img> rather than next/image here — these come from wherever the
// portfolio analyzer's storage uploads to (Cloudinary by default), and
// using next/image would require that host to be added to next.config.js
// first. Worth switching to next/image once that's confirmed.
// ─────────────────────────────────────────────

const ThumbnailRow = ({
  images,
  altPrefix,
  onSelect,
}: {
  images: string[];
  altPrefix: string;
  onSelect: (src: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {images.map((src, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onSelect(src)}
        className="w-14 h-14 rounded-md overflow-hidden border border-neutral-200 hover:border-orange-300 transition-colors flex-shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${altPrefix} ${i + 1}`}
          className="w-full h-full object-cover"
        />
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────
// PORTFOLIO PANEL
// ─────────────────────────────────────────────

const PortfolioPanel = ({
  seller,
  onAnalyze,
  onApply,
  onClear,
}: {
  seller: Seller;
  onAnalyze: (id: string, files: File[], url: string) => Promise<void>;
  onApply: (id: string) => Promise<void>;
  onClear: (id: string) => Promise<void>;
}) => {
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  // Open by default when portfolio is already completed
  const [showExtracted, setShowExtracted] = useState(
    seller.portfolio?.status === "completed"
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const p = seller.portfolio;

  const handleSubmit = async () => {
    if (files.length === 0 && !url.trim()) return;
    setAnalyzing(true);
    await onAnalyze(seller._id, files, url.trim());
    setFiles([]);
    setUrl("");
    setAnalyzing(false);
    setShowExtracted(true);
  };

  const handleApply = async () => {
    setApplying(true);
    const t = toast.info("Applying portfolio to profile...", { autoClose: false });
    try {
      await onApply(seller._id);
      toast.dismiss(t);
      // onApply handles the success toast and state update (including clearing portfolio)
    } catch {
      toast.dismiss(t);
      // onApply handles the error toast
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="border-t border-neutral-100 mt-4 pt-4 flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-neutral-400 flex items-center gap-1.5">
          <LuBrain className="text-orange-500 text-[13px]" />
          AI Portfolio Intelligence
        </p>
        <div className="flex items-center gap-2">
          <StatusBadge status={p?.status ?? null} />
          {p?.status && (
            <button
              onClick={() => onClear(seller._id)}
              title="Clear portfolio"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-400 transition-colors"
            >
              <LuTrash2 className="text-[11px]" />
            </button>
          )}
        </div>
      </div>

      {/* Input area — show if no portfolio, pending, or failed */}
      {(!p?.status || p?.status === "pending" || p?.status === "failed") && (
        <div className="flex flex-col gap-2">
          {/* File upload */}
          <label
            htmlFor={`file-${seller._id}`}
            className="flex items-center gap-2 bg-neutral-50 hover:bg-orange-50 border border-dashed border-neutral-200 hover:border-orange-300 rounded-xl px-4 py-3 cursor-pointer transition-all group"
          >
            <LuUpload className="text-neutral-400 group-hover:text-orange-500 text-[15px] flex-shrink-0 transition-colors" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-neutral-600 group-hover:text-orange-600 transition-colors">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "Upload portfolio files"}
              </p>
              <p className="text-[10px] text-neutral-400">PDF, DOCX, PPT, JPG, PNG</p>
            </div>
            <input
              id={`file-${seller._id}`}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
              className="hidden"
              onChange={(e) =>
                e.target.files && setFiles(Array.from(e.target.files))
              }
            />
          </label>

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-1">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-1.5"
                >
                  <LuFileText className="text-orange-400 text-[12px] flex-shrink-0" />
                  <span className="text-[11px] text-orange-700 flex-1 truncate">
                    {f.name}
                  </span>
                  <button
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-orange-300 hover:text-orange-600"
                  >
                    <LuCircleX className="text-[12px]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* URL input */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 focus-within:border-orange-400 transition-colors">
              <LuLink className="text-neutral-400 text-[14px] flex-shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Portfolio website URL..."
                className="flex-1 bg-transparent outline-none text-[12px] text-neutral-700 placeholder-neutral-300"
              />
            </div>
          </div>

          {/* Run button */}
          {(files.length > 0 || url.trim()) && (
            <button
              onClick={handleSubmit}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-neutral-800 disabled:bg-neutral-200 text-white disabled:text-neutral-400 text-[12px] font-bold py-3 rounded-xl transition-colors"
            >
              {analyzing ? (
                <>
                  <LuBrain className="text-orange-400 text-[14px] animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <LuBrain className="text-orange-400 text-[14px]" />
                  Run AI Analysis
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Processing state */}
      {p?.status === "processing" && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <LuBrain className="text-blue-500 text-[16px] animate-pulse flex-shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-blue-700">
              Gemini is analyzing the portfolio...
            </p>
            <p className="text-[10px] text-blue-500 mt-0.5">
              This may take 10–30 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Completed — extracted data */}
      {p?.status === "completed" && (
        <div className="bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden">
          {/* Header toggle */}
          <button
            onClick={() => setShowExtracted(!showExtracted)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700">
              <LuCircleCheck className="text-[13px]" />
              Extraction complete
              {p.confidence_score !== undefined && (
                <span className="ml-1 text-[10px] font-semibold text-neutral-400">
                  · {Math.round(p.confidence_score * 100)}% confidence
                </span>
              )}
            </span>
            {showExtracted ? (
              <LuChevronUp className="text-neutral-400 text-[13px]" />
            ) : (
              <LuChevronDown className="text-neutral-400 text-[13px]" />
            )}
          </button>

          {showExtracted && (
            <div className="border-t border-neutral-100 px-4 pb-4 flex flex-col gap-3 pt-3">
              {/* Confidence bar */}
              {p.confidence_score !== undefined && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Confidence
                  </p>
                  <ConfidenceBar score={p.confidence_score} />
                </div>
              )}

              {/* Headline */}
              {p.headline && (
                <div className="bg-white border border-neutral-100 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-1 flex items-center gap-1">
                    <LuStar className="text-[10px]" /> Headline
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-800">
                    {p.headline}
                  </p>
                </div>
              )}

              {/* Experience */}
              {p.experience && (
                <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-lg px-3 py-2">
                  <LuBriefcase className="text-orange-400 text-[13px] flex-shrink-0" />
                  <span className="text-[12px] text-neutral-700">
                    <span className="font-bold">{p.experience}</span> years of experience
                  </span>
                </div>
              )}

              {/* Skills */}
              {p.skills && p.skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <LuLayers className="text-[10px]" /> Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-white border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {p.services && p.services.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Services
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.services.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-orange-50 border border-orange-100 text-orange-700 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industries */}
              {p.industries && p.industries.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Industries
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.industries.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-md"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {p.certifications && p.certifications.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <LuAward className="text-[10px]" /> Certifications
                  </p>
                  <div className="flex flex-col gap-1">
                    {p.certifications.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[11px] text-neutral-600"
                      >
                        <LuCircleCheck className="text-green-500 text-[10px] flex-shrink-0" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {p.projects && p.projects.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Projects ({p.projects.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {p.projects.map((proj, i) => (
                      <div
                        key={i}
                        className="bg-white border border-neutral-100 rounded-lg p-3"
                      >
                        <p className="text-[12px] font-bold text-neutral-800 mb-0.5">
                          {proj.name}
                        </p>
                        {proj.description && (
                          <p className="text-[11px] text-neutral-500 mb-1.5 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {proj.technologies.map((t, ti) => (
                              <span
                                key={ti}
                                className="text-[9px] font-bold bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.outcomes && (
                          <p className="text-[10px] text-green-600 font-medium mb-1.5">
                            ↗ {proj.outcomes}
                          </p>
                        )}
                        {proj.images && proj.images.length > 0 && (
                          <ThumbnailRow
                            images={proj.images}
                            altPrefix={proj.name}
                            onSelect={setLightboxSrc}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery — images that didn't map to one specific project */}
              {p.gallery && p.gallery.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                    <LuImage className="text-[10px]" /> Other images ({p.gallery.length})
                  </p>
                  <ThumbnailRow
                    images={p.gallery}
                    altPrefix="Portfolio image"
                    onSelect={setLightboxSrc}
                  />
                </div>
              )}

              {/* Analyzed at */}
              {p.analyzedAt && (
                <p className="text-[10px] text-neutral-300 text-right">
                  Analyzed{" "}
                  {new Date(p.analyzedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={applying}
                className="mt-1 w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-[11px] font-bold py-2.5 rounded-lg transition-colors"
              >
                {applying ? (
                  <>
                    <LuBrain className="text-[12px] animate-pulse" />
                    Applying...
                  </>
                ) : (
                  <>
                    <LuCircleCheck className="text-[12px]" />
                    Apply to profile
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Failed retry message */}
      {p?.status === "failed" && (
        <p className="text-[11px] text-red-500 text-center">
          Analysis failed. Add sources above and try again.
        </p>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Portfolio image preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close preview"
          >
            <LuCircleX className="text-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const Sellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchSellers = async () => {
    try {
      setError(false);
      const response = await newRequest.get("/users/sellers");
      setSellers(response.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // ── Handlers

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete seller "${name}"? This cannot be undone.`)) return;
    const t = toast.info(`Deleting ${name}...`, { autoClose: false });
    try {
      await newRequest.delete(`/users/${id}`);
      toast.dismiss(t);
      setSellers((prev) => prev.filter((s) => s._id !== id));
      toast.success(`"${name}" deleted.`);
    } catch (err: any) {
      toast.dismiss(t);
      toast.error(err.response?.data?.message || "Failed to delete.");
    }
  };

  const handleAnalyze = async (id: string, files: File[], url: string) => {
    setSellers((prev) =>
      prev.map((s) =>
        s._id !== id
          ? s
          : { ...s, portfolio: { ...(s.portfolio || {}), status: "processing" } }
      )
    );

    const t = toast.info("Running AI analysis...", { autoClose: false });
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      if (url) formData.append("url", url);

      const res = await newRequest.post(`/portfolio/analyze/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(t);
      setSellers((prev) =>
        prev.map((s) =>
          s._id !== id ? s : { ...s, portfolio: res.data.portfolio }
        )
      );
      toast.success("AI analysis complete!");
    } catch (err: any) {
      toast.dismiss(t);
      setSellers((prev) =>
        prev.map((s) =>
          s._id !== id
            ? s
            : { ...s, portfolio: { ...(s.portfolio || {}), status: "failed" } }
        )
      );
      toast.error(err.response?.data?.message || "Analysis failed.");
    }
  };

  const handleApply = async (id: string) => {
    try {
      const res = await newRequest.post(`/portfolio/apply/${id}`);

      // Update profile fields AND clear the portfolio data from the card
      setSellers((prev) =>
        prev.map((s) =>
          s._id !== id
            ? s
            : {
                ...s,
                services: res.data.user.services ?? s.services,
                yearsOfExperience: res.data.user.yearsOfExperience ?? s.yearsOfExperience,
                // Clear portfolio from local state so the card resets to upload state
                portfolio: undefined,
              }
        )
      );
      toast.success("Portfolio applied to profile successfully!");
    } catch (err: any) {
      console.error("[Apply] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to apply portfolio.");
    }
  };

  const handleClear = async (id: string) => {
    if (!window.confirm("Clear this portfolio? The data will be removed.")) return;
    const t = toast.info("Clearing portfolio...", { autoClose: false });
    try {
      await newRequest.delete(`/portfolio/${id}`);
      toast.dismiss(t);
      setSellers((prev) =>
        prev.map((s) => (s._id !== id ? s : { ...s, portfolio: undefined }))
      );
      toast.success("Portfolio cleared.");
    } catch (err: any) {
      toast.dismiss(t);
      toast.error(err.response?.data?.message || "Failed to clear.");
    }
  };

  const filtered = sellers.filter(
    (s) =>
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading skeleton
  if (loading)
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-neutral-100 rounded-full w-2/3 mb-2" />
                    <div className="h-2.5 bg-neutral-100 rounded-full w-full" />
                  </div>
                </div>
                <div className="h-20 bg-neutral-100 rounded-xl" />
              </div>
            ))}
        </div>
      </div>
    );

  // ── Error state
  if (error)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <LuCircleX className="text-red-500 text-[20px]" />
          </div>
          <h2 className="text-[15px] font-bold text-neutral-900 mb-1">
            Failed to load sellers
          </h2>
          <p className="text-[13px] text-neutral-400 mb-4">
            Something went wrong. Try refreshing.
          </p>
          <button
            onClick={fetchSellers}
            className="bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex-1 px-5 md:px-8 py-7 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-[3px] h-7 rounded-full bg-orange-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500 mb-0.5">
                Admin
              </p>
              <h1 className="text-[22px] font-black tracking-tight text-neutral-900">
                Freelancer Management
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 w-full sm:w-72">
            <i className="ti ti-search text-neutral-400 text-[15px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search freelancers..."
              className="flex-1 bg-transparent outline-none text-[13px] text-neutral-700 placeholder-neutral-300"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total freelancers", value: sellers.length },
            {
              label: "Portfolio analyzed",
              value: sellers.filter(
                (s) =>
                  s.portfolio?.status === "completed" ||
                  s.portfolio?.status === "processing"
              ).length,
            },
            {
              label: "AI completed",
              value: sellers.filter((s) => s.portfolio?.status === "completed")
                .length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-neutral-100 rounded-2xl px-4 py-3"
            >
              <p className="text-[22px] font-black text-neutral-900 leading-none">
                {value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-[13px]">
            No freelancers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((seller) => (
              <div
                key={seller._id}
                className="bg-white border border-neutral-100 rounded-2xl p-5 hover:border-neutral-200 transition-all flex flex-col"
              >
                {/* Seller header */}
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-100">
                      <Image
                        src={seller.img || FALLBACK_AVATAR}
                        alt={seller.username}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[14px] font-black text-neutral-900 truncate">
                        {seller.username}
                      </p>
                      <MdVerified className="text-orange-500 text-[12px] flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {seller.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {seller.country && (
                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                          <FaGlobe className="text-[9px]" /> {seller.country}
                        </span>
                      )}
                      {seller.yearsOfExperience && (
                        <span className="text-[10px] text-neutral-400">
                          {seller.yearsOfExperience}yr exp.
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(seller._id, seller.username)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Delete seller"
                  >
                    <FaTrash className="text-[11px]" />
                  </button>
                </div>

                {/* Services pill */}
                {seller.services && seller.services.length > 0 && (
                  <p className="text-[11px] text-orange-500 font-semibold mt-2 truncate">
                    {seller.services.slice(0, 3).join(" · ")}
                    {seller.services.length > 3 &&
                      ` +${seller.services.length - 3}`}
                  </p>
                )}

                {/* Toggle portfolio panel */}
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === seller._id ? null : seller._id
                    )
                  }
                  className="mt-3 w-full flex items-center justify-between bg-neutral-50 hover:bg-orange-50 border border-neutral-100 hover:border-orange-200 rounded-xl px-3.5 py-2.5 transition-all group"
                >
                  <span className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 group-hover:text-orange-600 transition-colors">
                    <LuBrain className="text-[13px]" />
                    Portfolio Intelligence
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={seller.portfolio?.status ?? null} />
                    {expandedId === seller._id ? (
                      <LuChevronUp className="text-neutral-400 text-[13px]" />
                    ) : (
                      <LuChevronDown className="text-neutral-400 text-[13px]" />
                    )}
                  </div>
                </button>

                {expandedId === seller._id && (
                  <PortfolioPanel
                    seller={seller}
                    onAnalyze={handleAnalyze}
                    onApply={handleApply}
                    onClear={handleClear}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Sellers;
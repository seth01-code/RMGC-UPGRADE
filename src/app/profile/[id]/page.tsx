"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import newRequest from "../../utils/newRequest";
import {
  LuCode,
  LuLayers,
  LuBuilding2,
  LuAward,
  LuChevronDown,
  LuChevronUp,
  LuSparkles,
  LuMapPin,
  LuCalendar,
  LuBriefcase,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuImage,
  LuExternalLink,
} from "react-icons/lu";
import { MdMessage, MdVerified } from "react-icons/md";
import { IoMdStar } from "react-icons/io";
import { useExchangeRate } from "../../hooks/useExchangeRate";

// ─────────────────────────────────────────────
// TYPES & CONFIG
// ─────────────────────────────────────────────

interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  outcomes?: string;
  industry?: string;
  link?: string | null;
  images?: string[];
}

interface Portfolio {
  status?: "processing" | "completed" | "failed" | null;
  analyzedAt?: string;
  headline?: string;
  summary?: string;
  experience?: number;
  skills?: string[];
  services?: string[];
  industries?: string[];
  certifications?: string[];
  projects?: Project[];
  gallery?: string[];
  portfolio_score?: number;
  portfolioScore?: number;
  confidence_score?: number;
  grade?: string | null;
}

interface FreelancerUser {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
  languages?: string[];
  yearsOfExperience?: string | number;
  createdAt?: string;
  portfolio?: Portfolio | null;
}

interface Gig {
  _id: string;
  title: string;
  cover?: string;
  images?: string[];
  price: number;
  totalStars?: number;
  starNumber?: number;
  shortDesc?: string;
  cat?: string;
}

type TierType =
  | "Master Freelancer"
  | "Professional Freelancer"
  | "Associate Freelancer";

const TIER_CONFIG: Record<
  TierType,
  {
    label: string;
    color: string;
    badgeColor: string;
    minScore: number;
  }
> = {
  "Master Freelancer": {
    label: "Master",
    color: "text-[#F97316]",
    badgeColor: "bg-[#F97316] text-black",
    minScore: 85,
  },
  "Professional Freelancer": {
    label: "Professional",
    color: "text-white",
    badgeColor: "bg-white text-black",
    minScore: 70,
  },
  "Associate Freelancer": {
    label: "Associate",
    color: "text-[#FB923C]",
    badgeColor: "bg-[#C2410C] text-white",
    minScore: 0,
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatMonthYear(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getScore(p?: Portfolio | null): number | null {
  if (!p) return null;
  if (p.portfolioScore != null) return p.portfolioScore;
  if (p.portfolio_score != null) return Math.round(p.portfolio_score * 100);
  if (p.confidence_score != null) return Math.round(p.confidence_score * 100);
  return null;
}

function getTier(score: number | null): TierType {
  if (score === null) return "Associate Freelancer";
  if (score >= 90) return "Master Freelancer";
  if (score >= 70) return "Professional Freelancer";
  return "Associate Freelancer";
}

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

// ─────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
      >
        <LuX className="text-[16px]" />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[12px] font-bold text-white/50 tracking-widest">
          {idx + 1} / {images.length}
        </span>
      )}

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <LuChevronLeft className="text-[18px]" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full max-w-4xl max-h-[80vh] mx-16 aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[idx]}
          alt={`Project image ${idx + 1}`}
          fill
          className="object-contain"
          unoptimized
          sizes="(max-width: 1024px) 100vw, 896px"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <LuChevronRight className="text-[18px]" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2 pb-1"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIdx(i)}
              className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                i === idx
                  ? "border-orange-400 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                unoptimized
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="bg-[#f8f7f5] min-h-screen">
      <div className="h-[340px] bg-[#111] animate-pulse" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 grid lg:grid-cols-[280px_1fr] gap-10">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-black/8 animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-black/8 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IoMdStar
          key={i}
          className={`text-[12px] ${i < filled ? "text-amber-400" : "text-black/15"}`}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
// TIER BADGE
// ─────────────────────────────────────────────

function TierBadge({ tier }: { tier: TierType }) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// PROJECT CARD
// Images are the hero: if the project has images, the first one is shown
// as a full-bleed hero on the collapsed card. Expanding reveals the full
// detail panel with a scrollable thumbnail strip that opens the lightbox.
// ─────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onLightbox,
}: {
  project: Project;
  index: number;
  onLightbox: (images: string[], startIndex: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const images = project.images?.filter(Boolean) ?? [];
  const heroImage = images[0] ?? null;
  const extraCount = images.length - 4; // how many overflow past the 4-thumb strip

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        open
          ? "border-orange-200 shadow-md shadow-orange-900/5"
          : "border-black/[0.07] hover:border-black/[0.13]"
      }`}
    >
      {/* ── HERO IMAGE (collapsed state) ── */}
      {heroImage && !open && (
        <button
          onClick={() => onLightbox(images, 0)}
          className="relative w-full h-48 block overflow-hidden group/hero"
          tabIndex={-1}
        >
          <Image
            src={heroImage}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-500 group-hover/hero:scale-[1.03]"
            unoptimized
            sizes="(max-width: 1024px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <LuImage className="text-[11px]" />
              {images.length} photos
            </span>
          )}
        </button>
      )}

      {/* ── HEADER ROW (always visible) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left ${
          open ? "bg-orange-50/40" : "bg-white"
        }`}
      >
        <span
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black transition-colors ${
            open ? "bg-orange-500 text-white" : "bg-black/5 text-black/30"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-[14px] font-semibold text-black leading-snug">
          {project.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {project.outcomes && (
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              ↗ {project.outcomes}
            </span>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-black/50 bg-black/[0.04] border border-black/[0.06] px-2.5 py-1 rounded-full hover:bg-black/[0.07] hover:text-black/70 transition-colors"
            >
              <LuExternalLink className="text-[10px]" />
              View
            </a>
          )}
          {open ? (
            <LuChevronUp className="text-black/30 text-[14px]" />
          ) : (
            <LuChevronDown className="text-black/30 text-[14px]" />
          )}
        </div>
      </button>

      {/* ── EXPANDED DETAIL ── */}
      {open && (
        <div className="bg-orange-50/30 border-t border-orange-100">
          {/* Image strip — shown when expanded */}
          {images.length > 0 && (
            <div className="px-5 pt-5">
              <div
                className={`grid gap-2 ${
                  images.length === 1
                    ? "grid-cols-1"
                    : images.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-[2fr_1fr_1fr]"
                }`}
              >
                {/* Primary image — always full height */}
                <button
                  onClick={() => onLightbox(images, 0)}
                  className="relative overflow-hidden rounded-xl group/img"
                  style={{
                    aspectRatio: images.length === 1 ? "16/7" : "16/10",
                  }}
                >
                  <Image
                    src={images[0]}
                    alt={`${project.name} — 1`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/img:scale-[1.04]"
                    unoptimized
                    sizes="(max-width: 1024px) 60vw, 400px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors" />
                </button>

                {/* Secondary column — up to 3 more thumbs, last one shows overflow count */}
                {images.length > 1 && (
                  <div
                    className={`flex flex-col gap-2 ${
                      images.length === 2
                        ? "col-span-1"
                        : "col-span-2 flex-row grid grid-cols-1"
                    }`}
                    style={
                      images.length >= 3
                        ? {
                            display: "grid",
                            gridTemplateColumns:
                              images.length === 2 ? "1fr" : "1fr 1fr",
                          }
                        : {}
                    }
                  >
                    {images
                      .slice(1, images.length >= 4 ? 4 : images.length)
                      .map((src, si) => {
                        const isLast = si === 2 && extraCount > 0;
                        return (
                          <button
                            key={src}
                            onClick={() => onLightbox(images, si + 1)}
                            className="relative overflow-hidden rounded-xl group/img"
                            style={{ aspectRatio: "4/3" }}
                          >
                            <Image
                              src={src}
                              alt={`${project.name} — ${si + 2}`}
                              fill
                              className={`object-cover transition-transform duration-300 group-hover/img:scale-[1.04] ${isLast ? "brightness-50" : ""}`}
                              unoptimized
                              sizes="(max-width: 1024px) 30vw, 200px"
                            />
                            {!isLast && (
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/15 transition-colors" />
                            )}
                            {isLast && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-[15px] font-black">
                                +{extraCount + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text content */}
          <div className="px-5 pb-5 pt-4 flex flex-col gap-3">
            {project.description && (
              <p className="text-[13px] text-black/65 leading-relaxed">
                {project.description}
              </p>
            )}
            {project.outcomes && (
              <span className="sm:hidden inline-flex text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full w-fit">
                ↗ {project.outcomes}
              </span>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 bg-[#111] text-white text-[11px] font-medium rounded-lg"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-orange-600 hover:text-orange-700 transition-colors pt-1 w-fit"
              >
                <LuExternalLink className="text-[12px]" />
                View live project
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// GIG CARD
// ─────────────────────────────────────────────

function GigCard({
  gig,
  currencySymbol,
  exchangeRate,
}: {
  gig: Gig;
  currencySymbol: string;
  exchangeRate: number;
}) {
  const cover = gig.cover || gig.images?.[0];
  const rating =
    gig.starNumber && gig.totalStars ? gig.totalStars / gig.starNumber : null;
  const convertedPrice = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(gig.price * exchangeRate);

  return (
    <Link href={`/gig/${gig._id}`} className="group block">
      <div className="relative h-44 rounded-2xl overflow-hidden bg-black/5">
        {cover ? (
          <Image
            src={cover}
            alt={gig.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <LuSparkles className="text-orange-300 text-2xl" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 right-3 bg-orange-500 text-white text-[12px] font-black px-3 py-1 rounded-xl shadow-lg">
          From {currencySymbol}
          {convertedPrice}
        </div>
      </div>
      <h4 className="text-[13.5px] text-black font-semibold mt-3 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
        {gig.title}
      </h4>
      <div className="flex items-center gap-2 mt-1.5">
        {rating !== null ? (
          <>
            <Stars rating={rating} />
            <span className="text-[12px] text-black/40">
              {rating.toFixed(1)} ({gig.starNumber})
            </span>
          </>
        ) : (
          <span className="text-[12px] text-black/30 italic">New listing</span>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// SCORE RING
// ─────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 68 68">
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="5"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#f97316"
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-black text-white leading-none">
          {score}
        </span>
        <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADING
// ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black tracking-[0.22em] uppercase text-orange-500 mb-4">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const [user, setUser] = useState<FreelancerUser | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Lightbox state — null means closed
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const openLightbox = useCallback(
    (images: string[], startIndex: number) =>
      setLightbox({ images, index: startIndex }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const { exchangeRate, currencySymbol } = useExchangeRate(
    currentUser?.country || user?.country || "United States",
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await newRequest.get(`/users/${id}`);
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    const fetchGigs = async () => {
      try {
        const res = await newRequest.get(`/gigs/user/${id}`);
        if (!cancelled) setGigs(res.data || []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoadingGigs(false);
      }
    };

    fetchUser();
    fetchGigs();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleContact = useCallback(async () => {
    if (!currentUser?.id || !user?._id || currentUser.isSeller) return;
    setContactLoading(true);
    try {
      await newRequest.post("/conversations", {
        userId: currentUser.id,
        otherUserId: user._id,
      });
      router.push("/chat");
    } catch (err) {
      console.error("Error starting conversation:", err);
    } finally {
      setContactLoading(false);
    }
  }, [currentUser, user, router]);

  if (loadingUser) return <ProfileSkeleton />;

  if (notFound || !user) {
    return (
      <div className="bg-[#f8f7f5] min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-5 text-2xl">
            🔍
          </div>
          <h2 className="text-[22px] font-black text-black mb-2">
            Profile not found
          </h2>
          <p className="text-[13px] text-black/40">
            This freelancer may have deactivated their account or the link is
            broken.
          </p>
        </div>
      </div>
    );
  }

  const portfolio = user.portfolio;
  const hasPortfolio = portfolio?.status === "completed";
  const score = getScore(portfolio);
  const tier = getTier(score);
  const verifiedDate = formatMonthYear(portfolio?.analyzedAt);
  const memberSince = formatMonthYear(user.createdAt);
  const experienceYears = hasPortfolio
    ? portfolio?.experience
    : Number(user.yearsOfExperience) || null;

  const skills = portfolio?.skills || [];
  const services = portfolio?.services || [];
  const industries = portfolio?.industries || [];
  const certifications = portfolio?.certifications || [];
  const projects = portfolio?.projects || [];

  const canContact =
    currentUser && !currentUser.isSeller && currentUser.id !== user._id;

  return (
    <>
      {/* Global lightbox — rendered at root so it escapes any overflow:hidden containers */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={closeLightbox}
        />
      )}

      <div className="bg-[#f8f7f5] min-h-screen">
        {/* ── HERO ── */}
        <section>
          <div className="relative bg-[#0c0a08] overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-0 right-0 w-[55%] h-full bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(249,115,22,0.14),transparent_70%)]" />
              <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-[radial-gradient(ellipse_60%_80%_at_0%_100%,rgba(249,115,22,0.06),transparent_70%)]" />
            </div>
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.035]"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="hgrid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M32 0H0V32"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hgrid)" />
            </svg>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-10">
              <div className="flex flex-col sm:flex-row items-start gap-7 sm:gap-10">
                {/* Avatar */}
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28">
                  <Image
                    src={user.img || FALLBACK_AVATAR}
                    alt={user.username}
                    fill
                    className="rounded-2xl object-cover ring-2 ring-white/10"
                    sizes="112px"
                    unoptimized
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-400 rounded-full border-2 border-[#0c0a08]" />
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  {hasPortfolio && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <LuSparkles className="text-orange-400 text-[11px]" />
                      <span className="text-[10px] font-black tracking-[0.22em] uppercase text-orange-400">
                        Verified Portfolio
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[30px] sm:text-[36px] font-black text-white leading-[1.05] tracking-tight">
                      {user.username}
                    </h1>
                    <MdVerified className="text-orange-400 text-[20px] shrink-0 mt-1" />
                  </div>
                  {(hasPortfolio ? portfolio?.headline : user.desc) && (
                    <p className="text-white/55 text-[14px] leading-snug max-w-lg">
                      {hasPortfolio ? portfolio?.headline : user.desc}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[12px] text-white/35 font-medium">
                    {user.country && (
                      <span className="flex items-center gap-1">
                        <LuMapPin className="text-[10px]" /> {user.country}
                      </span>
                    )}
                    {experienceYears != null && (
                      <span className="flex items-center gap-1">
                        <LuBriefcase className="text-[10px]" />{" "}
                        {experienceYears}{" "}
                        {Number(experienceYears) === 1 ? "year" : "years"}{" "}
                        experience
                      </span>
                    )}
                    {memberSince && (
                      <span className="flex items-center gap-1">
                        <LuCalendar className="text-[10px]" /> Member since{" "}
                        {memberSince}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score + Tier + CTA */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-5 shrink-0 w-full sm:w-auto">
                  {score !== null && (
                    <div className="flex flex-col items-center sm:items-end gap-2">
                      <ScoreRing score={score} />
                      <TierBadge tier={tier} />
                    </div>
                  )}
                  {verifiedDate && (
                    <span className="text-[10px] text-white/25 text-center hidden sm:block">
                      Verified {verifiedDate}
                    </span>
                  )}
                  {canContact && (
                    <button
                      onClick={handleContact}
                      disabled={contactLoading}
                      className="flex items-center gap-2 text-[13px] font-black px-5 py-3 rounded-2xl bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all disabled:opacity-60 shadow-lg shadow-orange-900/20 whitespace-nowrap"
                    >
                      <MdMessage className="text-[15px]" />
                      {contactLoading ? "Opening…" : `Message ${user.username}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-10 pt-7 border-t border-white/[0.07]">
                {[
                  { label: "Active gigs", value: gigs.length },
                  { label: "Skills listed", value: skills.length },
                  { label: "Credentials", value: certifications.length },
                  { label: "Case studies", value: projects.length },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5 pr-4">
                    <p className="text-[28px] font-black text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          {hasPortfolio ? (
            <div className="grid lg:grid-cols-[260px_1fr] gap-10">
              {/* Sidebar */}
              <aside className="flex flex-col gap-8 lg:sticky lg:top-10 lg:self-start">
                {portfolio?.summary && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <SectionLabel>About</SectionLabel>
                    <p className="text-[13px] text-black/65 leading-relaxed">
                      {portfolio.summary}
                    </p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <LuCode className="text-orange-500 text-[13px]" />
                      <SectionLabel>Skills</SectionLabel>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 text-[11.5px] font-semibold bg-[#f5f5f5] text-[#333] border border-[#ebebeb] rounded-xl hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all cursor-default"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {services.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <LuLayers className="text-orange-500 text-[13px]" />
                      <SectionLabel>Services</SectionLabel>
                    </div>
                    <div className="flex flex-col gap-2">
                      {services.map((s) => (
                        <div
                          key={s}
                          className="flex items-start gap-2 text-[13px] text-black/65"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {industries.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <LuBuilding2 className="text-orange-500 text-[13px]" />
                      <SectionLabel>Industries</SectionLabel>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {industries.map((ind) => (
                        <span
                          key={ind}
                          className="px-3 py-1.5 text-[11.5px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 rounded-xl"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <LuAward className="text-orange-500 text-[13px]" />
                      <SectionLabel>Credentials</SectionLabel>
                    </div>
                    <div className="flex flex-col gap-3">
                      {certifications.map((cert) => (
                        <div key={cert} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                          <p className="text-[12.5px] text-black/65 font-medium leading-snug">
                            {cert}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user.languages && user.languages.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm">
                    <SectionLabel>Languages</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {user.languages.map((l) => (
                        <span
                          key={l}
                          className="px-3 py-1.5 text-[11.5px] font-medium bg-[#f5f5f5] text-[#444] border border-[#ebebeb] rounded-xl"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Main: projects */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <LuBriefcase className="text-orange-500 text-[15px]" />
                  <SectionLabel>
                    Case studies {projects.length > 0 && `(${projects.length})`}
                  </SectionLabel>
                </div>
                {projects.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-black/[0.06] text-center">
                    <p className="text-[13.5px] text-black/35">
                      No project case studies on file yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {projects.map((project, i) => (
                      <ProjectCard
                        key={`${project.name}-${i}`}
                        project={project}
                        index={i}
                        onLightbox={openLightbox}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-black/[0.06] shadow-sm max-w-lg">
              <p className="text-[10px] font-black tracking-[0.22em] uppercase text-orange-400 mb-3">
                Portfolio
              </p>
              <p className="text-[14px] text-black/55 leading-relaxed">
                {user.username} hasn&apos;t completed a portfolio review yet.
                Skills, services, and case studies will appear here once
                verified. Active gigs are listed below.
              </p>
            </div>
          )}

          {/* ── GIGS ── */}
          <div className="mt-12 pt-10 border-t border-black/[0.07]">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black tracking-[0.22em] uppercase text-orange-500">
                Gigs by {user.username}
              </p>
              <span className="text-[12px] text-black/30 font-medium">
                {gigs.length} listing{gigs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loadingGigs ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-52 rounded-2xl bg-black/6 animate-pulse"
                  />
                ))}
              </div>
            ) : gigs.length === 0 ? (
              <p className="text-[13.5px] text-black/35 italic">
                No active gigs right now.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gigs.map((gig) => (
                  <GigCard
                    key={gig._id}
                    gig={gig}
                    currencySymbol={currencySymbol}
                    exchangeRate={exchangeRate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer contact nudge */}
          {canContact && (
            <div className="mt-12 rounded-2xl bg-[#0c0a08] px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(249,115,22,0.12),transparent)]" />
              <div className="relative">
                <p className="text-[16px] font-black text-white leading-tight">
                  Ready to work with {user.username}?
                </p>
                <p className="text-[12.5px] text-white/40 mt-1">
                  Send a message to discuss your project needs.
                </p>
              </div>
              <button
                onClick={handleContact}
                disabled={contactLoading}
                className="relative shrink-0 flex items-center gap-2 text-[13px] font-black px-6 py-3 rounded-2xl bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all disabled:opacity-60 shadow-lg shadow-orange-900/30"
              >
                <MdMessage className="text-[15px]" />
                {contactLoading ? "Opening…" : "Start a conversation"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;

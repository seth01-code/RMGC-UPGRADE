"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import {
  LuSearch,
  LuMapPin,
  LuBriefcase,
  LuSparkles,
  LuSlidersHorizontal,
  LuX,
  LuChevronDown,
  LuCode,
  LuStar,
} from "react-icons/lu";
import { MdVerified } from "react-icons/md";
import { IoMdStar } from "react-icons/io";

// ─────────────────────────────────────────────
// TYPES & CONFIG
// ─────────────────────────────────────────────

interface Portfolio {
  status?: "processing" | "completed" | "failed" | null;
  headline?: string;
  skills?: string[];
  services?: string[];
  industries?: string[];
  portfolio_score?: number;
  portfolioScore?: number;
  confidence_score?: number;
  experience?: number;
  grade?: string | null;
}

interface Freelancer {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
  languages?: string[];
  yearsOfExperience?: string | number;
  createdAt?: string;
  isSeller?: boolean;
  portfolio?: Portfolio | null;
  totalStars?: number;
  starNumber?: number;
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
    color: "text-white bg-white/10",
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

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

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

function getRating(f: Freelancer): number | null {
  if (f.starNumber && f.totalStars) return f.totalStars / f.starNumber;
  return null;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "score", label: "Highest score" },
  { value: "experience", label: "Most experienced" },
  { value: "rating", label: "Top rated" },
];

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-black/6 overflow-hidden animate-pulse">
      <div className="h-28 bg-black/4" />
      <div className="p-5 pt-10 space-y-3">
        <div className="h-4 bg-black/6 rounded-xl w-2/3" />
        <div className="h-3 bg-black/4 rounded-xl w-full" />
        <div className="h-3 bg-black/4 rounded-xl w-4/5" />
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 bg-black/4 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCORE BADGE
// ─────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : score >= 60
      ? "bg-orange-50 text-orange-700 border-orange-100"
      : "bg-black/[0.04] text-black/40 border-black/[0.06]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black border ${color}`}
    >
      <LuStar className="text-[10px]" />
      {score}
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
// STARS
// ─────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IoMdStar
          key={i}
          className={`text-[11px] ${i < filled ? "text-amber-400" : "text-black/10"}`}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
// FREELANCER CARD
// ─────────────────────────────────────────────

function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  const hasPortfolio = freelancer.portfolio?.status === "completed";
  const score = getScore(freelancer.portfolio);
  const tier = getTier(score);
  const rating = getRating(freelancer);
  const skills = freelancer.portfolio?.skills?.slice(0, 4) ?? [];
  const headline = hasPortfolio
    ? freelancer.portfolio?.headline
    : freelancer.desc;
  const experienceYears = hasPortfolio
    ? freelancer.portfolio?.experience
    : Number(freelancer.yearsOfExperience) || null;

  return (
    <Link href={`/profile/${freelancer._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-black/6 overflow-hidden hover:border-orange-200 hover:shadow-md hover:shadow-orange-900/5 transition-all duration-200">
        {/* Banner */}
        <div className="relative h-24 bg-[#0c0a08] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(249,115,22,0.18),transparent_70%)]" />
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id={`hgrid-${freelancer._id}`}
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M24 0H0V24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`url(#hgrid-${freelancer._id})`}
            />
          </svg>

          {/* Score badge + tier top-right */}
          {hasPortfolio && (
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
              {score !== null && <ScoreBadge score={score} />}
              <TierBadge tier={tier} />
            </div>
          )}

          {/* Verified badge */}
          {hasPortfolio && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-xl">
              <LuSparkles className="text-orange-400 text-[9px]" />
              <span className="text-[9px] font-black tracking-[0.18em] uppercase text-orange-400">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Avatar — overlaps banner */}
        <div className="px-5 pb-5">
          <div className="relative -mt-8 mb-3 flex items-end justify-between">
            <div className="relative w-15 h-15 shrink-0">
              <Image
                src={freelancer.img || FALLBACK_AVATAR}
                alt={freelancer.username}
                fill
                className="rounded-2xl object-cover ring-2 ring-white"
                sizes="60px"
                unoptimized
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>

            {rating !== null && (
              <div className="flex items-center gap-1.5 mb-1">
                <Stars rating={rating} />
                <span className="text-[11px] text-black/35 font-medium">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-[15px] font-black text-black leading-tight group-hover:text-orange-600 transition-colors">
              {freelancer.username}
            </h3>
            <MdVerified className="text-orange-400 text-[14px] shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-3">
            {freelancer.country && (
              <span className="flex items-center gap-1 text-[11px] text-black/35 font-medium">
                <LuMapPin className="text-[9px]" />
                {freelancer.country}
              </span>
            )}
            {experienceYears != null && (
              <span className="flex items-center gap-1 text-[11px] text-black/35 font-medium">
                <LuBriefcase className="text-[9px]" />
                {experienceYears}yr{Number(experienceYears) !== 1 ? "s" : ""} exp
              </span>
            )}
          </div>

          {/* Headline */}
          {headline && (
            <p className="text-[12.5px] text-black/55 leading-relaxed line-clamp-2 mb-3">
              {headline}
            </p>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-[10.5px] font-semibold bg-[#f5f5f5] text-[#444] border border-[#ebebeb] rounded-xl"
                >
                  {s}
                </span>
              ))}
              {(freelancer.portfolio?.skills?.length ?? 0) > 4 && (
                <span className="px-2.5 py-1 text-[10.5px] font-semibold bg-orange-50 text-orange-600 border border-orange-100 rounded-xl">
                  +{(freelancer.portfolio!.skills!.length) - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// FILTER DROPDOWN
// ─────────────────────────────────────────────

function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12.5px] font-semibold transition-all ${
          selected
            ? "border-orange-300 bg-orange-50 text-orange-700"
            : "border-black/10 bg-white text-black/55 hover:border-black/20"
        }`}
      >
        {selected || label}
        {selected ? (
          <LuX
            className="text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              setOpen(false);
            }}
          />
        ) : (
          <LuChevronDown className="text-[11px]" />
        )}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 bg-white border border-black/8 rounded-2xl shadow-lg shadow-black/5 z-20 min-w-45 p-1.5 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt === selected ? null : opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium transition-colors ${
                opt === selected
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : "text-black/60 hover:bg-black/3 hover:text-black"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const FreelancersPage: React.FC = () => {
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterSkill, setFilterSkill] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useExchangeRate(currentUser?.country || "United States");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await newRequest.get("/users/freelancers");
        setFreelancers(res.data || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Derived filter options from data
  const allSkills = Array.from(
    new Set(
      freelancers.flatMap((f) => f.portfolio?.skills ?? []).filter(Boolean)
    )
  ).sort();

  const allCountries = Array.from(
    new Set(freelancers.map((f) => f.country).filter(Boolean) as string[])
  ).sort();

  const filtered = useCallback(() => {
    let list = [...freelancers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.username.toLowerCase().includes(q) ||
          f.portfolio?.headline?.toLowerCase().includes(q) ||
          f.desc?.toLowerCase().includes(q) ||
          f.portfolio?.skills?.some((s) => s.toLowerCase().includes(q)) ||
          f.portfolio?.services?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filterVerified) {
      list = list.filter((f) => f.portfolio?.status === "completed");
    }

    if (filterSkill) {
      list = list.filter((f) =>
        f.portfolio?.skills?.some((s) =>
          s.toLowerCase().includes(filterSkill.toLowerCase())
        )
      );
    }

    if (filterCountry) {
      list = list.filter(
        (f) => f.country?.toLowerCase() === filterCountry.toLowerCase()
      );
    }

    list.sort((a, b) => {
      if (sortBy === "score") {
        return (getScore(b.portfolio) ?? 0) - (getScore(a.portfolio) ?? 0);
      }
      if (sortBy === "experience") {
        const expA = a.portfolio?.experience ?? Number(a.yearsOfExperience) ?? 0;
        const expB = b.portfolio?.experience ?? Number(b.yearsOfExperience) ?? 0;
        return expB - expA;
      }
      if (sortBy === "rating") {
        return (getRating(b) ?? 0) - (getRating(a) ?? 0);
      }
      // newest
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return list;
  }, [freelancers, search, filterVerified, filterSkill, filterCountry, sortBy])();

  const activeFilterCount = [
    filterVerified,
    filterSkill,
    filterCountry,
  ].filter(Boolean).length;

  return (
    <div className="bg-[#f8f7f5] min-h-screen">
      {/* ── HERO ── */}
      <section className="bg-[#0c0a08] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(249,115,22,0.12),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[35%] h-[60%] bg-[radial-gradient(ellipse_60%_80%_at_0%_100%,rgba(249,115,22,0.05),transparent_70%)]" />
        </div>
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.03]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hgrid-hero"
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
          <rect width="100%" height="100%" fill="url(#hgrid-hero)" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-12">
          <div className="flex items-center gap-2 mb-3">
            <LuSparkles className="text-orange-400 text-[11px]" />
            <span className="text-[10px] font-black tracking-[0.22em] uppercase text-orange-400">
              Talent network
            </span>
          </div>
          <h1 className="text-[34px] sm:text-[44px] font-black text-white leading-[1.05] tracking-tight mb-3">
            Find your perfect
            <br />
            <span className="text-orange-500">freelancer</span>
          </h1>
          <p className="text-[14px] text-white/40 max-w-md leading-relaxed mb-8">
            Browse verified professionals across design, development, marketing,
            and more. Every profile is AI-scored for quality.
          </p>

          {/* Stat row */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              {
                value: freelancers.length,
                label: "Freelancers",
              },
              {
                value: freelancers.filter(
                  (f) => f.portfolio?.status === "completed"
                ).length,
                label: "Verified",
              },
              {
                value: allCountries.length,
                label: "Countries",
              },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-[28px] font-black text-white leading-none">
                  {s.value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEARCH + FILTERS ── */}
      <div className="sticky top-15 z-30 bg-white/95 backdrop-blur border-b border-black/6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/25 text-[14px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, skill, or service…"
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-black/10 bg-[#f8f8f8] text-[13px] text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-400 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60"
                >
                  <LuX className="text-[12px]" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12.5px] font-semibold transition-all ${
                activeFilterCount > 0
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-black/10 bg-white text-black/55 hover:border-black/20"
              }`}
            >
              <LuSlidersHorizontal className="text-[13px]" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="hidden sm:block">
              <FilterDropdown
                label="Sort by"
                options={SORT_OPTIONS.map((o) => o.label)}
                selected={
                  SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? null
                }
                onSelect={(v) => {
                  const found = SORT_OPTIONS.find((o) => o.label === v);
                  if (found) setSortBy(found.value);
                }}
              />
            </div>

            {/* Result count */}
            <span className="ml-auto text-[12px] text-black/30 font-medium hidden sm:block whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-3 pb-1 border-t border-black/5 mt-3">
              <button
                onClick={() => setFilterVerified((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[12px] font-semibold transition-all ${
                  filterVerified
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-black/10 bg-white text-black/50 hover:border-black/20"
                }`}
              >
                <LuSparkles className="text-[11px]" />
                Verified only
              </button>

              {allSkills.length > 0 && (
                <FilterDropdown
                  label="Skill"
                  options={allSkills}
                  selected={filterSkill}
                  onSelect={setFilterSkill}
                />
              )}

              {allCountries.length > 0 && (
                <FilterDropdown
                  label="Country"
                  options={allCountries}
                  selected={filterCountry}
                  onSelect={setFilterCountry}
                />
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setFilterVerified(false);
                    setFilterSkill(null);
                    setFilterCountry(null);
                  }}
                  className="text-[12px] font-semibold text-black/35 hover:text-black/60 transition-colors ml-1"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-black/4 flex items-center justify-center text-2xl mb-5">
              <LuCode className="text-black/20 text-2xl" />
            </div>
            <h3 className="text-[18px] font-black text-black mb-2">
              No freelancers found
            </h3>
            <p className="text-[13px] text-black/40 max-w-xs">
              Try adjusting your search or filters to find the right talent.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterVerified(false);
                setFilterSkill(null);
                setFilterCountry(null);
              }}
              className="mt-5 text-[13px] font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((f) => (
                <FreelancerCard key={f._id} freelancer={f} />
              ))}
            </div>
            <p className="text-center text-[12px] text-black/25 mt-10">
              Showing {filtered.length} of {freelancers.length} freelancers
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancersPage;
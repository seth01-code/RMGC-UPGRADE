"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import newRequest from "../../utils/newRequest";

interface TopFreelancer {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  yearsOfExperience?: string;
  gigCount: number;
  portfolio: {
    portfolio_score?: number;
    grade?: string | null;
    headline?: string;
  };
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
    bgColor: string;
    badgeColor: string;
    count: number;
  }
> = {
  "Master Freelancer": {
    label: "Master",
    color: "text-[#F97316]",
    bgColor: "bg-[#F97316]",
    badgeColor: "bg-[#F97316] text-black",
    count: 0,
  },
  "Professional Freelancer": {
    label: "Professional",
    color: "text-white",
    bgColor: "bg-white",
    badgeColor: "bg-white text-black",
    count: 0,
  },
  "Associate Freelancer": {
    label: "Associate",
    color: "text-[#FB923C]",
    bgColor: "bg-[#C2410C]",
    badgeColor: "bg-[#C2410C] text-white",
    count: 0,
  },
};

const DEFAULT_STYLE = {
  ring: "ring-white/15",
  seal: "bg-white/10",
  sealText: "text-white/70",
  label: "text-white/40",
};

const Slider: React.FC = () => {
  const [allFreelancers, setAllFreelancers] = useState<TopFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TierType | "all">("all");

  useEffect(() => {
    let cancelled = false;
    const fetchTop = async () => {
      try {
        const res = await newRequest.get("/portfolio/top");
        if (!cancelled) {
          const freelancers = res.data.users || [];
          setAllFreelancers(freelancers);
        }
      } catch (err) {
        console.error("Failed to load top freelancers:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTop();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && allFreelancers.length === 0) return null;

  // Group freelancers by tier
  const grouped: Record<TierType, TopFreelancer[]> = {
    "Master Freelancer": [],
    "Professional Freelancer": [],
    "Associate Freelancer": [],
  };

  allFreelancers.forEach((freelancer) => {
    const grade = freelancer.portfolio?.grade as TierType;
    if (grade && grouped[grade]) {
      grouped[grade].push(freelancer);
    }
  });

  // Get display data based on active tab
  const getDisplayData = () => {
    if (activeTab === "all") {
      // Show first 3 from each tier
      const result: TopFreelancer[] = [];
      Object.values(grouped).forEach((tier) => {
        result.push(...tier.slice(0, 3));
      });
      return result;
    } else {
      return grouped[activeTab].slice(0, 3);
    }
  };

  const displayFreelancers = getDisplayData();
  const tiers = Object.keys(grouped) as TierType[];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(249,115,22,0.28),transparent_70%)]" />

      <div className="relative mb-12">
        <div className="mb-8">
          <p
            className="text-[11px] font-semibold tracking-[0.25em] text-[#F97316] uppercase mb-3"
            style={{
              fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
            }}
          >
            Verified by portfolio review
          </p>
          <h2
            className="text-[28px] sm:text-[34px] leading-[1.1] font-medium text-black"
            style={{
              fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)",
            }}
          >
            The marketplace&apos;s top-rated talent
          </h2>
          <p className="mt-2 text-[13px] text-black/45 max-w-md">
            Every profile here cleared a portfolio review. Tier reflects
            portfolio strength, not popularity.
          </p>
        </div>

        {/* Tier Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-black text-white"
                : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            All tiers {`(${allFreelancers.length})`}
          </button>

          {tiers.map((tier) => {
            const tierCount = grouped[tier].length;
            return (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  activeTab === tier
                    ? `${TIER_CONFIG[tier].bgColor} ${
                        tier === "Professional Freelancer" ? "text-black" : ""
                      } ${
                        tier === "Master Freelancer" ? "text-black" : ""
                      } ${tier === "Associate Freelancer" ? "text-white" : ""}`
                    : "bg-black/5 text-black hover:bg-black/10"
                }`}
              >
                {TIER_CONFIG[tier].label} {`(${tierCount})`}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-[16px] bg-black/5 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {displayFreelancers.map((user) => {
              const grade = user.portfolio?.grade as TierType;
              const config = grade ? TIER_CONFIG[grade] : null;
              const scorePct = Math.round(
                (user.portfolio?.portfolio_score || 0) * 100,
              );

              return (
                <Link key={user._id} href={`/profile/${user._id}`}>
                  <div className="group relative h-80 rounded-[16px] overflow-hidden bg-[#16130F] border border-white/8 transition-all duration-300 hover:border-white/15 cursor-pointer">
                    {user.img ? (
                      <Image
                        src={user.img}
                        alt={user.username}
                        fill
                        className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1C1812]">
                        <span
                          className="text-[56px] text-white/15 font-medium"
                          style={{
                            fontFamily:
                              "var(--font-display, 'Fraunces', Georgia, serif)",
                          }}
                        >
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Overlay gradients */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                    {/* Tier Badge */}
                    {grade && config && (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-full ${config.badgeColor} flex items-center justify-center shrink-0 font-semibold text-[12px]`}
                          style={{
                            fontFamily:
                              "var(--font-mono, 'IBM Plex Mono', monospace)",
                          }}
                        >
                          {scorePct}%
                        </div>
                        <span
                          className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    )}

                    {/* Gig count */}
                    <div className="absolute top-4 right-4 text-right">
                      <span
                        className="text-[20px] font-medium text-white/95 leading-none"
                        style={{
                          fontFamily:
                            "var(--font-display, 'Fraunces', Georgia, serif)",
                        }}
                      >
                        {user.gigCount}
                      </span>
                      <p className="text-[9px] tracking-[0.15em] uppercase text-white/40 mt-0.5">
                        {user.gigCount === 1 ? "Gig live" : "Gigs live"}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3
                        className="text-[16px] font-medium text-white leading-snug"
                        style={{
                          fontFamily:
                            "var(--font-display, 'Fraunces', Georgia, serif)",
                        }}
                      >
                        {user.username}
                      </h3>
                      {user.portfolio?.headline && (
                        <p className="text-white/60 text-[12px] mt-1 line-clamp-2">
                          {user.portfolio.headline}
                        </p>
                      )}
                      <div className="mt-3 h-px w-8 bg-white/20 group-hover:w-12 group-hover:bg-[#F97316]/70 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* See more button */}
          <div className="flex justify-center">
            <Link
              href={
                activeTab === "all"
                  ? "/profile"
                  : `/profile?tier=${encodeURIComponent(activeTab)}`
              }
            >
              <button className="px-6 py-3 bg-[#F97316] text-black font-medium text-[14px] rounded-lg hover:bg-[#F97316]/90 transition-colors">
                See all{" "}
                {activeTab === "all"
                  ? "freelancers"
                  : `${TIER_CONFIG[activeTab as TierType]?.label} freelancers`}
              </button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default Slider;

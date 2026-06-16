"use client";

import React, { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import { IoMdStar } from "react-icons/io";
import { MdMessage, MdVerified } from "react-icons/md";
import { FaCheckDouble, FaGlobe, FaRegCalendarAlt, FaBriefcase, FaLanguage, FaAward } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { TbRefresh } from "react-icons/tb";
import { LuClock4, LuCode, LuLayers, LuBuilding2, LuChevronDown, LuChevronUp, LuSparkles } from "react-icons/lu";
import Link from "next/link";
import moment from "moment";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import Image from "next/image";

interface GigData {
  _id: string;
  title: string;
  shortTitle: string;
  shortDesc: string;
  desc: string;
  price: number;
  cat: string;
  userId: string;
  totalStars: number;
  starNumber: number;
  deliveryTime: number;
  revisionNumber: number;
  features: string[];
  images?: string[];
  videos?: string[];
  documents?: string[];
}

interface PortfolioProject {
  name: string;
  description: string;
  technologies: string[];
  outcomes: string | null;
  industry?: string;
}

interface Portfolio {
  status: "completed" | "processing" | "failed";
  analyzedAt?: string;
  headline?: string;
  summary?: string;
  experience?: number;
  skills?: string[];
  services?: string[];
  industries?: string[];
  certifications?: string[];
  projects?: PortfolioProject[];
  portfolioScore?: number;
  confidence_score?: number;
}

interface UserData {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
  languages?: string[];
  yearsOfExperience?: number;
  createdAt: string;
  portfolio?: Portfolio | null;
}

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

const GigSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full h-[420px] md:h-[520px] bg-[#111]" />
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="h-2.5 w-20 bg-[#e8e8e8] rounded-full" />
        <div className="h-9 w-3/4 bg-[#ebebeb] rounded-xl" />
        <div className="flex gap-3 items-center mt-1">
          <div className="w-11 h-11 rounded-full bg-[#e8e8e8]" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-24 bg-[#e8e8e8] rounded-full" />
            <div className="h-2 w-16 bg-[#f0f0f0] rounded-full" />
          </div>
        </div>
        <div className="space-y-2.5 mt-3">
          {[88, 76, 68, 54].map((w) => (
            <div key={w} className="h-2.5 bg-[#f0f0f0] rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="h-80 bg-[#ebebeb] rounded-2xl" />
    </div>
  </div>
);

const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const filled = Math.round(rating);
  const sz = size === "md" ? "text-[17px]" : "text-[13px]";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IoMdStar key={i} className={`${sz} ${i < filled ? "text-amber-400" : "text-[#e0e0e0]"}`} />
      ))}
    </div>
  );
};

const FreelancerPortfolio = ({ portfolio, username }: { portfolio: Portfolio; username: string }) => {
  const [openProject, setOpenProject] = useState<number | null>(null);
  if (portfolio.status !== "completed") return null;

  const hasSkills     = (portfolio.skills?.length ?? 0) > 0;
  const hasServices   = (portfolio.services?.length ?? 0) > 0;
  const hasProjects   = (portfolio.projects?.length ?? 0) > 0;
  const hasCerts      = (portfolio.certifications?.length ?? 0) > 0;
  const hasIndustries = (portfolio.industries?.length ?? 0) > 0;
  const score         = portfolio.portfolioScore ?? (portfolio.confidence_score ? Math.round(portfolio.confidence_score * 100) : null);

  return (
    <div className="mt-2 flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#efefef]">

      {/* ── Hero band ── */}
      <div className="bg-[#0a0a0a] px-6 py-6 relative overflow-hidden">
        {/* Subtle grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
          <defs>
            <pattern id="pgrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="#fff" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pgrid)"/>
        </svg>

        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                <LuSparkles className="text-white text-[13px]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Verified Portfolio</p>
            </div>
            {portfolio.headline && (
              <h3 className="text-[18px] font-black text-white leading-tight tracking-tight max-w-xs">
                {portfolio.headline}
              </h3>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {portfolio.experience && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/60">
                  <FaBriefcase className="text-[10px] text-orange-400" />
                  {portfolio.experience}+ years
                </span>
              )}
              {portfolio.analyzedAt && (
                <span className="text-[10px] text-white/30 font-medium">
                  Verified {new Date(portfolio.analyzedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Score ring */}
          {score !== null && (
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a1a" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="#f97316" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] font-black text-white">{score}</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-1">Score</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {portfolio.summary && (
          <p className="relative z-10 mt-4 text-[12.5px] text-white/50 leading-relaxed border-t border-white/5 pt-4">
            {portfolio.summary}
          </p>
        )}
      </div>

      {/* ── Skills ── */}
      {hasSkills && (
        <div className="px-6 py-5 border-b border-[#f5f5f5] bg-white">
          <div className="flex items-center gap-2 mb-3">
            <LuCode className="text-orange-500 text-[14px]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bbb]">Skills</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills!.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-[#f7f7f7] text-[#333] text-[11.5px] font-semibold rounded-lg border border-[#eee] hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Services ── */}
      {hasServices && (
        <div className="px-6 py-5 border-b border-[#f5f5f5] bg-[#fafafa]">
          <div className="flex items-center gap-2 mb-3">
            <LuLayers className="text-orange-500 text-[14px]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bbb]">Services offered</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {portfolio.services!.map((s) => (
              <div key={s} className="flex items-center gap-2 text-[12.5px] text-[#444]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {hasProjects && (
        <div className="px-6 py-5 border-b border-[#f5f5f5] bg-white">
          <div className="flex items-center gap-2 mb-3">
            <FaBriefcase className="text-orange-500 text-[13px]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bbb]">
              Projects ({portfolio.projects!.length})
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {portfolio.projects!.map((project, i) => {
              const isOpen = openProject === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-orange-200 bg-orange-50/30" : "border-[#efefef] bg-[#fafafa] hover:border-[#e0e0e0]"
                  }`}
                >
                  <button
                    onClick={() => setOpenProject(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    {/* Number */}
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                      isOpen ? "bg-orange-500 text-white" : "bg-[#eee] text-[#aaa]"
                    }`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[13px] font-bold text-[#111] truncate">{project.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {project.industry && (
                        <span className="hidden sm:inline-flex text-[10px] font-bold text-[#aaa] bg-white border border-[#eee] px-2 py-0.5 rounded-full">
                          {project.industry}
                        </span>
                      )}
                      {project.outcomes && (
                        <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          ↗ {project.outcomes}
                        </span>
                      )}
                      {isOpen
                        ? <LuChevronUp className="text-[#ccc] text-[13px]" />
                        : <LuChevronDown className="text-[#ccc] text-[13px]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-orange-100 pt-3">
                      <p className="text-[12.5px] text-[#555] leading-relaxed">{project.description}</p>
                      {project.outcomes && (
                        <span className="sm:hidden inline-flex text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-full w-fit">
                          ↗ {project.outcomes}
                        </span>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="px-2.5 py-1 bg-[#111] text-white text-[10.5px] font-semibold rounded-md">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Industries + Certifications ── */}
      {(hasIndustries || hasCerts) && (
        <div className={`grid gap-0 divide-x divide-[#f5f5f5] ${hasIndustries && hasCerts ? "grid-cols-2" : "grid-cols-1"} bg-[#fafafa]`}>
          {hasIndustries && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <LuBuilding2 className="text-orange-500 text-[14px]" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bbb]">Industries</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {portfolio.industries!.map((ind) => (
                  <span key={ind} className="px-3 py-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hasCerts && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <FaAward className="text-orange-500 text-[13px]" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#bbb]">Certifications</p>
              </div>
              <div className="flex flex-col gap-2">
                {portfolio.certifications!.map((cert) => (
                  <div key={cert} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-[5px] flex-shrink-0" />
                    <p className="text-[12px] text-[#444] font-medium leading-snug">{cert}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="bg-[#0a0a0a] px-6 py-3 flex items-center justify-between">
        <p className="text-[10px] text-white/20 font-medium">
          Portfolio extracted and verified by RMGC
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <p className="text-[10px] text-white/30 font-semibold">Contact info removed</p>
        </div>
      </div>
    </div>
  );
};

const GigPage: React.FC = () => {
  const params   = useParams();
  const router   = useRouter();
  const gigId    = params.id as string;
  const [activeTab, setActiveTab] = useState<"about" | "freelancer">("about");

  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery<GigData>({
    queryKey: ["gig", gigId],
    queryFn: () => newRequest.get(`/gigs/single/${gigId}`).then((r) => r.data),
    enabled: !!gigId,
  });

  const { data: dataUser, isLoading: isLoadingUser } = useQuery<UserData>({
    queryKey: ["user", data?.userId],
    queryFn: () =>
      data?.userId
        ? newRequest.get(`/users/${data.userId}`).then((r) => r.data)
        : Promise.resolve(undefined),
    enabled: !!data?.userId,
  });

  const { data: userData } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: () => newRequest.get("/users/me").then((r) => r.data),
  });

  const { exchangeRate, currencySymbol } = useExchangeRate(userData?.country || "United States");

  const handleContact = async () => {
    if (!currentUser?.id || !data?.userId || currentUser.isSeller) return;
    try {
      await newRequest.post("/conversations", { userId: currentUser.id, otherUserId: data.userId });
      router.push("/chat");
    } catch (err) {
      console.error("Error contacting freelancer:", err);
    }
  };

  const memberSince    = dataUser ? moment(dataUser.createdAt).format("MMM YYYY") : "";
  const rating         = data && data.starNumber > 0 ? data.totalStars / data.starNumber : null;
  const allMedia       = data ? [...(data.images || []), ...(data.videos || []), ...(data.documents || [])] : [];
  const formattedPrice = data
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(data.price * exchangeRate)
    : "";

  // Read AI-extracted portfolio from user.portfolio (Mixed field)
  const portfolio = dataUser?.portfolio as Portfolio | null | undefined;
  const hasPortfolio = portfolio && !Array.isArray(portfolio) && portfolio.status === "completed";

  if (isLoading) return <GigSkeleton />;

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="max-w-sm w-full text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">⚠</span>
          </div>
          <h2 className="text-[17px] font-bold text-[#111] mb-1">Couldn&apos;t load this gig</h2>
          <p className="text-[13px] text-[#aaa] mb-5">Try refreshing the page or come back shortly.</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-orange-500 text-white text-[13px] font-bold rounded-xl hover:bg-orange-600 transition">
            Refresh
          </button>
        </div>
      </div>
    );

  return (
    <>
      {/* ── HERO MEDIA ── */}
      <div className="relative w-full bg-[#0a0a0a] select-none overflow-hidden">
        {allMedia.length > 0 ? (
          <>
            <div ref={prevRef} className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-black/70 transition text-white text-xl font-light leading-none">‹</div>
            <div ref={nextRef} className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-black/70 transition text-white text-xl font-light leading-none">›</div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-5 right-5 z-20 bg-orange-500 text-white px-4 py-2.5 rounded-2xl shadow-xl shadow-orange-900/30">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-80 mb-0.5">Starting at</p>
              <p className="text-[22px] font-black leading-none tracking-tight">{currencySymbol} {formattedPrice}</p>
            </div>
            <div className="absolute bottom-5 left-5 z-20">
              <Link href={`/allgigs?cat=${data.cat}`} className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold px-3.5 py-2 rounded-full hover:bg-white/20 transition">
                {data.cat}<HiArrowRight className="text-[10px] opacity-70" />
              </Link>
            </div>
            <Swiper
              spaceBetween={0} slidesPerView={1}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              pagination={{ clickable: true, bulletActiveClass: "!bg-orange-500 !opacity-100 !w-4 !rounded-sm", bulletClass: "swiper-pagination-bullet !bg-white !opacity-30 transition-all duration-200" }}
              onBeforeInit={(swiper) => { const nav = swiper.params.navigation as any; nav.prevEl = prevRef.current; nav.nextEl = nextRef.current; }}
              modules={[Navigation, SwiperPagination]}
              className="w-full h-[380px] md:h-[520px] [&_.swiper-wrapper]:h-full [&_.swiper-slide]:h-full [&_.swiper-pagination]:bottom-14"
            >
              {allMedia.map((fileUrl, i) => {
                const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(fileUrl);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
                const isPDF   = /\.pdf$/i.test(fileUrl);
                return (
                  <SwiperSlide key={i} className="relative !h-full">
                    {isImage ? <Image src={fileUrl} alt={`Media ${i + 1}`} fill className="object-contain" sizes="100vw" unoptimized />
                    : isVideo ? <video src={fileUrl} controls className="w-full h-full object-contain" />
                    : isPDF   ? <iframe src={fileUrl} className="w-full h-full" />
                    : <div className="flex items-center justify-center h-full text-white/30 text-sm">Unsupported format</div>}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </>
        ) : (
          <div className="w-full h-[240px] flex items-center justify-center text-white/20 text-sm tracking-wider">No media provided</div>
        )}
      </div>

      {/* ── PAGE BODY ── */}
      <div className="bg-[#f5f5f5] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 flex flex-col gap-7">

            {/* Title + freelancer row */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[27px] md:text-[33px] font-black text-[#0a0a0a] leading-[1.2] tracking-tight">{data.title}</h1>
              {!isLoadingUser && dataUser && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative shrink-0 w-10 h-10">
                    <Image src={dataUser.img || FALLBACK_AVATAR} alt={dataUser.username} fill className="rounded-full object-cover ring-2 ring-orange-200 ring-offset-1" sizes="40px" unoptimized />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-[#111] leading-none">{dataUser.username}</p>
                    {dataUser.country && (
                      <p className="text-[11px] text-[#aaa] mt-0.5 flex items-center gap-1">
                        <FaGlobe className="text-[9px]" /> {dataUser.country}
                      </p>
                    )}
                  </div>
                  {rating !== null && (
                    <div className="ml-auto flex items-center gap-1.5 bg-white border border-[#ececec] px-3 py-1.5 rounded-xl shadow-sm">
                      <StarRating rating={rating} />
                      <span className="text-[12px] font-black text-[#111]">{rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-[#e5e5e5]">
              {(["about", "freelancer"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-[12.5px] font-bold capitalize tracking-wide border-b-2 -mb-px transition-all ${
                    activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-[#999] hover:text-[#555]"
                  }`}
                >
                  {tab === "about" ? "About this gig" : (
                    <span className="flex items-center gap-1.5">
                      About the freelancer
                      {hasPortfolio && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          <LuSparkles className="text-[9px]" />
                        </span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab: About */}
            {activeTab === "about" && (
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
                  <p className="text-[13.5px] text-[#555] leading-[1.8] whitespace-pre-line break-words">{data.desc}</p>
                </div>
                {data.features.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
                    <p className="text-[9.5px] font-black tracking-[0.2em] text-orange-500 uppercase mb-4">What&apos;s included</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-[13px] text-[#444]">
                          <FaCheckDouble className="text-orange-500 mt-[3px] shrink-0 text-[10px]" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0f0f0]">
                  <p className="text-[9.5px] font-black tracking-[0.2em] text-orange-500 uppercase mb-4">Reviews</p>
                  <Reviews gigId={gigId} />
                </div>
              </div>
            )}

            {/* Tab: Freelancer */}
            {activeTab === "freelancer" && dataUser && (
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                  {/* Profile header */}
                  <div className="bg-[#0a0a0a] px-6 pt-6 pb-16 relative">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0 w-[72px] h-[72px]">
                        <Image src={dataUser.img || FALLBACK_AVATAR} alt={dataUser.username} fill className="rounded-2xl object-cover ring-2 ring-white/20" sizes="72px" unoptimized />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[17px] font-black text-white leading-none">{dataUser.username}</p>
                          <MdVerified className="text-orange-400 text-[15px] shrink-0" />
                        </div>
                        {hasPortfolio && portfolio.headline ? (
                          <p className="text-[12px] text-white/60 leading-snug mt-0.5">{portfolio.headline}</p>
                        ) : dataUser.desc ? (
                          <p className="text-[12px] text-white/60 leading-snug mt-0.5 line-clamp-2">{dataUser.desc}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Stats strip */}
                  <div className="mx-5 -mt-8 mb-1 relative z-10">
                    <div className="bg-white rounded-2xl border border-[#efefef] shadow-md grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#f5f5f5]">
                      {[
                        { icon: <FaGlobe className="text-[11px]" />, label: "From", value: dataUser.country || "—" },
                        { icon: <FaRegCalendarAlt className="text-[11px]" />, label: "Member since", value: memberSince || "—" },
                        { icon: <FaLanguage className="text-[11px]" />, label: "Languages", value: dataUser.languages?.join(", ") || "—" },
                        { icon: <FaBriefcase className="text-[11px]" />, label: "Experience", value: dataUser.yearsOfExperience ? `${dataUser.yearsOfExperience} yrs` : "—" },
                      ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-0.5 px-4 py-3.5">
                          <p className="text-[9px] font-black tracking-[0.15em] text-[#ccc] uppercase flex items-center gap-1">{stat.icon} {stat.label}</p>
                          <p className="text-[12.5px] font-bold text-[#222] truncate">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio + contact */}
                  <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
                    <p className="text-[13px] text-[#666] leading-relaxed">
                      {dataUser.desc || "This freelancer hasn't added a bio yet."}
                    </p>
                    <button
                      onClick={handleContact}
                      className="self-start flex items-center gap-2 text-[12.5px] font-bold px-4 py-2.5 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#222] transition"
                    >
                      <MdMessage className="text-[14px]" />
                      Message freelancer
                    </button>
                  </div>
                </div>

                {/* Portfolio display */}
                {hasPortfolio && (
                  <FreelancerPortfolio portfolio={portfolio!} username={dataUser.username} />
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:sticky lg:top-28 h-fit flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-lg border border-[#ececec] overflow-hidden">
              <div className="bg-[#0a0a0a] px-6 py-5">
                <p className="text-[9px] font-bold tracking-[0.25em] text-orange-400 uppercase mb-1">{data.shortTitle}</p>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-[32px] font-black text-white leading-none tracking-tight">{currencySymbol} {formattedPrice}</p>
                  {rating !== null && (
                    <div className="flex items-center gap-1 pb-0.5">
                      <StarRating rating={rating} size="sm" />
                      <span className="text-[11px] text-white/50 font-bold">{rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col gap-5">
                <p className="text-[13px] text-[#666] leading-relaxed">{data.shortDesc}</p>
                <div className="flex items-center justify-between text-[12.5px] font-semibold text-[#444]">
                  <div className="flex items-center gap-1.5">
                    <LuClock4 className="text-orange-500 text-[15px]" />
                    <span>{data.deliveryTime}-day delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TbRefresh className="text-orange-500 text-[15px]" />
                    <span>{data.revisionNumber} revision{data.revisionNumber !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="h-px bg-[#f5f5f5]" />
                {data.features.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    {data.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12.5px] text-[#555]">
                        <FaCheckDouble className="text-orange-500 mt-[3px] shrink-0 text-[9px]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link href={`/pay/${gigId}`} className="block mt-1">
                  <button className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-[14px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-100">
                    Continue <HiArrowRight className="text-[15px]" />
                  </button>
                </Link>
                {!currentUser?.isSeller && (
                  <button onClick={handleContact} className="w-full flex items-center justify-center gap-2 text-[12.5px] font-bold text-[#999] hover:text-orange-500 transition py-0.5">
                    <MdMessage className="text-[14px]" /> Ask a question
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-[10.5px] text-[#c0c0c0] font-semibold px-2">
              <span>✓ Secure payment</span><span>·</span>
              <span>✓ Verified freelancer</span><span>·</span>
              <span>✓ Refund policy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GigPage;
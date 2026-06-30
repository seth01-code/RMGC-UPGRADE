/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../seller/components/SellerReviews";
import { IoMdStar } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import { FaCheckDouble, FaGlobe, FaRegCalendarAlt } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import { TbRefresh } from "react-icons/tb";
import {
  LuClock4,
  LuBriefcase,
  LuLayers,
  LuAward,
  LuCircleCheck,
  LuFolderOpen,
} from "react-icons/lu";
import Link from "next/link";
import moment from "moment";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import Image from "next/image";
import Footer from "@/app/components/footer";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface PortfolioProject {
  name: string;
  description: string;
  technologies: string[];
  outcomes: string;
}

interface Portfolio {
  status: "pending" | "processing" | "completed" | "failed";
  headline?: string;
  experience?: number;
  skills?: string[];
  services?: string[];
  industries?: string[];
  certifications?: string[];
  projects?: PortfolioProject[];
  confidence_score?: number;
  analyzedAt?: string;
}

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

interface UserData {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
  languages?: string[];
  yearsOfExperience?: number;
  createdAt: string;
  portfolio?: Portfolio;
}

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

const GigSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-0">
    <div className="w-full h-105 md:h-125 bg-neutral-100" />
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="h-3 w-24 bg-neutral-100 rounded-full" />
        <div className="h-8 w-3/4 bg-neutral-200 rounded-xl" />
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100" />
          <div className="h-3 w-28 bg-neutral-100 rounded-full" />
        </div>
        <div className="space-y-2 mt-4">
          {[90, 82, 74, 60].map((w) => (
            <div
              key={w}
              className="h-3 bg-neutral-100 rounded-full"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
      <div className="h-72 bg-neutral-100 rounded-2xl" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => {
  const filled = Math.round(rating);
  const sz = size === "md" ? "text-[18px]" : "text-[14px]";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IoMdStar
          key={i}
          className={`${sz} ${i < filled ? "text-amber-400" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// PORTFOLIO SECTION (shown inside About tab)
// ─────────────────────────────────────────────

const PortfolioSection = ({ portfolio }: { portfolio: Portfolio }) => {
  if (portfolio.status !== "completed") return null;

  return (
    <div className="flex flex-col gap-5 mt-6 pt-6 border-t border-neutral-100">
      {portfolio.skills && portfolio.skills.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-3 flex items-center gap-1.5">
            <LuLayers className="text-[12px]" /> Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {portfolio.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold bg-neutral-50 border border-neutral-200 text-neutral-700 px-2.5 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {portfolio.industries && portfolio.industries.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-3 flex items-center gap-1.5">
            <LuBriefcase className="text-[12px]" /> Industries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {portfolio.industries.map((ind, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      )}

      {portfolio.certifications && portfolio.certifications.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-3 flex items-center gap-1.5">
            <LuAward className="text-[12px]" /> Certifications
          </p>
          <div className="flex flex-col gap-2">
            {portfolio.certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] text-neutral-700"
              >
                <LuCircleCheck className="text-green-500 text-[13px] shrink-0" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      )}

      {portfolio.projects && portfolio.projects.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-3 flex items-center gap-1.5">
            <LuFolderOpen className="text-[12px]" /> Selected Projects
          </p>
          <div className="flex flex-col gap-3">
            {portfolio.projects.map((proj, i) => (
              <div
                key={i}
                className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 flex flex-col gap-2"
              >
                <p className="text-[13px] font-bold text-neutral-900">
                  {proj.name}
                </p>
                {proj.description && (
                  <p className="text-[12px] text-neutral-500 leading-relaxed">
                    {proj.description}
                  </p>
                )}
                {proj.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.map((tech, ti) => (
                      <span
                        key={ti}
                        className="text-[10px] font-bold bg-white border border-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {proj.outcomes && (
                  <p className="text-[11px] font-semibold text-green-600">
                    ↗ {proj.outcomes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const GigDetails: React.FC = () => {
  const params = useParams();
  const gigId = params.id as string;
  const [activeTab, setActiveTab] = useState<"about" | "seller">("about");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

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

  const { exchangeRate, currencySymbol } = useExchangeRate(
    userData?.country || "United States",
  );

  const memberSince = dataUser
    ? moment(dataUser.createdAt).format("MMM YYYY")
    : "";
  const rating =
    data && data.starNumber > 0 ? data.totalStars / data.starNumber : null;
  const allMedia = data
    ? [
        ...(data.images || []),
        ...(data.videos || []),
        ...(data.documents || []),
      ]
    : [];
  const formattedPrice = data
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        data.price * exchangeRate,
      )
    : "";

  const hasPortfolio = dataUser?.portfolio?.status === "completed";
  const backHref = currentUser?.isAdmin ? "/admin" : "/seller";
  const sellerTabLabel = currentUser?.isAdmin
    ? "About the Freelancer"
    : "About Me";

  if (isLoading) return <GigSkeleton />;

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="max-w-sm w-full text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠</span>
          </div>
          <h2 className="text-[17px] font-bold text-neutral-900 mb-1">
            Couldn&apos;t load this gig
          </h2>
          <p className="text-[13px] text-neutral-400">
            Try refreshing the page or come back shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-[#f97316] text-white text-[13px] font-bold rounded-xl hover:bg-orange-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* ── HERO MEDIA ── */}
      <div className="relative w-full bg-neutral-950 select-none">
        <div className="absolute top-4 left-4 z-20">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/15 text-white text-[11px] font-semibold px-3.5 py-2 rounded-full hover:bg-black/60 transition"
          >
            <HiArrowLeft className="text-[12px]" />
            Back
          </Link>
        </div>

        {allMedia.length > 0 ? (
          <>
            <div
              ref={prevRef}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full cursor-pointer hover:bg-white/20 transition text-white text-lg"
            >
              ‹
            </div>
            <div
              ref={nextRef}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full cursor-pointer hover:bg-white/20 transition text-white text-lg"
            >
              ›
            </div>

            <div className="absolute bottom-4 right-4 z-20 bg-[#f97316] text-white px-4 py-2.5 rounded-2xl">
              <p className="text-[10px] font-semibold tracking-widest uppercase opacity-75 mb-0.5">
                Listed at
              </p>
              <p className="text-[20px] font-black leading-none tracking-tight">
                {currencySymbol} {formattedPrice}
              </p>
            </div>

            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              pagination={{
                clickable: true,
                bulletActiveClass: "!bg-orange-500 !opacity-100",
                bulletClass: "swiper-pagination-bullet !bg-white !opacity-40",
              }}
              onBeforeInit={(swiper) => {
                if (typeof swiper.params.navigation !== "boolean") {
                  const nav = swiper.params.navigation as any;
                  nav.prevEl = prevRef.current;
                  nav.nextEl = nextRef.current;
                }
              }}
              modules={[Navigation, SwiperPagination]}
              className="w-full h-85 md:h-115 [&_.swiper-wrapper]:h-full [&_.swiper-slide]:h-full"
            >
              {allMedia.map((fileUrl, i) => {
                const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(fileUrl);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
                const isPDF = /\.pdf$/i.test(fileUrl);
                return (
                  <SwiperSlide key={i} className="relative h-full!">
                    {isImage ? (
                      <Image
                        src={fileUrl}
                        alt={`Media ${i + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        unoptimized
                      />
                    ) : isVideo ? (
                      <video
                        src={fileUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : isPDF ? (
                      <iframe src={fileUrl} className="w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/40 text-sm">
                        Unsupported format
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </>
        ) : (
          <div className="w-full h-60 flex items-center justify-center text-white/30 text-sm">
            No media uploaded yet
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT ── */}
          <div className="lg:col-span-2 flex flex-col gap-7">
            {/* Title + author */}
            <div className="flex flex-col gap-4">
              {data.cat && (
                <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#f97316]">
                  {data.cat}
                </span>
              )}
              <h1 className="text-[24px] md:text-[30px] font-black text-neutral-900 leading-tight tracking-tight">
                {data.title}
              </h1>

              {!isLoadingUser && dataUser && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-9 h-9 shrink-0">
                    <Image
                      src={dataUser.img || FALLBACK_AVATAR}
                      alt={dataUser.username}
                      fill
                      className="rounded-full object-cover ring-2 ring-orange-200"
                      sizes="36px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-[13px] font-bold text-neutral-900">
                        {dataUser.username}
                      </p>
                      <MdVerified className="text-[#f97316] text-[12px]" />
                    </div>
                    {dataUser.country && (
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <FaGlobe className="text-[9px]" /> {dataUser.country}
                      </p>
                    )}
                  </div>
                  {rating !== null && (
                    <div className="ml-auto flex items-center gap-1.5 bg-white border border-neutral-100 px-3 py-1.5 rounded-xl">
                      <StarRating rating={rating} />
                      <span className="text-[12px] font-bold text-neutral-900">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200">
              {(["about", "seller"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-[12px] font-bold capitalize tracking-wide border-b-2 -mb-px transition-all ${
                    activeTab === tab
                      ? "border-[#f97316] text-[#f97316]"
                      : "border-transparent text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab === "about" ? "Gig details" : sellerTabLabel}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            {activeTab === "about" ? (
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl p-6 border border-neutral-100">
                  <p className="text-[14px] text-neutral-500 leading-relaxed whitespace-pre-line wrap-break-word">
                    {data.desc}
                  </p>
                </div>

                {data.features.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-neutral-100">
                    <p className="text-[11px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-4">
                      What&apos;s included
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.features.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-[13px] text-neutral-600"
                        >
                          <FaCheckDouble className="text-[#f97316] mt-0.5 shrink-0 text-[11px]" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 border border-neutral-100">
                  <p className="text-[11px] font-bold tracking-[0.15em] text-[#f97316] uppercase mb-4">
                    Buyer reviews
                  </p>
                  <Reviews gigId={gigId} />
                </div>
              </div>
            ) : (
              // ── SELLER / FREELANCER TAB ──
              dataUser && (
                <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                  {/* Cover + avatar */}
                  <div className="relative h-24 bg-neutral-900">
                    <div className="absolute inset-0 bg-[#f97316]/10" />
                    <div className="absolute -bottom-9 left-6">
                      <div className="relative w-18 h-18 rounded-2xl overflow-hidden ring-4 ring-white shadow-md">
                        <Image
                          src={dataUser.img || FALLBACK_AVATAR}
                          alt={dataUser.username}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-14 px-6 pb-6">
                    {/* Name + bio */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[16px] font-black text-neutral-900">
                            {dataUser.username}
                          </p>
                          <MdVerified className="text-[#f97316] text-[14px]" />
                        </div>
                        <p className="text-[13px] text-neutral-500 mt-1 max-w-md leading-relaxed">
                          {dataUser.desc || "No bio added yet."}
                        </p>
                      </div>
                      {rating !== null && (
                        <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 px-3 py-2 rounded-xl shrink-0">
                          <StarRating rating={rating} size="md" />
                          <span className="text-[13px] font-bold text-neutral-900">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-5">
                      {[
                        {
                          icon: <FaGlobe className="text-[11px]" />,
                          label: "From",
                          value: dataUser.country || "—",
                        },
                        {
                          icon: <FaRegCalendarAlt className="text-[11px]" />,
                          label: "Member since",
                          value: memberSince || "—",
                        },
                        {
                          icon: <FaGlobe className="text-[11px]" />,
                          label: "Languages",
                          value: dataUser.languages?.join(", ") || "—",
                        },
                        {
                          icon: <LuBriefcase className="text-[11px]" />,
                          label: "Experience",
                          value: dataUser.yearsOfExperience
                            ? `${dataUser.yearsOfExperience} yrs`
                            : "—",
                        },
                      ].map((stat) => (
                        <div key={stat.label} className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold tracking-wider text-neutral-300 uppercase flex items-center gap-1">
                            {stat.icon} {stat.label}
                          </p>
                          <p className="text-[13px] font-semibold text-neutral-700 truncate">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Portfolio section */}
                    {hasPortfolio && (
                      <PortfolioSection portfolio={dataUser.portfolio!} />
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* ── RIGHT — order card ── */}
          <div className="lg:sticky lg:top-6 h-fit flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-900 px-5 py-5">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#f97316] uppercase mb-1">
                  {data.shortTitle}
                </p>
                <div className="flex items-end justify-between gap-2">
                  <p className="text-[28px] font-black text-white leading-none tracking-tight">
                    {currencySymbol} {formattedPrice}
                  </p>
                  {rating !== null && (
                    <div className="flex items-center gap-1 pb-0.5">
                      <StarRating rating={rating} />
                      <span className="text-[11px] text-white/60 font-semibold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-5 flex flex-col gap-5">
                <p className="text-[13px] text-neutral-500 leading-relaxed">
                  {data.shortDesc}
                </p>

                <div className="flex items-center justify-between text-[12px] font-semibold text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <LuClock4 className="text-[#f97316] text-[14px]" />
                    <span>{data.deliveryTime}-day delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TbRefresh className="text-[#f97316] text-[14px]" />
                    <span>
                      {data.revisionNumber} revision
                      {data.revisionNumber !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-neutral-100" />

                {data.features.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    {data.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[12px] text-neutral-500"
                      >
                        <FaCheckDouble className="text-[#f97316] mt-0.5 shrink-0 text-[10px]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GigDetails;

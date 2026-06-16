// GigCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import starIcon from "../../../assets/images/star.png";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";

export interface Gig {
  _id: string;
  title?: string;
  cover: string;
  price: number;
  desc?: string;
  totalStars?: number;
  starNumber?: number;
  userId: string;
  cat?: string;
}

interface User {
  username: string;
  img?: string;
  country?: string;
}

const GigCard: React.FC<{ item: Gig }> = ({ item }) => {
  const { t } = useTranslation();

  const { isLoading: gigUserLoading, error: gigUserError, data: gigUserData } =
    useQuery<User>({
      queryKey: ["gigUser", item.userId],
      queryFn: () => newRequest.get(`/users/${item.userId}`).then((r) => r.data),
    });

  const { isLoading: userLoading, data: userData, error: userError } =
    useQuery<User>({
      queryKey: ["authenticatedUser"],
      queryFn: () => newRequest.get("/users/me").then((r) => r.data),
    });

  const { exchangeRate, currencySymbol } = useExchangeRate(userData?.country || "United States");
  const formattedPrice = new Intl.NumberFormat().format(item.price * exchangeRate);
  const totalStars = item.totalStars ?? 0;
  const starNumber = item.starNumber ?? 0;
  const averageRating = starNumber > 0 ? (totalStars / starNumber).toFixed(1) : null;

  if (gigUserLoading || userLoading) {
    return (
      <div className="rounded-2xl overflow-hidden bg-white border border-[#f0f0f0] animate-pulse">
        <div className="w-full h-[200px] bg-[#f7f7f7]" />
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex-shrink-0" />
            <div className="h-2.5 bg-[#f0f0f0] rounded-full w-28" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-[#f5f5f5] rounded-full w-full" />
            <div className="h-2.5 bg-[#f5f5f5] rounded-full w-4/5" />
          </div>
          <div className="h-px bg-[#f5f5f5]" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-[#f0f0f0] rounded-full w-20" />
            <div className="h-3 bg-[#f0f0f0] rounded-full w-12" />
          </div>
        </div>
      </div>
    );
  }

  if (gigUserError || userError) {
    return (
      <div className="rounded-2xl border border-[#f0f0f0] p-6 flex items-center justify-center">
        <p className="text-[12px] text-[#ccc]">Could not load gig</p>
      </div>
    );
  }

  return (
    <Link href={`/gig/${item._id}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-white border border-[#f0f0f0] group-hover:border-orange-200 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)]">

        {/* ── Image ── */}
        <div className="relative w-full h-[200px] overflow-hidden">
          <Image
            src={item.cover}
            alt={item.title || "Gig cover"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Category pill */}
          {item.cat && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold tracking-wider text-orange-400 bg-black/60 backdrop-blur-sm border border-orange-500/20 px-2.5 py-1 rounded-lg uppercase">
                {item.cat}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {averageRating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-lg">
              <Image src={starIcon} alt="star" width={10} height={10} />
              <span className="text-[10px] font-bold text-yellow-400">{averageRating}</span>
            </div>
          )}

          {/* Hover arrow */}
          <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-4">
          {/* Seller */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-[#f0f0f0]">
              <Image
                src={gigUserData?.img || "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"}
                alt={gigUserData?.username || "Seller"}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-[12px] font-semibold text-[#555] truncate">
              {gigUserData?.username}
            </span>
            <span className="ml-auto text-[10px] text-[#ccc] bg-[#f7f7f7] px-2 py-0.5 rounded-md font-semibold flex-shrink-0">
              Verified
            </span>
          </div>

          {/* Title / desc */}
          <p className="text-[13px] text-[#333] font-medium line-clamp-2 leading-snug mb-4">
            {item.title || item.desc || t("No description provided")}
          </p>

          {/* Divider */}
          <div className="h-px bg-[#f5f5f5] mb-3" />

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#bbb] uppercase tracking-wider font-semibold mb-0.5">
                {t("gigCard.startingAt")}
              </p>
              <p className="text-[15px] font-extrabold text-[#111]">
                {currencySymbol}{formattedPrice}
              </p>
            </div>

            <div className="w-8 h-8 rounded-xl bg-[#f7f7f7] group-hover:bg-orange-500 border border-[#f0f0f0] group-hover:border-orange-500 flex items-center justify-center transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="text-[#ccc] group-hover:text-white transition-colors" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import starIcon from "../../../assets/images/star.png";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";

interface Gig {
  _id: string;
  title?: string;
  cover: string;
  price: number;
  desc: string;
  totalStars: number;
  starNumber: number;
  userId: string;
}

interface User {
  username: string;
  img?: string;
  country?: string;
}

interface GigCardProps {
  item: Gig;
}

const GigCard: React.FC<GigCardProps> = ({ item }) => {
  const { t } = useTranslation();

  const {
    isLoading: gigUserLoading,
    error: gigUserError,
    data: gigUserData,
  } = useQuery<User>({
    queryKey: ["gigUser", item.userId],
    queryFn: async () => {
      const res = await newRequest.get(`/users/${item.userId}`);
      return res.data;
    },
  });

  const {
    isLoading: userLoading,
    data: userData,
    error: userError,
  } = useQuery<User>({
    queryKey: ["authenticatedUser"],
    queryFn: async () => {
      const res = await newRequest.get("/users/me");
      return res.data;
    },
  });

  const userCountry = userData?.country || "United States";
  const { exchangeRate, currencySymbol } = useExchangeRate(userCountry);

  const formattedPrice = new Intl.NumberFormat().format(
    item.price * exchangeRate
  );

  // Glassy loading effect
  if (gigUserLoading || userLoading) {
    return (
      <div className="w-[324px] h-[430px] rounded-lg bg-white/20 backdrop-blur-md border border-gray-200 animate-pulse flex flex-col">
        <div className="w-full h-[200px] bg-gray-300/30 rounded-t-lg" />
        <div className="flex flex-col gap-3 px-5 py-3 flex-grow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300/30 rounded-full" />
            <div className="h-4 bg-gray-300/30 rounded w-24" />
          </div>
          <div className="h-16 bg-gray-300/30 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-14 h-4 bg-gray-300/30 rounded" />
          </div>
        </div>
        <hr className="border-gray-200/30" />
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex flex-col gap-1">
            <div className="h-3 bg-gray-300/30 rounded w-16" />
            <div className="h-5 bg-gray-300/30 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (gigUserError || userError)
    return (
      <div>
        {t("Gig or User Does not exist or you are not properly authenticated")}
      </div>
    );

  const averageRating =
    !isNaN(item.totalStars / item.starNumber) && item.starNumber > 0
      ? Math.round(item.totalStars / item.starNumber)
      : 0;

  return (
    <Link href={`/gig/${item._id}`} className="group">
      <div className="w-[324px] h-[430px] border border-gray-200 shadow-md rounded-lg overflow-hidden flex flex-col transition-transform transform hover:scale-105">
        {/* Gig Cover */}
        <div className="relative w-full h-[200px]">
          <Image
            src={item.cover}
            alt={item.title || "Gig Cover"}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 px-5 py-3 flex-grow">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative rounded-full overflow-hidden">
              <Image
                src={
                  gigUserData?.img ||
                  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                }
                alt={gigUserData?.username || "User"}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-gray-800 font-medium truncate">
              {gigUserData?.username}
            </span>
          </div>

          <p className="text-gray-900 line-clamp-3 break-words whitespace-pre-line text-sm">{item.desc}</p>

          <div className="flex items-center gap-2">
            <Image src={starIcon} alt="star" width={14} height={14} />
            <span className="text-yellow-400 font-semibold text-sm">
              {averageRating}
            </span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Price */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">
              {t("gigCard.startingAt")}
            </span>
            <h2 className="text-gray-800 text-lg font-semibold">
              {currencySymbol} {formattedPrice}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;

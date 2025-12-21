"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useTranslation } from "react-i18next";
import { IoMdStar } from "react-icons/io";

interface ReviewType {
  _id: string;
  desc: string;
  star: number;
  userId: string;
  createdAt: string;
}

interface UserType {
  username: string;
  img?: string;
  country?: string;
}

interface ReviewProps {
  review: ReviewType;
}

const Review: React.FC<ReviewProps> = ({ review }) => {
  const { t } = useTranslation();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserType>({
    queryKey: ["reviewUser", review.userId],
    queryFn: () =>
      newRequest.get(`/users/${review.userId}`).then((res) => res.data),
    enabled: !!review.userId,
  });

  return (
    <div className="bg-white p-5 rounded-xl shadow-md space-y-3">
      {/* User Info */}
      {isLoading ? (
        <p className="text-gray-500">{t("review.loading")}</p>
      ) : error ? (
        <p className="text-red-500">{t("review.error")}</p>
      ) : (
        <div className="flex items-center gap-4">
          <img
            className="h-14 w-14 object-cover rounded-full border border-gray-300"
            src={
              user?.img ||
              "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
            }
            alt={user?.username}
          />
          <div>
            <span className="block text-lg font-semibold text-gray-900">
              {user?.username}
            </span>
            <span className="text-sm text-gray-500">
              {user?.country || "Unknown"}
            </span>
          </div>
        </div>
      )}

      {/* Star Rating */}
      <div className="flex items-center gap-2">
        {Array(review.star)
          .fill(0)
          .map((_, i) => (
            <IoMdStar key={i} className="text-orange-500 text-sm" />
          ))}
        <span className="font-semibold text-orange-500 text-sm">
          {review.star}
        </span>
      </div>

      {/* Review Description */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.desc}</p>

      {/* Optional: Added date */}
      <p className="text-xs text-gray-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default Review;

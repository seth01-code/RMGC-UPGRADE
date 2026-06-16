"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Review from "../../components/review/Review";
import { useTranslation } from "react-i18next";
import { IoMdStar } from "react-icons/io";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";

const OR = "#F97316";

interface ReviewType {
  _id: string;
  desc: string;
  star: number;
  userId: string;
  createdAt: string;
}

interface ReviewsProps {
  gigId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ gigId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ReviewType[]>({
    queryKey: ["reviews", gigId],
    queryFn: () => newRequest.get(`/reviews/${gigId}`).then((res) => res.data),
    enabled: !!gigId,
  });

  const mutation = useMutation({
    mutationFn: (review: { gigId: string; desc: string; star: number }) =>
      newRequest.post("/reviews", review),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", gigId] }),
  });

  const [desc, setDesc] = useState("");
  const [star, setStar] = useState<number>(5);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setIsSubmitting(true);
    mutation.mutate(
      { gigId, desc, star },
      {
        onSuccess: () => {
          setDesc("");
          setStar(5);
          setIsSubmitting(false);
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
        },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  const totalReviews = data?.length || 0;
  const avgRating = totalReviews
    ? (data!.reduce((acc, r) => acc + r.star, 0) / totalReviews).toFixed(1)
    : "—";

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: data?.filter((r) => r.star === s).length || 0,
  }));

  return (
    <div className="flex flex-col gap-6">

      {/* ── Rating summary ── */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex items-center gap-8 flex-wrap shadow-sm">
        <div className="text-center flex-shrink-0">
          <p className="text-[52px] font-black text-neutral-900 leading-none tracking-tighter">{avgRating}</p>
          <div className="flex justify-center gap-0.5 mt-2 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <IoMdStar key={s} size={14} color={parseFloat(avgRating as string) >= s ? OR : "#e5e7eb"} />
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 font-medium">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="w-px h-16 bg-neutral-100 flex-shrink-0" />

        <div className="flex-1 min-w-[180px] flex flex-col gap-1.5">
          {starCounts.map(({ star: s, count }) => {
            const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 w-2 flex-shrink-0">{s}</span>
                <IoMdStar size={11} color={OR} className="flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-300 w-6 text-right flex-shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reviews list ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-[3px] h-5 rounded-full bg-orange-500 flex-shrink-0" />
            <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-neutral-900">
              {t("reviews.title")}
            </h2>
          </div>
          {totalReviews > 0 && (
            <span className="text-[11px] font-bold bg-orange-50 text-orange-500 border border-orange-100 px-2.5 py-1 rounded-full">
              {totalReviews} total
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-100 rounded-2xl p-5 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-neutral-100 rounded-full w-1/3 mb-2" />
                    <div className="h-2.5 bg-neutral-100 rounded-full w-1/5" />
                  </div>
                </div>
                <div className="h-2.5 bg-neutral-100 rounded-full w-full mb-1.5" />
                <div className="h-2.5 bg-neutral-100 rounded-full w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <p className="text-[13px] text-red-500 font-medium">⚠ {t("reviews.error")}</p>
          </div>
        ) : data?.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-3">
              <IoMdStar size={20} color={OR} />
            </div>
            <p className="text-[14px] font-bold text-neutral-700 mb-1">No reviews yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data?.map((review, i) => (
              <Review key={review._id} review={review} index={i} />
            ))}
          </div>
        )}
      </div>      
    </div>
  );
};

export default Reviews;
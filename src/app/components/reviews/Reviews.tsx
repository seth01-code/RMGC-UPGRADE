"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import { useTranslation } from "react-i18next";

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
    onSuccess: () => queryClient.invalidateQueries(["reviews", gigId]),
  });

  const [desc, setDesc] = useState("");
  const [star, setStar] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    mutation.mutate(
      { gigId, desc, star },
      {
        onSuccess: () => {
          setDesc("");
          setStar(5);
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  return (
    <div className="mt-12 space-y-8">
      {/* Reviews List */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("reviews.title")}
        </h2>

        {isLoading ? (
          <p className="text-gray-500">{t("reviews.loading")}</p>
        ) : error ? (
          <p className="text-red-500">{t("reviews.error")}</p>
        ) : (
          <div className="space-y-4">
            {data?.map((review) => (
              <Review key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Add a Review */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900">
          {t("reviews.addReviewTitle")}
        </h3>

        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
          <textarea
            placeholder={t("reviews.placeholder")}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-800"
            rows={4}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-gray-700 font-medium">
              {t("reviews.ratingLabel")}
            </label>
            <select
              value={star}
              onChange={(e) => setStar(Number(e.target.value))}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-gray-800"
            >
              <option value={1}>⭐ 1 Star</option>
              <option value={2}>⭐⭐ 2 Stars</option>
              <option value={3}>⭐⭐⭐ 3 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t("reviews.submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;

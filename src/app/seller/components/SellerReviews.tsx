"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Review from "../../components/review/Review";
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
  // const [isSubmitting, setIsSubmitting] = useState(false);

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
    </div>
  );
};

export default Reviews;

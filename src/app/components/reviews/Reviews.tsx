"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
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
    <div style={{ marginTop: "48px", fontFamily: "'Inter', -apple-system, sans-serif", display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* ── Rating summary ── */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: "40px",
        flexWrap: "wrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Big score */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <p style={{ margin: "0 0 4px", fontSize: "56px", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: "#111827" }}>
            {avgRating}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2px", margin: "6px 0 4px" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <IoMdStar key={s} size={16} color={parseFloat(avgRating as string) >= s ? OR : "#e5e7eb"} />
            ))}
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "80px", background: "#e5e7eb", flexShrink: 0 }} />

        {/* Star breakdown */}
        <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "7px" }}>
          {starCounts.map(({ star: s, count }) => {
            const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280", width: "8px", flexShrink: 0 }}>{s}</span>
                <IoMdStar size={12} color={OR} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, height: "5px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: OR,
                    borderRadius: "3px", transition: "width 0.6s ease",
                  }} />
                </div>
                <span style={{ fontSize: "11px", color: "#9ca3af", width: "28px", textAlign: "right", flexShrink: 0 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reviews list ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: OR }}>
              Client feedback
            </p>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
              {t("reviews.title")}
            </h2>
          </div>
          {totalReviews > 0 && (
            <span style={{
              background: "#fff7ed", border: `1px solid #fed7aa`,
              borderRadius: "100px", padding: "4px 12px",
              fontSize: "12px", fontWeight: 600, color: OR,
            }}>
              {totalReviews} total
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                padding: "20px 24px", borderRadius: "16px",
                background: "#ffffff", border: "1px solid #e5e7eb",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f3f4f6" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "12px", background: "#f3f4f6", borderRadius: "6px", width: "35%", marginBottom: "6px" }} />
                    <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "6px", width: "20%" }} />
                  </div>
                </div>
                <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "6px", width: "100%", marginBottom: "5px" }} />
                <div style={{ height: "10px", background: "#f3f4f6", borderRadius: "6px", width: "70%" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: "20px 24px", borderRadius: "14px", background: "#fff7f5", border: "1px solid #fed7aa" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#ea580c" }}>⚠ {t("reviews.error")}</p>
          </div>
        ) : data?.length === 0 ? (
          <div style={{
            padding: "48px 24px", borderRadius: "16px",
            background: "#ffffff", border: "1px solid #e5e7eb", textAlign: "center",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "#fff7ed", border: "1px solid #fed7aa",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <IoMdStar size={22} color={OR} />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>No reviews yet</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>Be the first to share your experience</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data?.map((review, i) => (
              <Review key={review._id} review={review} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Add review form ── */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Form header */}
        <div style={{
          padding: "22px 28px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{ width: "3px", height: "22px", background: OR, borderRadius: "2px" }} />
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>
            {t("reviews.addReviewTitle")}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Star picker */}
          <div>
            <label style={{
              display: "block", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#6b7280", marginBottom: "10px",
            }}>
              {t("reviews.ratingLabel")}
            </label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStar(s)}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  style={{
                    background: "none", border: "none", padding: "2px",
                    cursor: "pointer", transition: "transform 0.15s",
                    transform: hoverStar >= s || star >= s ? "scale(1.2)" : "scale(1)",
                  }}
                >
                  <IoMdStar
                    size={28}
                    color={hoverStar >= s ? OR : star >= s ? OR : "#e5e7eb"}
                    style={{ display: "block", transition: "color 0.15s" }}
                  />
                </button>
              ))}
              <span style={{
                marginLeft: "10px", alignSelf: "center",
                fontSize: "13px", fontWeight: 600, color: OR,
                background: "#fff7ed", border: "1px solid #fed7aa",
                borderRadius: "100px", padding: "3px 10px",
              }}>
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][hoverStar || star]}
              </span>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label style={{
              display: "block", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#6b7280", marginBottom: "10px",
            }}>
              Your review
            </label>
            <textarea
              placeholder={t("reviews.placeholder")}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              style={{
                width: "100%", padding: "14px 16px",
                background: "#f9fafb",
                border: "1.5px solid #e5e7eb",
                borderRadius: "12px",
                color: "#111827", fontSize: "14px",
                lineHeight: 1.6, resize: "vertical",
                outline: "none", fontFamily: "inherit",
                boxSizing: "border-box", transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = OR)}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#9ca3af", textAlign: "right" }}>
              {desc.length} characters
            </p>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              type="submit"
              disabled={isSubmitting || !desc.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 28px",
                background: isSubmitting || !desc.trim() ? "#f3f4f6" : OR,
                color: isSubmitting || !desc.trim() ? "#9ca3af" : "#ffffff",
                border: "none", borderRadius: "100px",
                fontSize: "14px", fontWeight: 700,
                cursor: isSubmitting || !desc.trim() ? "not-allowed" : "pointer",
                boxShadow: isSubmitting || !desc.trim() ? "none" : `0 4px 16px rgba(249,115,22,0.35)`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && desc.trim()) {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.transform = "scale(1.03)";
                  b.style.background = "#ea6c0a";
                }
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "scale(1)";
                if (!isSubmitting && desc.trim()) b.style.background = OR;
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: "14px", height: "14px", borderRadius: "50%",
                    border: "2px solid #d1d5db", borderTop: `2px solid ${OR}`,
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Submitting…
                </>
              ) : (
                <>
                  <FaPaperPlane size={13} />
                  {t("reviews.submitButton")}
                </>
              )}
            </button>

            {submitted && (
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", color: "#16a34a", fontWeight: 600,
                animation: "fadeIn 0.3s ease",
              }}>
                <FaCheckCircle size={14} />
                Review posted!
              </div>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default Reviews;
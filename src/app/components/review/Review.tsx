"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useTranslation } from "react-i18next";
import { IoMdStar } from "react-icons/io";

const OR = "#F97316";

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
  index?: number;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const Review: React.FC<ReviewProps> = ({ review, index = 0 }) => {
  const { t } = useTranslation();

  const { data: user, isLoading, error } = useQuery<UserType>({
    queryKey: ["reviewUser", review.userId],
    queryFn: () => newRequest.get(`/users/${review.userId}`).then((res) => res.data),
    enabled: !!review.userId,
  });

  if (isLoading) {
    return (
      <div style={{
        padding: "20px 24px",
        borderRadius: "16px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f3f4f6", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: "13px", background: "#f3f4f6", borderRadius: "6px", width: "40%", marginBottom: "6px" }} />
            <div style={{ height: "11px", background: "#f3f4f6", borderRadius: "6px", width: "25%" }} />
          </div>
        </div>
        <div style={{ height: "11px", background: "#f3f4f6", borderRadius: "6px", width: "100%", marginBottom: "6px" }} />
        <div style={{ height: "11px", background: "#f3f4f6", borderRadius: "6px", width: "80%" }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#fff7f5", border: "1px solid #fed7aa" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#ea580c" }}>⚠ {t("review.error")}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "22px 24px",
        borderRadius: "16px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        animationDelay: `${index * 0.05}s`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = OR;
        el.style.boxShadow = `0 4px 20px rgba(249,115,22,0.08)`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#e5e7eb";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user?.img ? (
            <img
              src={user.img}
              alt={user.username}
              style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", border: "2px solid #f3f4f6", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              background: OR, display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 800, fontSize: "14px",
              color: "#fff", flexShrink: 0,
            }}>
              {getInitials(user?.username || "?")}
            </div>
          )}
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {user?.username}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
              {user?.country || "Global"}
            </p>
          </div>
        </div>
        <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Stars */}
      <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "14px" }}>
        {Array(review.star).fill(0).map((_, i) => (
          <IoMdStar key={`f-${i}`} size={15} color={OR} />
        ))}
        {Array(5 - review.star).fill(0).map((_, i) => (
          <IoMdStar key={`e-${i}`} size={15} color="#e5e7eb" />
        ))}
        <span style={{
          marginLeft: "8px", fontSize: "11px", fontWeight: 700, color: OR,
          background: "#fff7ed", border: `1px solid #fed7aa`,
          borderRadius: "100px", padding: "2px 8px",
        }}>
          {review.star}.0
        </span>
      </div>

      {/* Text */}
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.75, color: "#4b5563" }}>
        {review.desc}
      </p>
    </div>
  );
};

export default Review;
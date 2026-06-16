"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import newRequest from "../../utils/newRequest";

// ── types
interface PortfolioUser {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  yearsOfExperience?: number;
  portfolio: {
    certifications: boolean;
    headline?: string;
    skills?: string[];
    services?: string[];
    industries?: string[];
    confidence_score: number;
    experience?: number;
  };
}

// ── static data (unchanged)
const stats = [
  { value: "50k", suffix: "+", label: "Freelancers" },
  { value: "200", suffix: "+", label: "Categories" },
  { value: "98", suffix: "%", label: "Satisfaction" },
];

const trustItems = [
  { icon: "ti-shield-check", label: "Verified", sub: "ID-checked talent" },
  { icon: "ti-clock", label: "Fast hire", sub: "Under 24 hours" },
  { icon: "ti-lock", label: "Secure", sub: "Protected payments" },
];

const AVATAR_COLORS = [
  "#3b1f6e",
  "#0c2d3a",
  "#0a2218",
  "#2d0a1a",
  "#3a1f00",
  "#1a0a2e",
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5 mt-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`text-[11px] ${i <= count ? "text-orange-500" : "text-neutral-800"}`}
      >
        ★
      </span>
    ))}
  </div>
);

const ScoreBadge = ({ score }: { score: number }) => (
  <span className="text-[10px] font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full">
    {Math.round(score * 100)}% match
  </span>
);

// ── skeleton card
const SkeletonCard = () => (
  <div className="bg-[#0e0e0e] border border-[#161616] rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-9 h-9 rounded-[10px] bg-[#1a1a1a] flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-[#1a1a1a] rounded w-20 mb-1.5" />
        <div className="h-2.5 bg-[#151515] rounded w-14" />
      </div>
    </div>
    <div className="flex gap-1 flex-wrap">
      {[60, 48, 56].map((w) => (
        <div
          key={w}
          className="h-5 bg-[#151515] rounded"
          style={{ width: w }}
        />
      ))}
    </div>
    <div className="flex gap-0.5 mt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="text-[11px] text-neutral-800">
          ★
        </span>
      ))}
    </div>
  </div>
);

// ── single portfolio card
const PortfolioCard = ({
  user,
  index,
}: {
  user: PortfolioUser;
  index: number;
}) => {
  const p = user.portfolio;
  const skills = p.skills?.slice(0, 4) ?? [];
  const hotSkills = skills.slice(0, 2);
  const initials = user.username.slice(0, 2).toUpperCase();
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className="bg-[#0e0e0e] border border-[#161616] rounded-2xl p-4 hover:border-[#272727] transition-colors">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="relative w-9 h-9 rounded-[10px] overflow-hidden flex-shrink-0">
          {user.img ? (
            <Image
              src={user.img}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: avatarBg }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#c8c8c8] tracking-tight truncate">
            {user.username}
          </p>
          <p className="text-[11px] text-[#333] font-medium mt-0.5 truncate">
            {p.headline ?? p.services?.[0] ?? "Freelancer"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {skills.map((s) => (
          <span
            key={s}
            className={`text-[10px] font-semibold rounded-[5px] px-2 py-1 border tracking-wide ${
              hotSkills.includes(s)
                ? "text-[#c45a0a] border-[#1e1208] bg-[#0c0a07]"
                : "text-[#2e2e2e] border-[#181818]"
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-1">
        <StarRating count={5} />
        <ScoreBadge score={p.confidence_score} />
      </div>

      {p.industries && p.industries.length > 0 && (
        <p className="text-[10px] text-[#2a2a2a] font-medium mt-1.5 truncate">
          {p.industries.slice(0, 2).join(" · ")}
        </p>
      )}
    </div>
  );
};

// ── featured (first) user as wide card
const FeaturedPortfolioCard = ({ user }: { user: PortfolioUser }) => {
  const p = user.portfolio;
  const skills = p.skills?.slice(0, 6) ?? [];
  const hotSkills = skills.slice(0, 2);
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#0c0a07] border border-[#1e1208] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-[12px] overflow-hidden flex-shrink-0 border border-[#2e1a00]">
          {user.img ? (
            <Image
              src={user.img}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[13px] font-black text-white"
              style={{ background: AVATAR_COLORS[0] }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#ddd] tracking-tight truncate">
            {user.username}
          </p>
          <p className="text-[11px] text-[#333] font-medium mt-0.5 truncate">
            {p.headline ?? p.services?.[0] ?? "Freelancer"}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full">
              Top Rated
            </span>
            <ScoreBadge score={p.confidence_score} />
            <span className="inline-flex items-center gap-1.5 bg-[#081208] border border-[#0f1f0f] rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-semibold text-green-500 tracking-wide">
                Online
              </span>
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <StarRating count={5} />
          {user.yearsOfExperience && (
            <p className="text-[10px] text-[#2e2e2e] font-medium mt-1">
              {user.yearsOfExperience}yr exp.
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {skills.map((s) => (
          <span
            key={s}
            className={`text-[10px] font-semibold rounded-[5px] px-2 py-1 border tracking-wide ${
              hotSkills.includes(s)
                ? "text-[#c45a0a] border-[#1e1208] bg-[#0c0a07]"
                : "text-[#2e2e2e] border-[#181818]"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      {p.industries && p.industries.length > 0 && (
        <p className="text-[10px] text-[#2a2a2a] font-medium mt-2 truncate">
          Industries: {p.industries.join(" · ")}
        </p>
      )}
    </div>
  );
};

// ── main component
const Featured: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const router = useRouter();
  const [topUsers, setTopUsers] = useState<PortfolioUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    newRequest
      .get("/portfolio/top")
      .then((res) => setTopUsers(res.data.users))
      .catch(() => setTopUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleSubmit = () => {
    if (input.trim())
      router.push(`/allgigs?search=${encodeURIComponent(input)}`);
  };
  const handlePopularClick = (term: string) => {
    setInput(term);
    router.push(`/allgigs?search=${encodeURIComponent(term)}`);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  // split: featured = first, grid = next 4
  const featuredUser = topUsers[0];
  const gridUsers = topUsers.slice(1, 5);

  return (
    <section className="relative bg-[#080808] overflow-hidden min-h-[600px] font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
        {/* ── LEFT (unchanged) ── */}
        <div className="flex flex-col justify-between px-12 py-14 z-10 relative border-r border-[#141414]">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#272727] rounded-full px-4 py-1.5 w-fit mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-[0.08em]">
                Trusted Freelance Platform
              </span>
            </div>
            <div className="flex gap-9 mb-5">
              {stats.map(({ value, suffix, label }) => (
                <div key={label}>
                  <p className="text-[30px] font-black text-white leading-none tracking-tighter">
                    {value}
                    <span className="text-orange-500">{suffix}</span>
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#333] mt-1.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="w-full h-px bg-[#111] my-5" />
            <motion.h1
              className="text-[48px] font-black leading-[1.04] tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <span className="text-white">{t("featured.title1")}</span>{" "}
              <span className="text-orange-500">{t("featured.title2")}</span>{" "}
              <span className="text-white block">{t("featured.title3")}</span>
            </motion.h1>
            <p className="text-[13.5px] text-[#3d3d3d] leading-[1.8] max-w-[320px] mt-4">
              Connect with verified freelancers across 200+ categories. Smarter
              matching, zero noise.
            </p>
          </div>
          <div className="flex flex-col gap-4 mt-10">
            <div className="flex bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden max-w-[420px]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("featured.searchPlaceholder")}
                className="flex-1 bg-transparent border-none outline-none text-[#ccc] text-sm px-4 py-[15px] placeholder-[#333]"
              />
              <button
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-[15px] transition-colors whitespace-nowrap tracking-wide"
              >
                {t("featured.searchButton")}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#333]">
                {t("featured.popular")}:
              </span>
              {["Legal Services", "Graphic Design", "Writing"].map((term) => (
                <button
                  key={term}
                  onClick={() => handlePopularClick(term)}
                  className="text-[11px] text-[#3d3d3d] border border-[#1a1a1a] rounded-full px-3.5 py-1.5 hover:border-orange-500 hover:text-orange-500 transition-all bg-transparent"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        {/* ── RIGHT ── */}
        <div className="bg-[#060606] px-6 py-8 flex-col gap-3 justify-center hidden lg:flex">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-1">
            <div className="h-px flex-1 bg-[#141414]" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#333]">
              Master Freelancers
            </span>
            <div className="h-px flex-1 bg-[#141414]" />
          </div>

          {/* Featured wide card — highest score user */}
          {loadingUsers ? (
            <div className="bg-[#0c0a07] border border-[#1e1208] rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[14px] bg-[#1a1208] flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-[#1a1208] rounded w-28 mb-2" />
                  <div className="h-2.5 bg-[#151208] rounded w-20 mb-3" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-[#1a1208] rounded-full" />
                    <div className="h-5 w-20 bg-[#1a1208] rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[56, 72, 48, 64, 56].map((w, i) => (
                  <div
                    key={i}
                    className="h-5 bg-[#151208] rounded"
                    style={{ width: w }}
                  />
                ))}
              </div>
            </div>
          ) : featuredUser ? (
            <div className="bg-[#0c0a07] border border-[#1e1208] rounded-2xl p-5 relative overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start gap-4">
                {/* Avatar — larger */}
                <div className="relative w-14 h-14 rounded-[14px] overflow-hidden flex-shrink-0 border border-[#2e1a00]">
                  {featuredUser.img ? (
                    <Image
                      src={featuredUser.img}
                      alt={featuredUser.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[15px] font-black text-white"
                      style={{ background: AVATAR_COLORS[0] }}
                    >
                      {featuredUser.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[15px] font-black text-[#e8e8e8] tracking-tight truncate">
                      {featuredUser.username}
                    </p>
                    {/* Crown for #1 */}
                    <span className="text-[13px]">👑</span>
                  </div>
                  <p className="text-[12px] text-[#444] font-medium mb-2.5 truncate">
                    {featuredUser.portfolio.headline ??
                      featuredUser.portfolio.services?.[0] ??
                      "Freelancer"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full">
                      Top Rated
                    </span>
                    <span className="text-[10px] font-bold bg-[#1a1508] border border-[#2e2208] text-[#a07010] px-2.5 py-1 rounded-full">
                      ⭑ Pro Member
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-[#081208] border border-[#0f1f0f] rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-semibold text-green-500 tracking-wide">
                        Online
                      </span>
                    </span>
                    <ScoreBadge
                      score={featuredUser.portfolio.confidence_score}
                    />
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <StarRating count={5} />
                  {featuredUser.yearsOfExperience && (
                    <p className="text-[10px] text-[#2e2e2e] font-medium mt-1">
                      {featuredUser.yearsOfExperience}yr exp.
                    </p>
                  )}
                  {featuredUser.portfolio.industries?.[0] && (
                    <p className="text-[10px] text-[#2a2a2a] font-medium mt-0.5 max-w-[80px] text-right">
                      {featuredUser.portfolio.industries[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Skills row — more skills for featured */}
              <div className="flex flex-wrap gap-1 mt-4">
                {(featuredUser.portfolio.skills ?? [])
                  .slice(0, 7)
                  .map((s, i) => (
                    <span
                      key={s}
                      className={`text-[10px] font-semibold rounded-[5px] px-2 py-1 border tracking-wide ${
                        i < 2
                          ? "text-[#c45a0a] border-[#1e1208] bg-[#0c0a07]"
                          : "text-[#2e2e2e] border-[#181818]"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
              </div>

              {/* Certifications if any */}
              {featuredUser.portfolio.certifications && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] text-[#444] border border-[#1e1e1e] rounded-[5px] px-2 py-1">
                      🎓 Certified
                    </span>
                  </div>
                )}
            </div>
          ) : null}

          {/* 2-col grid — remaining users, smaller */}
          <div className="grid grid-cols-2 gap-2">
            {loadingUsers
              ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
              : gridUsers.length > 0
                ? gridUsers.map((u, i) => (
                    <PortfolioCard key={u._id} user={u} index={i + 1} />
                  ))
                : [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>

          {/* Trust bar */}
          <div className="flex bg-[#0a0a0a] border border-[#141414] rounded-2xl overflow-hidden">
            {trustItems.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <div className="w-px bg-[#141414] self-stretch" />}
                <div className="flex items-center gap-2.5 flex-1 px-4 py-3.5">
                  <i
                    className={`ti ${item.icon} text-orange-500 text-[17px]`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[11px] font-bold text-[#555] uppercase tracking-[0.04em]">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[#2a2a2a] font-medium mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Featured;

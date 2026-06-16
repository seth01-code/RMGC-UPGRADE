// AllGig.tsx
"use client";

import React, { useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineAdjustments } from "react-icons/hi";
import { MdOutlineSort } from "react-icons/md";
import { IoSearchOutline, IoChevronDownOutline } from "react-icons/io5";
import GigCard from "../components/GigCard/GigCard";
import newRequest from "../utils/newRequest";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Gig {
  _id: string;
  title: string;
  cover: string;
  price: number; // always USD on the server
  cat: string;
  userId: string;
}

type Currency = "USD" | "NGN";

// ─────────────────────────────────────────────────────────────────────────────
// Currency helpers
// ─────────────────────────────────────────────────────────────────────────────

const USD_TO_NGN = 1600;

/** Detect which currency a raw string looks like and return USD value */
function parseToUSD(raw: string): number | null {
  if (!raw.trim()) return null;
  // Strip currency symbols / commas
  const cleaned = raw.replace(/[₦$,\s]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  // If original string contained ₦, treat as NGN
  if (raw.includes("₦")) return num / USD_TO_NGN;
  // If very large number with no symbol, assume NGN (heuristic: > 10 000)
  if (!raw.includes("$") && num > 10_000) return num / USD_TO_NGN;
  return num; // treat as USD
}

function formatPrice(usd: number, currency: Currency) {
  if (currency === "NGN") {
    return `₦${Math.round(usd * USD_TO_NGN).toLocaleString("en-NG")}`;
  }
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-[#f0f0f0] animate-pulse">
    <div className="w-full h-[200px] bg-[#f7f7f7]" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#f0f0f0]" />
        <div className="h-2.5 bg-[#f0f0f0] rounded-full w-28" />
      </div>
      <div className="h-2.5 bg-[#f5f5f5] rounded-full w-full" />
      <div className="h-2.5 bg-[#f5f5f5] rounded-full w-4/5" />
      <div className="h-px bg-[#f5f5f5]" />
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#f0f0f0] rounded-full w-20" />
        <div className="h-7 w-7 bg-[#f0f0f0] rounded-xl" />
      </div>
    </div>
  </div>
);

// Collapsible category section
interface CategorySectionProps {
  label: string;
  gigs: Gig[];
  currency: Currency;
  defaultOpen?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  label,
  gigs,
  currency,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      {/* Header — clickable to collapse */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 mb-0 mt-2 group focus:outline-none"
      >
        <div className="h-px w-4 bg-orange-400 shrink-0" />
        <span className="text-[11px] font-bold tracking-[0.16em] text-orange-500 uppercase whitespace-nowrap">
          {label}
        </span>
        <span className="text-[10px] font-semibold text-[#ccc] bg-[#f7f7f7] px-2 py-0.5 rounded-full shrink-0">
          {gigs.length}
        </span>
        <div className="flex-1 h-px bg-[#f0f0f0]" />
        <IoChevronDownOutline
          className={`text-[#ccc] text-[14px] shrink-0 transition-transform duration-200 group-hover:text-orange-400 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 pt-5">
              {gigs.map((gig, i) => (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.035 }}
                >
                  <GigCard
                    item={gig}
                    currency={currency}
                    displayPrice={formatPrice(gig.price, currency)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Pagination bar
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-xl text-[12.5px] font-semibold text-[#888] border border-[#ebebeb] bg-white disabled:opacity-30 hover:border-orange-200 hover:text-orange-500 transition-all"
      >
        ← Prev
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-[#ccc] text-[12px] select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 rounded-xl text-[12.5px] font-bold transition-all ${
              page === p
                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                : "bg-white text-[#555] border border-[#ebebeb] hover:border-orange-200 hover:text-orange-500"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-xl text-[12.5px] font-semibold text-[#888] border border-[#ebebeb] bg-white disabled:opacity-30 hover:border-orange-200 hover:text-orange-500 transition-all"
      >
        Next →
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const AllGig: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const category = searchParams.get("cat") || "";

  const [sort, setSort] = useState<"sales" | "createdAt">("sales");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [page, setPage] = useState(1);

  // Unified budget inputs — accept $ or ₦ freely
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const { isLoading, error, data, refetch } = useQuery<Gig[], Error>({
    queryKey: ["gigs", sort, searchQuery, category],
    queryFn: async () => {
      const minUSD = parseToUSD(minRef.current?.value || "");
      const maxUSD = parseToUSD(maxRef.current?.value || "");
      const min = minUSD != null ? String(Math.round(minUSD)) : "";
      const max = maxUSD != null ? String(Math.round(maxUSD)) : "";
      let query = `/gigs?sort=${sort}&min=${min}&max=${max}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (category) query += `&cat=${encodeURIComponent(category)}`;
      const res = await newRequest.get(query);
      return res.data as Gig[];
    },
  });

  // ── Group by category ───────────────────────────────────────────────────
  const grouped = useMemo(() => {
    if (!data) return [];
    if (!groupByCategory || category) {
      return [{ label: category || "All gigs", gigs: data }];
    }
    const map = new Map<string, Gig[]>();
    for (const gig of data) {
      const key = gig.cat || "Uncategorised";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(gig);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, gigs]) => ({ label, gigs }));
  }, [data, groupByCategory, category]);

  // ── Pagination (flat mode only — grouped mode shows all within each group) ──
  const flatGigs = grouped.length === 1 ? grouped[0].gigs : null;
  const totalPages = flatGigs ? Math.ceil(flatGigs.length / PAGE_SIZE) : 1;
  const pagedGigs = flatGigs
    ? flatGigs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : null;

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reSort = (type: "sales" | "createdAt") => {
    setSort(type);
    setSortOpen(false);
    setPage(1);
  };

  const sortLabel = sort === "sales" ? "Best selling" : "Newest first";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-orange-500" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              Marketplace
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#111] leading-tight">
            {searchQuery ? (
              <>Results for <span className="text-orange-500">"{searchQuery}"</span></>
            ) : category ? (
              <><span className="text-orange-500">{category}</span> gigs</>
            ) : (
              "All gigs"
            )}
          </h1>
          {data && !isLoading && (
            <p className="text-[13px] text-[#aaa] mt-1.5">
              {data.length} service{data.length !== 1 ? "s" : ""} available
            </p>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">

          {/* Left */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                filtersOpen
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-[#555] border-[#ebebeb] hover:border-orange-200 hover:text-orange-500"
              }`}
            >
              <HiOutlineAdjustments className="text-[16px]" />
              Filters
            </button>

            {!category && (
              <button
                onClick={() => setGroupByCategory(!groupByCategory)}
                className={`flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                  groupByCategory
                    ? "bg-orange-500/10 text-orange-500 border-orange-200"
                    : "bg-white text-[#555] border-[#ebebeb] hover:border-orange-200 hover:text-orange-500"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                Group by category
              </button>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-xl border border-[#ebebeb] bg-white text-[#555] hover:border-orange-200 hover:text-orange-500 transition-all"
              >
                <MdOutlineSort className="text-[16px]" />
                {sortLabel}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-44 bg-white border border-[#f0f0f0] rounded-2xl shadow-lg z-20 overflow-hidden p-1.5"
                  >
                    {(["sales", "createdAt"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => reSort(type)}
                        className={`w-full text-left px-3.5 py-2.5 text-[12.5px] font-medium rounded-xl transition-all ${
                          sort === type
                            ? "bg-orange-500/10 text-orange-500"
                            : "text-[#555] hover:bg-[#f7f7f7] hover:text-[#111]"
                        }`}
                      >
                        {type === "sales" ? "Best selling" : "Newest first"}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Filter panel ── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white border border-[#f0f0f0] rounded-2xl p-5 flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-orange-500 uppercase mb-1.5">
                    Budget range
                  </p>
                  <p className="text-[10px] text-[#bbb] mb-2.5">
                    Type any amount — use <span className="font-semibold">$</span> for USD or{" "}
                    <span className="font-semibold">₦</span> for Naira. Large numbers without a
                    symbol default to ₦.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      ref={minRef}
                      placeholder="e.g. $20 or ₦50,000"
                      className="w-40 px-3 py-2 text-[12.5px] text-[#333] placeholder:text-[#ccc] border border-[#f0f0f0] rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    />
                    <span className="text-[#ddd] text-sm">—</span>
                    <input
                      type="text"
                      ref={maxRef}
                      placeholder="e.g. $200 or ₦500,000"
                      className="w-40 px-3 py-2 text-[12.5px] text-[#333] placeholder:text-[#ccc] border border-[#f0f0f0] rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    />
                  </div>
                  <p className="text-[10px] text-[#ccc] mt-1.5">
                    Rate used: 1 USD = ₦{USD_TO_NGN.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => { setPage(1); refetch(); setFiltersOpen(false); }}
                  className="flex items-center gap-2 bg-[#111] hover:bg-orange-500 text-white text-[12.5px] font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  <IoSearchOutline className="text-[14px]" />
                  Apply filters
                </button>

                <button
                  onClick={() => {
                    if (minRef.current) minRef.current.value = "";
                    if (maxRef.current) maxRef.current.value = "";
                    setPage(1);
                    refetch();
                  }}
                  className="text-[12px] text-[#bbb] hover:text-[#555] transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#f0f0f0] rounded-2xl">
            <p className="text-[13px] font-semibold text-[#ccc]">Something went wrong</p>
            <p className="text-[12px] text-[#ddd] mt-1">Please try again later.</p>
          </div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-[#f0f0f0] rounded-2xl">
            <IoSearchOutline className="text-[36px] text-[#e5e5e5] mb-3" />
            <p className="text-[13px] font-semibold text-[#ccc]">No gigs found</p>
            <p className="text-[12px] text-[#ddd] mt-1">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : grouped.length > 1 ? (
          // ── Grouped view (no pagination — each category is self-contained) ──
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {grouped.map(({ label, gigs }, idx) => (
              <CategorySection
                key={label}
                label={label}
                gigs={gigs}
                currency={currency}
                defaultOpen={idx < 3} // first 3 open by default
              />
            ))}
          </motion.div>
        ) : (
          // ── Flat / single-category view (with pagination) ──
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {(pagedGigs ?? []).map((gig, i) => (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.035 }}
                >
                  <GigCard
                    item={gig}
                    currency={currency}
                    displayPrice={formatPrice(gig.price, currency)}
                  />
                </motion.div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllGig;
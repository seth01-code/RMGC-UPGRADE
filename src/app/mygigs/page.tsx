/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineAdd, MdOutlineStorefront } from "react-icons/md";
import { HiOutlineTrash, HiOutlinePencil } from "react-icons/hi";
import { IoSearchOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";

interface Gig {
  _id: string;
  cover: string;
  title: string;
  price: number;
  sales: number;
}

interface User {
  id: string;
  isSeller?: boolean;
}

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-[#f5f5f5] animate-pulse">
    <div className="w-16 h-12 rounded-xl bg-[#f5f5f5] shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-[#f5f5f5] rounded-full w-2/3" />
      <div className="h-2.5 bg-[#fafafa] rounded-full w-1/3" />
    </div>
    <div className="h-3 bg-[#f5f5f5] rounded-full w-16 hidden sm:block" />
    <div className="h-3 bg-[#f5f5f5] rounded-full w-10 hidden md:block" />
    <div className="w-7 h-7 rounded-lg bg-[#f5f5f5]" />
  </div>
);

// Scales the stat value font down as the formatted string gets longer,
// so large currency amounts never overflow a narrow grid column on mobile.
const getStatValueSize = (value: string) => {
  if (value.length > 14) return "text-[15px] sm:text-lg md:text-[22px]";
  if (value.length > 10) return "text-base sm:text-xl md:text-[22px]";
  return "text-lg sm:text-xl md:text-[22px]";
};

const MyGigs: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  const currentUser: User =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : ({} as User);

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: userData } = useQuery({
    queryKey: ["userData", currentUser?.id],
    queryFn: () => newRequest.get("/users/me").then((r) => r.data),
  });

  const {
    data: gigs,
    isLoading,
    error,
  } = useQuery<Gig[]>({
    queryKey: ["myGigs", currentUser?.id],
    queryFn: () =>
      newRequest.get(`/gigs?userId=${currentUser.id}`).then((r) => r.data),
  });

  const { exchangeRate, currencySymbol } = useExchangeRate(
    userData?.country || "Nigeria",
  );

  const mutation = useMutation({
    mutationFn: (id: string) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGigs", currentUser?.id] });
      toast.success("Gig deleted successfully!");
      setDeletingId(null);
      setConfirmId(null);
    },
    onError: (err: any) => {
      toast.error(`Error deleting gig: ${err.message}`);
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    mutation.mutate(id);
  };

  const formatPrice = (price: number) =>
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const filtered =
    gigs?.filter((g) => g.title.toLowerCase().includes(search.toLowerCase())) ||
    [];

  const totalRevenue = gigs?.reduce((s, g) => s + g.price * g.sales, 0) || 0;
  const totalSales = gigs?.reduce((s, g) => s + g.sales, 0) || 0;

  const stats = [
    { label: "Total gigs", value: gigs ? gigs.length.toString() : "0" },
    { label: "Total sales", value: totalSales.toLocaleString() },
    {
      label: "Est. revenue",
      value: `${currencySymbol}${formatPrice(totalRevenue * exchangeRate)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500 shrink-0" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Freelancer dashboard
              </span>
            </div>
            <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
              My gigs
            </h1>
            <p className="text-[13px] text-[#aaa] mt-1.5">
              Manage and track all your active listings
            </p>
          </div>

          {currentUser?.isSeller && (
            <Link href="/add" className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#111] hover:bg-orange-500 text-white text-[13px] font-bold px-5 py-3 rounded-xl transition-all"
              >
                <MdOutlineAdd className="text-[17px]" />
                Add new gig
              </motion.button>
            </Link>
          )}
        </div>

        {/* ── Stats strip ── */}
        {!isLoading && gigs && gigs.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="min-w-0 bg-white border border-[#f0f0f0] rounded-2xl p-3.5 sm:p-5 hover:border-orange-200 transition-colors"
              >
                <p className="text-[9px] sm:text-[10px] font-bold tracking-widest sm:tracking-[0.16em] text-orange-500 uppercase mb-1.5 sm:mb-2 truncate">
                  {stat.label}
                </p>
                <p
                  title={stat.value}
                  className={`font-extrabold text-[#111] tabular-nums wrap-break-word leading-snug ${getStatValueSize(stat.value)}`}
                >
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Search bar ── */}
        {!isLoading && gigs && gigs.length > 0 && (
          <div className="flex items-center gap-3 border-2 border-[#f0f0f0] focus-within:border-orange-300 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.06)] rounded-xl px-4 py-3 mb-6 transition-all bg-white">
            <IoSearchOutline className="text-[#ccc] text-[17px] shrink-0" />
            <input
              type="text"
              placeholder="Search your gigs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full min-w-0 text-[13.5px] text-[#111] placeholder:text-[#ccc]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[#ccc] hover:text-orange-500 text-[12px] transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {isLoading ? (
          <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 border border-[#f0f0f0] rounded-2xl">
            <p className="text-[13px] text-red-400">Failed to load gigs.</p>
          </div>
        ) : gigs?.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 px-4 border border-dashed border-[#e5e5e5] rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <MdOutlineStorefront className="text-orange-500 text-[26px]" />
            </div>
            <p className="text-[14px] font-bold text-[#333] mb-1">
              No gigs yet
            </p>
            <p className="text-[12.5px] text-[#bbb] mb-6 text-center max-w-55">
              Create your first gig and start getting clients.
            </p>
            <Link href="/add">
              <button className="flex items-center gap-2 bg-[#111] hover:bg-orange-500 text-white text-[12.5px] font-bold px-5 py-2.5 rounded-xl transition-all">
                <MdOutlineAdd className="text-[15px]" />
                Create a gig
              </button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-[#f0f0f0] rounded-2xl text-center">
            <IoSearchOutline className="text-[32px] text-[#e5e5e5] mb-3" />
            <p className="text-[13px] text-[#ccc] wrap-break-word">
              No gigs match &quot;{search}&quot;
            </p>
          </div>
        ) : (
          /* Gig list */
          <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden">
            {/* Table header — desktop only */}
            <div className="hidden md:grid grid-cols-[auto_1fr_120px_80px_100px] items-center gap-4 px-5 py-3 border-b border-[#f5f5f5] bg-[#fafafa]">
              {["Cover", "Title", "Price", "Sales", "Actions"].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase"
                >
                  {h}
                </span>
              ))}
            </div>

            <AnimatePresence>
              {filtered.map((gig, index) => (
                <motion.div
                  key={gig._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="group flex flex-col gap-3 md:grid md:grid-cols-[auto_1fr_120px_80px_100px] md:items-center md:gap-4 px-4 sm:px-5 py-4 border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors"
                >
                  {/*
                    Cover + title travel together on mobile as a normal row.
                    On md+, `md:contents` drops this wrapper from the box
                    model so its two children become direct grid items
                    again — same single markup serves both layouts.
                  */}
                  <div className="flex items-center gap-3 w-full md:contents">
                    <div className="relative w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
                      <Image
                        src={gig.cover || "/placeholder.jpg"}
                        alt={gig.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#111] truncate">
                        {gig.title}
                      </p>
                      <p className="text-[11px] text-[#bbb] mt-0.5">
                        ID: {gig._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-full md:w-auto flex items-center justify-between md:block gap-3 min-w-0">
                    <span className="text-[11px] text-[#bbb] md:hidden shrink-0">
                      Price
                    </span>
                    <p
                      className="text-[13.5px] font-bold text-[#111] truncate"
                      title={`${currencySymbol}${formatPrice(gig.price * exchangeRate)}`}
                    >
                      {currencySymbol}
                      {formatPrice(gig.price * exchangeRate)}
                    </p>
                  </div>

                  {/* Sales */}
                  <div className="w-full md:w-auto flex items-center justify-between md:block gap-3">
                    <span className="text-[11px] text-[#bbb] md:hidden shrink-0">
                      Sales
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#111]">
                        {gig.sales}
                      </span>
                      {gig.sales > 0 && (
                        <span className="text-[9px] font-bold text-green-500 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 mt-1 border-t border-[#f5f5f5] md:pt-0 md:mt-0 md:border-t-0">
                    <Link href={`/edit/${gig._id}`}>
                      <button className="w-8 h-8 rounded-xl border border-[#f0f0f0] hover:border-orange-200 flex items-center justify-center text-[#ccc] hover:text-orange-500 transition-all">
                        <HiOutlinePencil className="text-[13px]" />
                      </button>
                    </Link>

                    {confirmId === gig._id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDelete(gig._id)}
                          disabled={deletingId === gig._id}
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                        >
                          {deletingId === gig._id ? (
                            <ClipLoader size={9} color="#fff" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[11px] font-semibold text-[#bbb] hover:text-[#555] px-2 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(gig._id)}
                        className="w-8 h-8 rounded-xl border border-[#f0f0f0] hover:border-red-200 flex items-center justify-center text-[#ccc] hover:text-red-400 transition-all"
                      >
                        <HiOutlineTrash className="text-[13px]" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Footer count */}
            <div className="px-4 sm:px-5 py-3 border-t border-[#f5f5f5] bg-[#fafafa] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11.5px] text-[#bbb] min-w-0 truncate">
                {filtered.length} gig{filtered.length !== 1 ? "s" : ""}
                {search && ` matching "${search}"`}
              </span>
              <Link href="/add">
                <button className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#aaa] hover:text-orange-500 transition-colors shrink-0">
                  <MdOutlineAdd className="text-[14px]" />
                  Add another
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;

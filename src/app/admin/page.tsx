"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import newRequest from "../utils/newRequest";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineCollection,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import { MdOutlineStorefront } from "react-icons/md";
import { useExchangeRate } from "../hooks/useExchangeRate";
import SellerNavbar from "../seller/components/navbar";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface User { _id: string; username: string; img?: string; }
interface Gig { _id: string; title: string; shortTitle: string; desc: string; cover: string; userId: string; price: number; }
interface Order { _id: string; sellerName: string; buyerName: string; price: number; status: string; }
interface RevenueData { sellerName: string; totalSellerRevenueConverted: number; }
interface AdminRevenueResponse {
  revenueData: RevenueData[];
  totalRevenueAllSellersConverted: number;
  monthlyEarnings: Record<string, number>;
}

const usersPerGroup = 10;

const StatCard = ({
  label, value, icon, index,
}: {
  label: string; value: string; icon: React.ReactNode; index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className="group bg-white border border-[#f0f0f0] hover:border-orange-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-[20px]">
        {icon}
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30 group-hover:bg-orange-500 transition-colors" />
    </div>
    <p className="text-[10px] font-bold tracking-[0.16em] text-[#bbb] uppercase mb-1">{label}</p>
    <p className="text-[24px] font-extrabold text-[#111]">{value}</p>
  </motion.div>
);

const SectionHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-1.5">
      <div className="h-px w-5 bg-orange-500" />
      <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">{eyebrow}</span>
    </div>
    <h2 className="text-[18px] font-extrabold text-[#111]">{title}</h2>
  </div>
);

const PaginationBar = ({
  current, total, onPrev, onNext, onChange,
}: {
  current: number; total: number; onPrev: () => void; onNext: () => void; onChange: (n: number) => void;
}) => (
  <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#f5f5f5]">
    <button
      onClick={onPrev}
      disabled={current === 0}
      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#888] hover:text-orange-500 border border-[#ebebeb] hover:border-orange-200 px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <FiChevronLeft /> Previous
    </button>
    <select
      value={current}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-[12px] font-semibold text-[#555] border border-[#ebebeb] rounded-xl px-3 py-2 outline-none focus:border-orange-300 transition"
    >
      {Array.from({ length: total }).map((_, i) => (
        <option key={i} value={i}>Page {i + 1} of {total}</option>
      ))}
    </select>
    <button
      onClick={onNext}
      disabled={current >= total - 1}
      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#888] hover:text-orange-500 border border-[#ebebeb] hover:border-orange-200 px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Next <FiChevronRight />
    </button>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : null;
  const { currencySymbol, convertPrice } = useExchangeRate(currentUser?.country);

  const [revenueGroup, setRevenueGroup] = useState(0);
  const [gigGroup, setGigGroup] = useState(0);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [sortedRevenueData, setSortedRevenueData] = useState<RevenueData[]>([]);

  const { data: revenueData } = useQuery<AdminRevenueResponse>({
    queryKey: ["adminRevenue"],
    queryFn: () => newRequest.get("/orders/admin-revenue").then((r) => r.data),
  });

  const { data: gigs = [] } = useQuery<Gig[]>({
    queryKey: ["userGigs"],
    queryFn: () => newRequest.get("/gigs").then((r) => r.data),
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["allCompletedOrders"],
    queryFn: () => newRequest.get("/orders/all-completed").then((r) => r.data || []),
  });

  useEffect(() => {
    if (revenueData?.revenueData) {
      setSortedRevenueData(
        [...revenueData.revenueData].sort((a, b) => b.totalSellerRevenueConverted - a.totalSellerRevenueConverted)
      );
    }
  }, [revenueData]);

  useEffect(() => {
    if (!gigs.length) return;
    const fetchUsers = async () => {
      const uniqueIds = [...new Set(gigs.map((g) => g.userId))];
      const responses = await Promise.all(uniqueIds.map((id) => newRequest.get(`/users/${id}`)));
      const map: Record<string, User> = {};
      responses.forEach((r) => (map[r.data._id] = r.data));
      setUserDetails(map);
    };
    fetchUsers();
  }, [gigs]);

  // Chart config
  const chartColors = {
    gradient: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#ea580c" }] },
  };

  const revenueStart = revenueGroup * usersPerGroup;
  const groupedRevenue = sortedRevenueData.slice(revenueStart, revenueStart + usersPerGroup);
  const gigStart = gigGroup * usersPerGroup;
  const groupedGigs = gigs.slice(gigStart, gigStart + usersPerGroup);

  const barOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#fff", borderColor: "#f0f0f0", textStyle: { color: "#111", fontSize: 12 } },
    xAxis: {
      type: "category",
      data: groupedRevenue.map((d) => d.sellerName),
      axisLabel: { rotate: 35, fontSize: 11, color: "#aaa" },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 11, color: "#aaa" },
      splitLine: { lineStyle: { color: "#f7f7f7" } },
      axisLine: { show: false },
    },
    series: [{
      type: "bar",
      data: groupedRevenue.map((d) => d.totalSellerRevenueConverted),
      barWidth: "45%",
      itemStyle: { color: chartColors.gradient, borderRadius: [8, 8, 0, 0] },
      emphasis: { itemStyle: { color: "#f97316" } },
    }],
    grid: { left: "3%", right: "3%", bottom: "18%", top: "5%", containLabel: true },
  };

  const donutOption = {
    tooltip: { trigger: "item", backgroundColor: "#fff", borderColor: "#f0f0f0", textStyle: { color: "#111", fontSize: 12 } },
    series: [{
      type: "pie",
      radius: ["45%", "72%"],
      avoidLabelOverlap: false,
      label: { show: true, position: "inside", formatter: "{b}\n{d}%", fontSize: 11, color: "#fff", fontWeight: "bold" },
      labelLine: { show: false },
      data: [
        { value: revenueData?.totalRevenueAllSellersConverted || 0, name: "Seller Revenue", itemStyle: { color: "#f97316" } },
        { value: (revenueData?.totalRevenueAllSellersConverted || 0) * 0.1, name: "RMGC (10%)", itemStyle: { color: "#fdba74" } },
      ],
      emphasis: { itemStyle: { shadowBlur: 20, shadowColor: "rgba(249,115,22,0.3)" } },
    }],
  };

  const lineOption = {
    tooltip: { trigger: "axis", backgroundColor: "#fff", borderColor: "#f0f0f0", textStyle: { color: "#111", fontSize: 12 } },
    xAxis: {
      type: "category",
      data: revenueData ? Object.keys(revenueData.monthlyEarnings) : [],
      axisLabel: { fontSize: 11, color: "#aaa" },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 11, color: "#aaa" },
      splitLine: { lineStyle: { color: "#f7f7f7" } },
      axisLine: { show: false },
    },
    series: [{
      data: revenueData ? Object.values(revenueData.monthlyEarnings) : [],
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { color: "#f97316", width: 3 },
      itemStyle: { color: "#f97316", borderColor: "#fff", borderWidth: 2 },
      areaStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(249,115,22,0.15)" }, { offset: 1, color: "rgba(249,115,22,0)" }] },
      },
    }],
    grid: { left: "3%", right: "3%", bottom: "8%", top: "8%", containLabel: true },
  };

  const totalRevenue = revenueData?.totalRevenueAllSellersConverted || 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="px-5 md:px-8 py-7 space-y-5 max-w-[1200px]">

          {/* ── Page header ── */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Admin
              </span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
              Dashboard
            </h1>
            <p className="text-[13px] text-[#aaa] mt-1.5">
              Platform overview — revenue, orders, and gigs at a glance.
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard index={0} label="Total revenue" icon={<HiOutlineCurrencyDollar />}
              value={`${currencySymbol}${totalRevenue.toLocaleString()}`} />
            <StatCard index={1} label="RMGC income (10%)" icon={<HiOutlineTrendingUp />}
              value={`${currencySymbol}${(totalRevenue * 0.1).toLocaleString()}`} />
            <StatCard index={2} label="Completed orders" icon={<HiOutlineShoppingCart />}
              value={orders.length.toString()} />
            <StatCard index={3} label="Total gigs" icon={<HiOutlineCollection />}
              value={gigs.length.toString()} />
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 mb-6">

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white border border-[#f0f0f0] rounded-2xl p-6"
            >
              <SectionHeader eyebrow="Revenue" title="Per service provider" />
              <div className="h-[340px]">
                <ReactECharts option={barOption} style={{ height: "100%", width: "100%" }} />
              </div>
              <PaginationBar
                current={revenueGroup}
                total={Math.ceil(sortedRevenueData.length / usersPerGroup)}
                onPrev={() => setRevenueGroup((p) => Math.max(p - 1, 0))}
                onNext={() => setRevenueGroup((p) => (p + 1) * usersPerGroup < sortedRevenueData.length ? p + 1 : p)}
                onChange={setRevenueGroup}
              />
            </motion.div>

            {/* Donut chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white border border-[#f0f0f0] rounded-2xl p-6 flex flex-col"
            >
              <SectionHeader eyebrow="Breakdown" title="Revenue split" />
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-[260px]">
                  <ReactECharts option={donutOption} style={{ height: "100%", width: "100%" }} />
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {[
                  { label: "Seller revenue", value: `${currencySymbol}${totalRevenue.toLocaleString()}`, color: "bg-orange-500" },
                  { label: "RMGC income (10%)", value: `${currencySymbol}${(totalRevenue * 0.1).toLocaleString()}`, color: "bg-orange-300" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#f7f7f7] last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-[12.5px] text-[#555]">{item.label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#111]">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Line chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white border border-[#f0f0f0] rounded-2xl p-6 mb-6"
          >
            <SectionHeader eyebrow="Trends" title="Monthly company income" />
            <div className="h-[280px]">
              <ReactECharts option={lineOption} style={{ height: "100%", width: "100%" }} />
            </div>
          </motion.div>

          {/* ── Completed orders ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white border border-[#f0f0f0] rounded-2xl p-6 mb-6"
          >
            <SectionHeader eyebrow="Transactions" title="Completed orders" />

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 border border-dashed border-[#ebebeb] rounded-2xl">
                <HiOutlineShoppingCart className="text-[32px] text-[#e5e5e5] mb-3" />
                <p className="text-[13px] text-[#ccc]">No completed orders yet.</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_120px_100px] gap-4 px-4 py-2.5 border-b border-[#f5f5f5] bg-[#fafafa] rounded-xl mb-2">
                  {["Order ID", "Seller", "Buyer", "Total", "Status"].map((h) => (
                    <span key={h} className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase">{h}</span>
                  ))}
                </div>
                <div className="space-y-1">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_120px_100px] gap-4 items-center px-4 py-3.5 rounded-xl border border-transparent hover:border-[#f0f0f0] hover:bg-[#fafafa] transition-all"
                    >
                      <span className="text-[11.5px] font-mono text-[#aaa]">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[13px] font-semibold text-[#333] truncate">{order.sellerName}</span>
                      <span className="text-[13px] text-[#555] truncate">{order.buyerName}</span>
                      <span className="text-[13px] font-bold text-[#111]">
                        {currencySymbol}{order.price.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {order.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* ── All gigs ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="bg-white border border-[#f0f0f0] rounded-2xl p-6"
          >
            <SectionHeader eyebrow="Marketplace" title="All gigs" />

            {groupedGigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 border border-dashed border-[#ebebeb] rounded-2xl">
                <MdOutlineStorefront className="text-[32px] text-[#e5e5e5] mb-3" />
                <p className="text-[13px] text-[#ccc]">No gigs available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedGigs.map((gig, i) => {
                  const user = userDetails[gig.userId];
                  return (
                    <motion.div
                      key={gig._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="group border border-[#f0f0f0] hover:border-orange-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                    >
                      {/* Cover */}
                      <div className="relative w-full h-44 overflow-hidden bg-[#f7f7f7]">
                        <Image
                          src={gig.cover || "/default-cover.png"}
                          alt={gig.shortTitle}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                          onError={(e) => ((e.target as HTMLImageElement).src = "/default-cover.png")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Price badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[11px] font-bold text-white bg-orange-500 px-2.5 py-1 rounded-lg">
                            {currencySymbol}{convertPrice(gig.price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <p className="text-[13.5px] font-semibold text-[#111] truncate mb-1">{gig.title}</p>
                        <p className="text-[12px] text-[#aaa] line-clamp-2 leading-relaxed mb-3">{gig.desc}</p>

                        {/* Seller row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[#f0f0f0]">
                              <Image
                                src={user?.img || "/default-avatar.png"}
                                alt={user?.username || "User"}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => ((e.target as HTMLImageElement).src = "/default-avatar.png")}
                              />
                            </div>
                            <span className="text-[12px] text-[#555] truncate max-w-[100px]">
                              {user?.username || "Unknown"}
                            </span>
                          </div>
                          <button
                            onClick={() => router.push(`/gigdetails/${gig._id}`)}
                            className="text-[11.5px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {gigs.length > usersPerGroup && (
              <PaginationBar
                current={gigGroup}
                total={Math.ceil(gigs.length / usersPerGroup)}
                onPrev={() => setGigGroup((p) => Math.max(p - 1, 0))}
                onNext={() => setGigGroup((p) => p + 1)}
                onChange={setGigGroup}
              />
            )}
          </motion.div>
        </div>
    </div>
  );
}
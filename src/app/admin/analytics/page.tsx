"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineCollection,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineBan,
} from "react-icons/hi";
import { MdOutlineStorefront } from "react-icons/md";
import { LuRefreshCw } from "react-icons/lu";
import newRequest from "../../utils/newRequest";
import { useExchangeRate } from "../../hooks/useExchangeRate";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────

interface Overview {
  totalUsers: number;
  totalOrders: number;
  totalGigs: number;
  totalJobs: number;
  totalApplications: number;
  totalReviews: number;
  completedOrders: number;
  totalRevenue: number;
  conversionRate: number;
  newUsersThisMonth: number;
  newOrdersThisMonth: number;
  platformFee: number;
}

interface GrowthPoint {
  month: string;
  users: number;
  orders: number;
  revenue: number;
}

interface UserAnalytics {
  breakdown: { label: string; value: number }[];
  topCountries: { country: string; count: number }[];
  verifiedCount: number;
  suspendedCount: number;
  vipCount: number;
}

interface OrderAnalytics {
  statusSplit: { label: string; value: number }[];
  avgOrderValue: number;
  totalRevenue: number;
  topSellers: { _id: string; username: string; img: string; revenue: number; orders: number }[];
  originSplit: { label: string; value: number }[];
  currencySplit: { currency: string; count: number }[];
}

interface GigAnalytics {
  topGigs: { _id: string; title: string; cat: string; price: number; sales: number; salesRevenue: number; avgRating: number | null }[];
  categoryDist: { category: string; count: number; totalSales: number }[];
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalGigs: number;
  gigsWithSales: number;
  conversionRate: number;
}

interface ReviewAnalytics {
  starDistribution: { star: number; count: number; pct: number }[];
  avgRating: number;
  totalReviews: number;
  recentTrend: { month: string; count: number; avgStar: number }[];
}

interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  avgAppsPerJob: number;
  industryDist: { industry: string; count: number }[];
  typeDist: { type: string; count: number }[];
  appStatusDist: { label: string; value: number }[];
  topJobsByApps: { _id: string; title: string; industry: string; status: string; applications: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (symbol: string, n: number) =>
  `${symbol}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const CHART_COLORS = {
  orange:  "#f97316",
  orange2: "#fdba74",
  blue:    "#3b82f6",
  teal:    "#14b8a6",
  purple:  "#8b5cf6",
  amber:   "#f59e0b",
  red:     "#ef4444",
  green:   "#22c55e",
  gray:    "#e5e7eb",
};

const PIE_COLORS = [
  CHART_COLORS.orange, CHART_COLORS.blue,   CHART_COLORS.teal,
  CHART_COLORS.purple, CHART_COLORS.amber,  CHART_COLORS.red,
  CHART_COLORS.green,  CHART_COLORS.orange2,
];

const tooltipStyle = {
  backgroundColor: "#fff",
  borderColor: "#f0f0f0",
  textStyle: { color: "#111", fontSize: 12 },
};

// ─── Shared UI ────────────────────────────────────────────────

const SectionHeader = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-1.5">
      <div className="h-px w-5 bg-orange-500" />
      <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
        {eyebrow}
      </span>
    </div>
    <h2 className="text-[18px] font-extrabold text-[#111]">{title}</h2>
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-[#f0f0f0] rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({
  label, value, sub, icon, index,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode; index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.06 }}
    className="bg-white border border-[#f0f0f0] hover:border-orange-200 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-[18px] shrink-0">
        {icon}
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30 group-hover:bg-orange-500 transition-colors" />
    </div>
    <p className="text-[9px] font-bold tracking-widest text-[#bbb] uppercase mb-1 truncate">{label}</p>
    <p className="text-xl font-extrabold text-[#111] tabular-nums leading-snug">{value}</p>
    {sub && <p className="text-[11px] text-[#aaa] mt-1">{sub}</p>}
  </motion.div>
);

const SkeletonCard = ({ h = "h-64" }: { h?: string }) => (
  <div className={`bg-white border border-[#f0f0f0] rounded-2xl ${h} animate-pulse`} />
);

const StarBar = ({ star, count, pct }: { star: number; count: number; pct: number }) => (
  <div className="flex items-center gap-3">
    <span className="text-[11px] font-bold text-[#555] w-4 shrink-0">{star}★</span>
    <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-orange-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
    <span className="text-[11px] text-[#aaa] w-12 text-right tabular-nums">
      {count} <span className="text-[10px]">({pct}%)</span>
    </span>
  </div>
);

// ─── Tab definitions ──────────────────────────────────────────

const TABS = [
  { key: "overview", label: "Overview"  },
  { key: "growth",   label: "Growth"    },
  { key: "users",    label: "Users"     },
  { key: "orders",   label: "Orders"    },
  { key: "gigs",     label: "Gigs"      },
  { key: "reviews",  label: "Reviews"   },
  { key: "jobs",     label: "Jobs"      },
] as const;

type Tab = typeof TABS[number]["key"];

// ─── Main Page ────────────────────────────────────────────────

export default function AdminAnalytics() {
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : null;
  const { currencySymbol, convertPrice } = useExchangeRate(currentUser?.country);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading]     = useState<Partial<Record<Tab | "growth", boolean>>>({});
  const [growthMonths, setGrowthMonths] = useState(12);

  const [overview, setOverview]   = useState<Overview | null>(null);
  const [growth, setGrowth]       = useState<GrowthPoint[]>([]);
  const [users, setUsers]         = useState<UserAnalytics | null>(null);
  const [orders, setOrders]       = useState<OrderAnalytics | null>(null);
  const [gigs, setGigs]           = useState<GigAnalytics | null>(null);
  const [reviews, setReviews]     = useState<ReviewAnalytics | null>(null);
  const [jobs, setJobs]           = useState<JobAnalytics | null>(null);

  const load = useCallback(async (key: Tab | "growth", force = false) => {
    if (loading[key] && !force) return;
    setLoading((p) => ({ ...p, [key]: true }));
    try {
      if (key === "overview") {
        const r = await newRequest.get("/analytics/overview");
        setOverview(r.data);
      } else if (key === "growth") {
        const r = await newRequest.get(`/analytics/growth?months=${growthMonths}`);
        setGrowth(r.data);
      } else if (key === "users") {
        const r = await newRequest.get("/analytics/users");
        setUsers(r.data);
      } else if (key === "orders") {
        const r = await newRequest.get("/analytics/orders");
        setOrders(r.data);
      } else if (key === "gigs") {
        const r = await newRequest.get("/analytics/gigs");
        setGigs(r.data);
      } else if (key === "reviews") {
        const r = await newRequest.get("/analytics/reviews");
        setReviews(r.data);
      } else if (key === "jobs") {
        const r = await newRequest.get("/analytics/jobs");
        setJobs(r.data);
      }
    } catch {
      // silently fail — charts stay empty
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }, [growthMonths, loading]);

  // Load overview + growth on mount
  useEffect(() => { load("overview"); load("growth"); }, []);// eslint-disable-line

  // Load section data when tab changes
  useEffect(() => {
    if (activeTab !== "overview") load(activeTab);
  }, [activeTab]); // eslint-disable-line

  // Reload growth when months slider changes
  useEffect(() => { load("growth", true); }, [growthMonths]); // eslint-disable-line

  const isLoading = (key: Tab | "growth") => !!loading[key];

  // ── Chart options ────────────────────────────────────────────

  const growthLineOption = {
    tooltip: { trigger: "axis", ...tooltipStyle },
    legend: {
      data: ["Users", "Orders", "Revenue"],
      bottom: 0,
      textStyle: { fontSize: 11, color: "#888" },
    },
    xAxis: {
      type: "category",
      data: growth.map((g) => g.month),
      axisLabel: { fontSize: 10, color: "#aaa", rotate: 30 },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "Count",
        nameTextStyle: { fontSize: 10, color: "#aaa" },
        axisLabel: { fontSize: 10, color: "#aaa", formatter: (v: number) => fmtK(v) },
        splitLine: { lineStyle: { color: "#f7f7f7" } },
        axisLine: { show: false },
      },
      {
        type: "value",
        name: "Revenue",
        nameTextStyle: { fontSize: 10, color: "#aaa" },
        axisLabel: {
          fontSize: 10, color: "#aaa",
          formatter: (v: number) => fmt(currencySymbol, convertPrice(v)),
        },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: "Users",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: growth.map((g) => g.users),
        lineStyle: { color: CHART_COLORS.blue, width: 2.5 },
        itemStyle: { color: CHART_COLORS.blue, borderColor: "#fff", borderWidth: 2 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(59,130,246,0.12)" }, { offset: 1, color: "rgba(59,130,246,0)" }] } },
      },
      {
        name: "Orders",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: growth.map((g) => g.orders),
        lineStyle: { color: CHART_COLORS.teal, width: 2.5 },
        itemStyle: { color: CHART_COLORS.teal, borderColor: "#fff", borderWidth: 2 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(20,184,166,0.12)" }, { offset: 1, color: "rgba(20,184,166,0)" }] } },
      },
      {
        name: "Revenue",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: growth.map((g) => convertPrice(g.revenue)),
        lineStyle: { color: CHART_COLORS.orange, width: 2.5 },
        itemStyle: { color: CHART_COLORS.orange, borderColor: "#fff", borderWidth: 2 },
        areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(249,115,22,0.12)" }, { offset: 1, color: "rgba(249,115,22,0)" }] } },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "16%", top: "8%", containLabel: true },
  };

  const userBreakdownDonut = {
    tooltip: { trigger: "item", ...tooltipStyle, formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: ${p.value} (${p.percent}%)` },
    series: [{
      type: "pie",
      radius: ["42%", "68%"],
      data: (users?.breakdown ?? []).map((b, i) => ({
        name: b.label, value: b.value,
        itemStyle: { color: PIE_COLORS[i] },
      })),
      label: { show: true, formatter: "{b}\n{d}%", fontSize: 11, color: "#555" },
      labelLine: { show: true, length: 8, length2: 6 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.1)" } },
    }],
  };

  const countryBarOption = {
    tooltip: { trigger: "axis", ...tooltipStyle },
    xAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "#aaa" },
      splitLine: { lineStyle: { color: "#f7f7f7" } },
      axisLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: (users?.topCountries ?? []).map((c) => c.country).reverse(),
      axisLabel: { fontSize: 11, color: "#555" },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: "bar",
      data: (users?.topCountries ?? []).map((c) => c.count).reverse(),
      barWidth: "55%",
      itemStyle: { color: CHART_COLORS.blue, borderRadius: [0, 6, 6, 0] },
    }],
    grid: { left: "2%", right: "6%", bottom: "5%", top: "5%", containLabel: true },
  };

  const orderStatusDonut = {
    tooltip: { trigger: "item", ...tooltipStyle },
    series: [{
      type: "pie",
      radius: ["42%", "68%"],
      data: (orders?.statusSplit ?? []).map((s, i) => ({
        name: s.label, value: s.value,
        itemStyle: { color: i === 0 ? CHART_COLORS.green : CHART_COLORS.gray },
      })),
      label: { show: true, formatter: "{b}\n{d}%", fontSize: 11, color: "#555" },
      labelLine: { show: true, length: 8, length2: 6 },
    }],
  };

  const originDonut = {
    tooltip: { trigger: "item", ...tooltipStyle },
    series: [{
      type: "pie",
      radius: ["42%", "68%"],
      data: (orders?.originSplit ?? []).map((s, i) => ({
        name: s.label, value: s.value,
        itemStyle: { color: i === 0 ? CHART_COLORS.orange : CHART_COLORS.purple },
      })),
      label: { show: true, formatter: "{b}\n{d}%", fontSize: 11, color: "#555" },
      labelLine: { show: true, length: 8, length2: 6 },
    }],
  };

  const topSellersBar = {
    tooltip: {
      trigger: "axis", ...tooltipStyle,
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>${fmt(currencySymbol, convertPrice(params[0].value))}`,
    },
    xAxis: {
      type: "category",
      data: (orders?.topSellers ?? []).map((s) => s.username),
      axisLabel: { rotate: 30, fontSize: 10, color: "#aaa" },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "#aaa", formatter: (v: number) => fmt(currencySymbol, convertPrice(v)) },
      splitLine: { lineStyle: { color: "#f7f7f7" } },
      axisLine: { show: false },
    },
    series: [{
      type: "bar",
      data: (orders?.topSellers ?? []).map((s) => convertPrice(s.revenue)),
      barWidth: "50%",
      itemStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "#ea580c" }] },
        borderRadius: [8, 8, 0, 0],
      },
    }],
    grid: { left: "3%", right: "3%", bottom: "22%", top: "5%", containLabel: true },
  };

  const categoryBarOption = {
    tooltip: { trigger: "axis", ...tooltipStyle },
    xAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "#aaa" },
      splitLine: { lineStyle: { color: "#f7f7f7" } },
      axisLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: (gigs?.categoryDist ?? []).map((c) => c.category).reverse(),
      axisLabel: { fontSize: 10, color: "#555" },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [{
      type: "bar",
      data: (gigs?.categoryDist ?? []).map((c) => c.count).reverse(),
      barWidth: "55%",
      itemStyle: { color: CHART_COLORS.orange, borderRadius: [0, 6, 6, 0] },
    }],
    grid: { left: "2%", right: "6%", bottom: "5%", top: "5%", containLabel: true },
  };

  const reviewTrendOption = {
    tooltip: { trigger: "axis", ...tooltipStyle },
    xAxis: {
      type: "category",
      data: (reviews?.recentTrend ?? []).map((r) => r.month),
      axisLabel: { fontSize: 10, color: "#aaa" },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "Count",
        nameTextStyle: { fontSize: 10, color: "#aaa" },
        axisLabel: { fontSize: 10, color: "#aaa" },
        splitLine: { lineStyle: { color: "#f7f7f7" } },
        axisLine: { show: false },
      },
      {
        type: "value",
        name: "Avg ★",
        nameTextStyle: { fontSize: 10, color: "#aaa" },
        min: 1,
        max: 5,
        axisLabel: { fontSize: 10, color: "#aaa" },
        splitLine: { show: false },
        axisLine: { show: false },
      },
    ],
    series: [
      {
        name: "Reviews",
        type: "bar",
        data: (reviews?.recentTrend ?? []).map((r) => r.count),
        barWidth: "40%",
        itemStyle: { color: CHART_COLORS.orange2, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Avg rating",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        data: (reviews?.recentTrend ?? []).map((r) => r.avgStar),
        lineStyle: { color: CHART_COLORS.amber, width: 2.5 },
        itemStyle: { color: CHART_COLORS.amber, borderColor: "#fff", borderWidth: 2 },
      },
    ],
    legend: { data: ["Reviews", "Avg rating"], bottom: 0, textStyle: { fontSize: 11, color: "#888" } },
    grid: { left: "3%", right: "4%", bottom: "16%", top: "8%", containLabel: true },
  };

  const industryDonut = {
    tooltip: { trigger: "item", ...tooltipStyle },
    series: [{
      type: "pie",
      radius: ["38%", "65%"],
      data: (jobs?.industryDist ?? []).map((d, i) => ({
        name: d.industry, value: d.count,
        itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
      })),
      label: { show: true, formatter: "{b}\n{d}%", fontSize: 10, color: "#555" },
      labelLine: { show: true, length: 6, length2: 5 },
    }],
  };

  const appStatusDonut = {
    tooltip: { trigger: "item", ...tooltipStyle },
    series: [{
      type: "pie",
      radius: ["38%", "65%"],
      data: (jobs?.appStatusDist ?? []).map((s, i) => ({
        name: s.label, value: s.value,
        itemStyle: { color: [CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.red][i] },
      })),
      label: { show: true, formatter: "{b}\n{d}%", fontSize: 10, color: "#555" },
      labelLine: { show: true, length: 6, length2: 5 },
    }],
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="px-5 md:px-8 py-7 max-w-[1400px]">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-orange-500" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">Admin</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">Analytics</h1>
              <p className="text-[13px] text-[#aaa] mt-1.5">Platform-wide metrics across users, orders, gigs, reviews, and jobs.</p>
            </div>
            <button
              onClick={() => load(activeTab, true)}
              className="flex items-center gap-2 text-[12px] font-semibold text-[#888] hover:text-orange-500 border border-[#ebebeb] hover:border-orange-200 px-4 py-2.5 rounded-xl transition-all"
            >
              <LuRefreshCw className={`text-[13px] ${isLoading(activeTab) ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap mb-7 border-b border-[#f0f0f0] pb-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-[12.5px] font-bold px-4 py-2.5 border-b-2 transition-all -mb-px ${
                activeTab === t.key
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-[#888] hover:text-[#555]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {isLoading("overview") ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} h="h-28" />)}
              </div>
            ) : overview && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total revenue",    value: fmt(currencySymbol, convertPrice(overview.totalRevenue)), sub: `Platform fee: ${fmt(currencySymbol, convertPrice(overview.platformFee))}`, icon: <HiOutlineCurrencyDollar /> },
                    { label: "Completed orders", value: String(overview.completedOrders), sub: `${overview.conversionRate}% conversion`,   icon: <HiOutlineShoppingCart />    },
                    { label: "Total users",      value: String(overview.totalUsers),      sub: `+${overview.newUsersThisMonth} this month`, icon: <HiOutlineUsers />           },
                    { label: "Total gigs",       value: String(overview.totalGigs),       sub: undefined,                                   icon: <MdOutlineStorefront />       },
                    { label: "Total orders",     value: String(overview.totalOrders),     sub: `+${overview.newOrdersThisMonth} this month`, icon: <HiOutlineTrendingUp />      },
                    { label: "Total reviews",    value: String(overview.totalReviews),    sub: undefined,                                   icon: <HiOutlineStar />             },
                    { label: "Total jobs",       value: String(overview.totalJobs),       sub: undefined,                                   icon: <HiOutlineBriefcase />        },
                    { label: "Applications",     value: String(overview.totalApplications), sub: undefined,                                 icon: <HiOutlineDocumentText />     },
                  ].map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
                </div>

                {/* Growth sparkline preview */}
                <Card>
                  <SectionHeader eyebrow="Trends" title="Platform growth" />
                  {isLoading("growth") ? (
                    <div className="h-72 animate-pulse bg-[#f7f7f7] rounded-xl" />
                  ) : (
                    <div className="h-72">
                      <ReactECharts option={growthLineOption} style={{ height: "100%", width: "100%" }} />
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── GROWTH TAB ───────────────────────────────────────── */}
        {activeTab === "growth" && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <SectionHeader eyebrow="Growth" title="Users, orders & revenue over time" />
                <div className="flex items-center gap-2 shrink-0">
                  {[6, 12, 24].map((m) => (
                    <button
                      key={m}
                      onClick={() => setGrowthMonths(m)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        growthMonths === m
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-[#888] border-[#ebebeb] hover:border-orange-200"
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>
              {isLoading("growth") ? (
                <div className="h-80 animate-pulse bg-[#f7f7f7] rounded-xl" />
              ) : (
                <div className="h-80">
                  <ReactECharts option={growthLineOption} style={{ height: "100%", width: "100%" }} />
                </div>
              )}
            </Card>

            {/* Monthly table */}
            {!isLoading("growth") && growth.length > 0 && (
              <Card>
                <SectionHeader eyebrow="Data" title="Monthly breakdown" />
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-[#f5f5f5]">
                        {["Month", "New users", "Orders", "Revenue"].map((h) => (
                          <th key={h} className="text-left text-[10px] font-bold tracking-[0.12em] text-[#bbb] uppercase pb-3 pr-6">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...growth].reverse().map((row) => (
                        <tr key={row.month} className="border-b border-[#f7f7f7] last:border-0 hover:bg-[#fafafa] transition-colors">
                          <td className="py-3 pr-6 font-semibold text-[#333]">{row.month}</td>
                          <td className="py-3 pr-6 text-[#555] tabular-nums">{row.users}</td>
                          <td className="py-3 pr-6 text-[#555] tabular-nums">{row.orders}</td>
                          <td className="py-3 font-bold text-[#111] tabular-nums">
                            {fmt(currencySymbol, convertPrice(row.revenue))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── USERS TAB ────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {isLoading("users") ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkeletonCard h="h-80" /><SkeletonCard h="h-80" />
              </div>
            ) : users && (
              <>
                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Verified accounts", value: String(users.verifiedCount),  icon: <HiOutlineCheckCircle /> },
                    { label: "Suspended",          value: String(users.suspendedCount), icon: <HiOutlineBan />         },
                    { label: "VIP members",        value: String(users.vipCount),       icon: <HiOutlineStar />        },
                  ].map((c, i) => (
                    <KpiCard key={c.label} label={c.label} value={c.value} icon={c.icon} index={i} />
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card>
                    <SectionHeader eyebrow="Breakdown" title="Users by type" />
                    <div className="h-72">
                      <ReactECharts option={userBreakdownDonut} style={{ height: "100%", width: "100%" }} />
                    </div>
                    <div className="space-y-2 mt-4">
                      {users.breakdown.map((b, i) => (
                        <div key={b.label} className="flex items-center justify-between py-2 border-b border-[#f7f7f7] last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-[12.5px] text-[#555]">{b.label}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[#111] tabular-nums">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader eyebrow="Geography" title="Top countries" />
                    <div className="h-80">
                      <ReactECharts option={countryBarOption} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ───────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {isLoading("orders") ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <SkeletonCard h="h-80" /><SkeletonCard h="h-80" /><SkeletonCard h="h-80" />
              </div>
            ) : orders && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Avg order value", value: fmt(currencySymbol, convertPrice(orders.avgOrderValue)), icon: <HiOutlineCurrencyDollar /> },
                    { label: "Total revenue",   value: fmt(currencySymbol, convertPrice(orders.totalRevenue)),  icon: <HiOutlineTrendingUp />      },
                    { label: "Currencies used", value: String(orders.currencySplit.length),                     icon: <HiOutlineCollection />       },
                  ].map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Status donut */}
                  <Card>
                    <SectionHeader eyebrow="Status" title="Order completion" />
                    <div className="h-60">
                      <ReactECharts option={orderStatusDonut} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>

                  {/* Origin donut */}
                  <Card>
                    <SectionHeader eyebrow="Origin" title="Order source" />
                    <div className="h-60">
                      <ReactECharts option={originDonut} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>

                  {/* Currency split */}
                  <Card>
                    <SectionHeader eyebrow="Currency" title="Orders by currency" />
                    <div className="space-y-3 mt-2">
                      {orders.currencySplit.map((c, i) => {
                        const total = orders.currencySplit.reduce((s, x) => s + x.count, 0);
                        const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                        return (
                          <div key={c.currency}>
                            <div className="flex justify-between text-[12px] mb-1">
                              <span className="font-semibold text-[#333]">{c.currency}</span>
                              <span className="text-[#aaa]">{c.count} orders ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* Top sellers bar */}
                <Card>
                  <SectionHeader eyebrow="Revenue" title="Top sellers" />
                  <div className="h-72">
                    <ReactECharts option={topSellersBar} style={{ height: "100%", width: "100%" }} />
                  </div>

                  {/* Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-[#f5f5f5]">
                          {["Seller", "Orders", "Revenue"].map((h) => (
                            <th key={h} className="text-left text-[10px] font-bold tracking-[0.12em] text-[#bbb] uppercase pb-3 pr-6">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.topSellers.map((s) => (
                          <tr key={s._id} className="border-b border-[#f7f7f7] last:border-0 hover:bg-[#fafafa] transition-colors">
                            <td className="py-3 pr-6 font-semibold text-[#333]">{s.username}</td>
                            <td className="py-3 pr-6 text-[#555] tabular-nums">{s.orders}</td>
                            <td className="py-3 font-bold text-[#111] tabular-nums">
                              {fmt(currencySymbol, convertPrice(s.revenue))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ── GIGS TAB ─────────────────────────────────────────── */}
        {activeTab === "gigs" && (
          <div className="space-y-6">
            {isLoading("gigs") ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkeletonCard h="h-80" /><SkeletonCard h="h-80" />
              </div>
            ) : gigs && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Avg price",     value: fmt(currencySymbol, convertPrice(gigs.avgPrice)),    icon: <HiOutlineCurrencyDollar /> },
                    { label: "Min price",     value: fmt(currencySymbol, convertPrice(gigs.minPrice)),    icon: <HiOutlineCurrencyDollar /> },
                    { label: "Max price",     value: fmt(currencySymbol, convertPrice(gigs.maxPrice)),    icon: <HiOutlineCurrencyDollar /> },
                    { label: "Gigs with sales", value: `${gigs.gigsWithSales} (${gigs.conversionRate}%)`, icon: <MdOutlineStorefront />     },
                  ].map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card>
                    <SectionHeader eyebrow="Categories" title="Gigs by category" />
                    <div className="h-80">
                      <ReactECharts option={categoryBarOption} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader eyebrow="Performance" title="Top gigs by sales" />
                    <div className="space-y-0">
                      {gigs.topGigs.map((g, i) => (
                        <div key={g._id} className="flex items-center gap-3 py-3 border-b border-[#f7f7f7] last:border-0">
                          <span className="text-[11px] font-bold text-[#ccc] w-5 shrink-0 tabular-nums">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-semibold text-[#111] truncate">{g.title}</p>
                            <p className="text-[10.5px] text-[#aaa]">{g.cat}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[12px] font-bold text-[#111]">{g.sales} sales</p>
                            {g.avgRating && (
                              <p className="text-[10px] text-amber-500">★ {g.avgRating}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ──────────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {isLoading("reviews") ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkeletonCard h="h-80" /><SkeletonCard h="h-80" />
              </div>
            ) : reviews && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  <KpiCard label="Average rating" value={`${reviews.avgRating} / 5`} icon={<HiOutlineStar />} index={0} />
                  <KpiCard label="Total reviews"  value={String(reviews.totalReviews)} icon={<HiOutlineCollection />} index={1} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card>
                    <SectionHeader eyebrow="Distribution" title="Star breakdown" />
                    <div className="space-y-3 mt-2">
                      {reviews.starDistribution.map((s) => (
                        <StarBar key={s.star} star={s.star} count={s.count} pct={s.pct} />
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#f5f5f5] flex items-center justify-between">
                      <span className="text-[12px] text-[#aaa]">Platform average</span>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className={`text-[16px] ${s <= Math.round(reviews.avgRating) ? "text-amber-400" : "text-[#e5e7eb]"}`}>★</span>
                        ))}
                        <span className="text-[13px] font-bold text-[#111] ml-1">{reviews.avgRating}</span>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader eyebrow="Trend" title="Review volume & quality" />
                    <div className="h-72">
                      <ReactECharts option={reviewTrendOption} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── JOBS TAB ─────────────────────────────────────────── */}
        {activeTab === "jobs" && (
          <div className="space-y-6">
            {isLoading("jobs") ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkeletonCard h="h-80" /><SkeletonCard h="h-80" />
              </div>
            ) : jobs && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total jobs",        value: String(jobs.totalJobs),         icon: <HiOutlineBriefcase />    },
                    { label: "Active jobs",        value: String(jobs.activeJobs),        icon: <HiOutlineTrendingUp />   },
                    { label: "Applications",       value: String(jobs.totalApplications), icon: <HiOutlineDocumentText /> },
                    { label: "Avg apps / job",     value: String(jobs.avgAppsPerJob),     icon: <HiOutlineUsers />        },
                  ].map((c, i) => <KpiCard key={c.label} {...c} index={i} />)}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card>
                    <SectionHeader eyebrow="Industries" title="Jobs by industry" />
                    <div className="h-72">
                      <ReactECharts option={industryDonut} style={{ height: "100%", width: "100%" }} />
                    </div>
                  </Card>

                  <Card>
                    <SectionHeader eyebrow="Applications" title="Application status split" />
                    <div className="h-72">
                      <ReactECharts option={appStatusDonut} style={{ height: "100%", width: "100%" }} />
                    </div>
                    <div className="space-y-2 mt-4">
                      {jobs.appStatusDist.map((s, i) => (
                        <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#f7f7f7] last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: [CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.red][i] }}
                            />
                            <span className="text-[12.5px] text-[#555]">{s.label}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[#111] tabular-nums">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Job type distribution */}
                <Card>
                  <SectionHeader eyebrow="Job types" title="Employment type breakdown" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {jobs.typeDist.map((t, i) => (
                      <div key={t.type} className="text-center p-4 border border-[#f0f0f0] rounded-2xl hover:border-orange-200 transition-colors">
                        <p className="text-[22px] font-extrabold text-[#111] tabular-nums">{t.count}</p>
                        <p className="text-[10.5px] font-semibold text-[#aaa] mt-1">{t.type}</p>
                        <div className="mt-2 h-1 rounded-full mx-auto w-8" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top jobs by applications */}
                <Card>
                  <SectionHeader eyebrow="Top jobs" title="Most applied-to positions" />
                  <div className="space-y-0">
                    {jobs.topJobsByApps.map((j, i) => (
                      <div key={j._id} className="flex items-center gap-4 py-3.5 border-b border-[#f7f7f7] last:border-0">
                        <span className="text-[11px] font-bold text-[#ccc] w-5 shrink-0 tabular-nums">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#111] truncate">{j.title}</p>
                          <p className="text-[11px] text-[#aaa]">{j.industry}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          j.status === "Active"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}>
                          {j.status}
                        </span>
                        <span className="text-[13px] font-bold text-[#111] tabular-nums shrink-0">
                          {j.applications} apps
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Missing icon imports (add to your import block) ──────────
// import { HiOutlineCheckCircle, HiOutlineBan } from "react-icons/hi";
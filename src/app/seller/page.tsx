"use client";

import React, { useEffect, useState } from "react";
import * as echarts from "echarts";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ReactECharts from "echarts-for-react";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import Image from "next/image";
import Footer from "../components/footer";
import Skeleton from "react-loading-skeleton";
// @ts-ignore: side-effect import for Skeleton styles
import "react-loading-skeleton/dist/skeleton.css";
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
  BriefcaseIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type RevenueEntry = { title: string; totalRevenue: number };
type MonthlyEntry = { month: string; totalRevenue: number };

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) => (
  <div
    className={`flex flex-col gap-1 rounded-2xl px-5 py-4 border transition-all duration-200 ${
      accent
        ? "bg-[#f97316] border-[#f97316] text-white"
        : "bg-white border-neutral-200 text-neutral-900"
    }`}
  >
    <span
      className={`text-[10px] font-bold uppercase tracking-widest ${
        accent ? "text-orange-100" : "text-neutral-400"
      }`}
    >
      {label}
    </span>
    <span className="text-2xl font-black leading-none mt-1 tracking-tight">
      {value}
    </span>
    {sub && (
      <span
        className={`text-[11px] mt-0.5 ${
          accent ? "text-orange-100" : "text-neutral-400"
        }`}
      >
        {sub}
      </span>
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-[13px] font-bold text-neutral-900 tracking-tight flex items-center gap-2.5 uppercase">
      <span className="block w-1 h-4 rounded-full bg-[#f97316]" />
      {title}
    </h2>
    {action}
  </div>
);

// ─── Panel ────────────────────────────────────────────────────────────────────
const Panel = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 ${className}`}
  >
    {children}
  </motion.section>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const router = useRouter();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await newRequest.get("/users/profile");
      return response.data;
    },
  });

  const { currencySymbol, convertPrice, countryCurrency } = useExchangeRate(
    user?.country,
  );

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["fetchOrders"],
    queryFn: async () => {
      const res = await newRequest.get("/orders");
      return res.data || [];
    },
  });

  const {
    data: gigs = [],
    isLoading: gigsLoading,
    error: gigsError,
  } = useQuery({
    queryKey: ["userGigs", user?._id],
    enabled: !!user?._id,
    queryFn: async () => {
      const response = await newRequest.get(`/gigs?userId=${user._id}`);
      return response.data;
    },
  });

  const [revenueData, setRevenueData] = useState([] as RevenueEntry[]);
  const [totalRevenueAllGigs, setTotalRevenueAllGigs] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState([] as MonthlyEntry[]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { data } = await newRequest.get("/orders/seller-revenue");
        setRevenueData(data.revenueData);
        setTotalRevenueAllGigs(data.totalRevenueAllGigs);
        setMonthlyEarnings(
          data.monthlyEarnings.map((entry: any) => ({
            month: entry.month,
            totalRevenue: parseFloat(entry.totalRevenue),
          })),
        );
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };
    fetchRevenueData();
  }, []);

  // ─── Chart base ───────────────────────────────────────────────────────────
  const chartBase = {
    backgroundColor: "transparent",
    grid: {
      left: "2%",
      right: "2%",
      bottom: "4%",
      top: "4%",
      containLabel: true,
    },
    tooltip: {
      backgroundColor: "#fff",
      borderColor: "#e5e5e5",
      borderWidth: 1,
      textStyle: { color: "#171717", fontSize: 12 },
      extraCssText:
        "box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 10px; padding: 8px 12px;",
    },
  };

  const barOption = {
    ...chartBase,
    tooltip: {
      ...chartBase.tooltip,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) =>
        `<strong>${params[0].name}</strong><br/>${currencySymbol}${params[0].value.toLocaleString()}`,
    },
    xAxis: {
      type: "category",
      data: revenueData.map((g) => g.title),
      axisLabel: { rotate: 20, color: "#a3a3a3", fontSize: 11 },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#a3a3a3", fontSize: 11 },
      splitLine: { lineStyle: { color: "#f5f5f5", type: "dashed" } },
    },
    series: [
      {
        data: revenueData.map((g) => g.totalRevenue),
        type: "bar",
        barMaxWidth: 36,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#f97316" },
            { offset: 1, color: "#fed7aa" },
          ]),
          borderRadius: [5, 5, 0, 0],
        },
        emphasis: { itemStyle: { color: "#ea6600" } },
      },
    ],
  };

  const lineOption = {
    ...chartBase,
    tooltip: {
      ...chartBase.tooltip,
      trigger: "axis",
      formatter: (params: any) =>
        `<strong>${params[0].axisValue}</strong><br/>${currencySymbol}${params[0].value.toLocaleString()}`,
    },
    xAxis: {
      type: "category",
      data: monthlyEarnings.map((m) => m.month),
      boundaryGap: false,
      axisLabel: { color: "#a3a3a3", fontSize: 11 },
      axisLine: { lineStyle: { color: "#f0f0f0" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#a3a3a3", fontSize: 11 },
      splitLine: { lineStyle: { color: "#f5f5f5", type: "dashed" } },
    },
    series: [
      {
        data: monthlyEarnings.map((e) => e.totalRevenue),
        type: "line",
        smooth: true,
        lineStyle: { color: "#f97316", width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(249,115,22,0.15)" },
            { offset: 1, color: "rgba(249,115,22,0)" },
          ]),
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: { color: "#f97316", borderWidth: 2, borderColor: "#fff" },
      },
    ],
  };

  const donutOption = {
    ...chartBase,
    tooltip: {
      ...chartBase.tooltip,
      trigger: "item",
      formatter: (params: any) =>
        `${params.name}<br/>${currencySymbol}${params.value.toLocaleString()} <span style="color:#a3a3a3">(${params.percent}%)</span>`,
    },
    legend: { show: false },
    series: [
      {
        name: "Gig Revenue",
        type: "pie",
        radius: ["48%", "70%"],
        center: ["50%", "50%"],
        itemStyle: { borderRadius: 5, borderColor: "#fff", borderWidth: 3 },
        label: { show: false },
        data: revenueData.map((g) => ({
          name: g.title,
          value: g.totalRevenue,
        })),
      },
    ],
    color: ["#f97316", "#0ea5e9", "#8b5cf6", "#10b981", "#ef4444", "#eab308"],
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (userLoading || gigsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6 space-y-5">
        <Skeleton height={28} width={180} borderRadius={8} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={90} borderRadius={16} />
          ))}
        </div>
        <Skeleton height={300} borderRadius={16} />
        <Skeleton height={300} borderRadius={16} />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (userError || gigsError || ordersError) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="max-w-xs w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">
            Something went wrong
          </h2>
          <p className="text-sm text-neutral-400">
            We couldn&apos;t load your dashboard. Try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-[#f97316] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Derived ──────────────────────────────────────────────────────────────
  const completedOrders =
    orders?.sellerOrders?.filter((o: any) => o.isCompleted) ?? [];
  const pendingOrders =
    orders?.sellerOrders?.filter((o: any) => !o.isCompleted) ?? [];

  const palette = [
    "#f97316",
    "#0ea5e9",
    "#8b5cf6",
    "#10b981",
    "#ef4444",
    "#eab308",
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="px-5 md:px-8 py-7 space-y-5 max-w-[1200px]">
        {/* ── Page title ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] mb-0.5">
              Overview
            </p>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
              {user?.username || "Dashboard"}
            </h1>
          </div>
          <button
            onClick={() => router.push("/seller/profile-edit")}
            className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold border border-neutral-200 bg-white px-3.5 py-2 rounded-xl hover:border-[#f97316] hover:text-[#f97316] transition-colors"
          >
            <PencilSquareIcon className="w-3.5 h-3.5" />
            Edit profile
          </button>
        </motion.div>

        {/* ── Stat cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="grid grid-cols-2 xl:grid-cols-4 gap-3"
        >
          <StatCard
            label="Total revenue"
            value={`${currencySymbol}${new Intl.NumberFormat().format(
              totalRevenueAllGigs,
            )}`}
            sub={countryCurrency}
            accent
          />
          <StatCard
            label="Active gigs"
            value={gigs.length}
            sub="listed services"
          />
          <StatCard
            label="Completed"
            value={completedOrders.length}
            sub="orders fulfilled"
          />
          <StatCard
            label="Pending"
            value={pendingOrders.length}
            sub="awaiting completion"
          />
        </motion.div>

        {/* ── Profile ── */}
       <Panel delay={0.08}>
  <SectionHeader
    title="Profile"
    action={
      <button
        onClick={() => router.push("/seller/profile-edit")}
        className="sm:hidden text-[11px] font-semibold text-[#f97316] flex items-center gap-1"
      >
        <PencilSquareIcon className="w-3 h-3" />
        Edit
      </button>
    }
  />

  {/* Avatar + name row */}
  <div className="flex items-center gap-4 mb-4">
    <div className="relative shrink-0">
      <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-neutral-100">
        <Image
          src={
            user?.img ||
            "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
          }
          alt={user?.username || "Profile"}
          width={56}
          height={56}
          className="object-cover w-full h-full"
        />
      </div>
      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
    </div>

    <div className="min-w-0">
      <h3 className="text-[15px] font-bold text-neutral-900 leading-tight truncate">
        {user?.username}
      </h3>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {user?.country && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-md">
            <MapPinIcon className="w-3 h-3 shrink-0" />
            {user.country}
          </span>
        )}
        {(user?.yearsOfExperience ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-md">
            <BriefcaseIcon className="w-3 h-3 shrink-0" />
            {user.yearsOfExperience}yr exp.
          </span>
        )}
      </div>
    </div>
  </div>

  {/* Bio — full width, no clamp */}
  {user?.desc ? (
    <p className="text-[12.5px] text-neutral-500 leading-relaxed mb-4 whitespace-pre-line break-words">
      {user.desc}
    </p>
  ) : (
    <p className="text-[12px] text-neutral-300 italic mb-4">No bio added yet.</p>
  )}

  {/* Services — wrapping pills */}
  {user?.services && user.services.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {(Array.isArray(user.services) ? user.services : [user.services]).map(
        (s: string, i: number) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-50 text-[#f97316] px-2.5 py-1 rounded-lg"
          >
            <SparklesIcon className="w-3 h-3 shrink-0" />
            {s}
          </span>
        )
      )}
    </div>
  )}
</Panel>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Panel delay={0.12}>
            <SectionHeader title="Revenue per gig" />
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <ReactECharts
                  option={barOption}
                  style={{ height: "260px", width: "100%" }}
                  onChartReady={(chart) => {
                    window.addEventListener("resize", () => chart.resize());
                  }}
                />
              </div>
            </div>
          </Panel>

          <Panel delay={0.14}>
            <SectionHeader title="Monthly earnings" />
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <ReactECharts
                  option={lineOption}
                  style={{ height: "260px", width: "100%" }}
                  onChartReady={(chart) => {
                    window.addEventListener("resize", () => chart.resize());
                  }}
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Donut ── */}
        <Panel delay={0.16}>
          <SectionHeader title="Revenue distribution" />
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-2/5 overflow-x-auto">
              <div className="min-w-[220px]">
                <ReactECharts
                  option={donutOption}
                  style={{ height: "240px", width: "100%" }}
                  onChartReady={(chart) => {
                    window.addEventListener("resize", () => chart.resize());
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-3/5 space-y-2.5">
              {revenueData.map((gig, i) => {
                const pct = totalRevenueAllGigs
                  ? Math.round((gig.totalRevenue / totalRevenueAllGigs) * 100)
                  : 0;
                return (
                  <div key={gig.title} className="flex items-center gap-3">
                    <span
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{ background: palette[i % palette.length] }}
                    />
                    <span className="text-[12px] text-neutral-600 flex-1 truncate">
                      {gig.title}
                    </span>
                    <span className="text-[12px] font-bold text-neutral-900 tabular-nums">
                      {currencySymbol}
                      {gig.totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-neutral-400 tabular-nums w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
              {revenueData.length === 0 && (
                <p className="text-[12px] text-neutral-400">
                  No revenue data yet.
                </p>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Gigs ── */}
        <Panel delay={0.18}>
          <SectionHeader
            title="Your gigs"
            action={
              <span className="text-[11px] font-semibold text-neutral-400">
                {gigs.length} listing{gigs.length !== 1 ? "s" : ""}
              </span>
            }
          />

          {gigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {gigs.map((gig: any) => (
                <motion.div
                  key={gig._id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="group rounded-xl border border-neutral-200 overflow-hidden bg-white hover:border-[#f97316] hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/gigdetails/${gig._id}`)}
                >
                  <div className="relative h-36 w-full bg-neutral-100">
                    <Image
                      src={gig.cover}
                      alt={gig.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5">
                    <h3 className="font-bold text-neutral-900 text-[13px] leading-snug line-clamp-1">
                      {gig.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {gig.desc}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[13px] font-black text-[#f97316]">
                        {currencySymbol}
                        {new Intl.NumberFormat().format(
                          convertPrice(gig.price),
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 group-hover:text-[#f97316] transition-colors">
                        View
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-[#f97316]" />
              </div>
              <p className="text-[13px] font-bold text-neutral-700">
                No gigs yet
              </p>
              <p className="text-[11px] text-neutral-400">
                Create your first gig to start earning.
              </p>
            </div>
          )}
        </Panel>

        {/* ── Orders ── */}
        <Panel delay={0.2}>
          <SectionHeader
            title="Orders"
            action={
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                  <CheckBadgeIcon className="w-3 h-3" />
                  {completedOrders.length} done
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-50 text-[#f97316] px-2 py-1 rounded-lg">
                  <ClockIcon className="w-3 h-3" />
                  {pendingOrders.length} pending
                </span>
              </div>
            }
          />

          {orders?.sellerOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-3 pr-4">
                      Order ID
                    </th>
                    <th className="text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-3 pr-4">
                      Amount
                    </th>
                    <th className="text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {orders.sellerOrders.map((order: any) => (
                    <tr
                      key={order._id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-[11px] text-neutral-400 truncate max-w-[140px]">
                        {order._id}
                      </td>
                      <td className="py-3 pr-4 font-bold text-[13px] text-neutral-900 tabular-nums">
                        {currencySymbol}
                        {new Intl.NumberFormat().format(order.price)}
                        <span className="ml-1 text-[11px] font-normal text-neutral-400">
                          {countryCurrency}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${
                            order.isCompleted
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-[#f97316]"
                          }`}
                        >
                          {order.isCompleted ? (
                            <CheckBadgeIcon className="w-3 h-3" />
                          ) : (
                            <ClockIcon className="w-3 h-3" />
                          )}
                          {order.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-[13px] font-bold text-neutral-700">
                No orders yet
              </p>
              <p className="text-[11px] text-neutral-400">
                Orders will appear here as they come in.
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;

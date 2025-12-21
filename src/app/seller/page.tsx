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
import SellerNavbar from "./components/navbar";
import Footer from "../components/footer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const FloatingCircle = ({
  size,
  color,
  duration,
  delay,
  top,
  left,
}: {
  size: number;
  color: string;
  duration: number;
  delay: number;
  top: string;
  left: string;
}) => (
  <motion.div
    className="absolute overflow-hidden rounded-full blur-[60px] opacity-70"
    style={{
      width: size,
      height: size,
      background: color,
      top,
      left,
      boxShadow: `0 0 80px ${color}`,
    }}
    animate={{
      x: [0, 100, -80, 120, -60, 0],
      y: [0, -100, 60, -120, 80, 0],
      rotate: [0, 45, 90, 135, 180, 225, 270, 360],
      scale: [1, 1.1, 0.95, 1.05, 1],
      opacity: [0.7, 1, 0.85, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      delay,
      ease: "easeInOut",
    }}
  />
);

const SellerDashboard = () => {
  const router = useRouter();

  // Fetch user profile
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

  // Currency setup
  const { currencySymbol, convertPrice, countryCurrency } = useExchangeRate(
    user?.country
  );

  // Fetch orders
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

  // Fetch gigs
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

  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenueAllGigs, setTotalRevenueAllGigs] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  // Fetch seller revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { data } = await newRequest.get("/orders/seller-revenue");
        setRevenueData(data.revenueData);
        setTotalRevenueAllGigs(data.totalRevenueAllGigs);

        const monthly = data.monthlyEarnings.map((entry) => ({
          month: entry.month,
          totalRevenue: parseFloat(entry.totalRevenue),
        }));

        setMonthlyEarnings(monthly);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };

    fetchRevenueData();
  }, []);

  // ====== ECHART CONFIGS ======
  const barOption = {
    backgroundColor: "transparent",
    title: {
      text: "Revenue Per Gig",
      left: "center",
      textStyle: { color: "#333" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#fff",
      borderColor: "#f97316",
      borderWidth: 1,
      textStyle: { color: "#333" },
      formatter: (params) =>
        `${
          params[0].name
        }: ${currencySymbol}${params[0].value.toLocaleString()}`,
    },
    grid: { left: "3%", right: "3%", bottom: "5%", containLabel: true },
    xAxis: {
      type: "category",
      data: revenueData.map((gig) => gig.title),
      axisLabel: { rotate: 25, color: "#555", fontSize: 12 },
    },
    yAxis: { type: "value", axisLabel: { color: "#555" } },
    series: [
      {
        data: revenueData.map((gig) => gig.totalRevenue),
        type: "bar",
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#f97316" },
            { offset: 1, color: "#fdba74" },
          ]),
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 6,
          shadowColor: "rgba(0,0,0,0.15)",
        },
      },
    ],
  };

  const lineOption = {
    backgroundColor: "transparent",
    title: {
      text: "Monthly Earnings Trend",
      left: "center",
      textStyle: { color: "#333" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fff",
      borderColor: "#f97316",
      borderWidth: 1,
      textStyle: { color: "#333" },
      formatter: (params) =>
        `${
          params[0].axisValue
        }: ${currencySymbol}${params[0].value.toLocaleString()}`,
    },
    xAxis: {
      type: "category",
      data: monthlyEarnings.map((m) => m.month),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#ccc" } },
      axisLabel: { color: "#666" },
    },
    yAxis: { type: "value", axisLabel: { color: "#666" } },
    series: [
      {
        data: monthlyEarnings.map((e) => e.totalRevenue),
        type: "line",
        smooth: true,
        lineStyle: { color: "#f97316", width: 4 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(249, 115, 22, 0.5)" },
            { offset: 1, color: "rgba(249, 115, 22, 0)" },
          ]),
        },
        symbol: "circle",
        symbolSize: 10,
        itemStyle: { color: "#fb923c" },
      },
    ],
  };

  const donutOption = {
    title: {
      text: "Revenue Distribution",
      subtext: `${currencySymbol}${new Intl.NumberFormat().format(
        totalRevenueAllGigs
      )}`,
      left: "center",
      top: 10,
      textStyle: { color: "#333" },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) =>
        `${params.name}: ${currencySymbol}${params.value.toLocaleString()} (${
          params.percent
        }%)`,
    },
    legend: { bottom: 0, textStyle: { color: "#555" } },
    series: [
      {
        name: "Gig Revenue",
        type: "pie",
        radius: ["45%", "70%"],
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        data: revenueData.map((gig) => ({
          name: gig.title,
          value: gig.totalRevenue,
        })),
      },
    ],
    color: ["#f97316", "#06b6d4", "#8b5cf6", "#10b981", "#ef4444", "#eab308"],
  };

  const handleEdit = () => router.push("/seller/profile-edit");
  if (userLoading || gigsLoading || ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
        {/* Blurred background version of dashboard */}
        <div className="absolute inset-0 bg-gray-100 blur-lg opacity-30 z-0"></div>

        {/* Foreground loading card */}
        <div className="relative z-10 w-full max-w-6xl bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col gap-4">
            <Skeleton height={40} width={220} />
            <Skeleton height={24} count={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
          </div>
        </div>

        <p className="text-gray-500 text-sm relative z-10">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (userError || gigsError || ordersError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full p-8 bg-red-50 border border-red-200 rounded-xl shadow-xl text-center animate-fadeIn">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-500 text-sm">
            We couldn’t load your dashboard data. Try refreshing or check back
            later.
          </p>
        </div>
      </div>
    );
  }

  const circles = [
    {
      size: 260,
      color: "rgba(255, 165, 0, 0.12)",
      duration: 10,
      delay: 0,
      top: "10%",
      left: "10%",
    },
    {
      size: 200,
      color: "rgba(255, 180, 80, 0.1)",
      duration: 11,
      delay: 1,
      top: "25%",
      left: "60%",
    },
    {
      size: 280,
      color: "rgba(255, 200, 120, 0.1)",
      duration: 9,
      delay: 1.5,
      top: "55%",
      left: "35%",
    },
    {
      size: 220,
      color: "rgba(255, 255, 255, 0.08)",
      duration: 12,
      delay: 2,
      top: "70%",
      left: "5%",
    },
    {
      size: 240,
      color: "rgba(255, 170, 70, 0.1)",
      duration: 10,
      delay: 2.5,
      top: "80%",
      left: "45%",
    },
    {
      size: 180,
      color: "rgba(255, 140, 0, 0.1)",
      duration: 9,
      delay: 3,
      top: "15%",
      left: "75%",
    },
    {
      size: 200,
      color: "rgba(255, 255, 255, 0.06)",
      duration: 13,
      delay: 3.5,
      top: "60%",
      left: "65%",
    },
    {
      size: 240,
      color: "rgba(255, 200, 100, 0.1)",
      duration: 10,
      delay: 4,
      top: "40%",
      left: "25%",
    },
  ];

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen flex flex-col gap-10 p-8 md:p-12 bg-gradient-to-br from-orange-100 via-white to-orange-50 overflow-hidden relative">
        <div className="absolute inset-0 bottom-[-150px] overflow-visible z-[2] pointer-events-none">
          {circles.map((circle, index) => (
            <FloatingCircle key={index} {...circle} />
          ))}
        </div>

        {/* === PROFILE SECTION === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative border border-orange-100 rounded-3xl shadow-lg p-8 bg-white/60 backdrop-blur-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <h2 className="text-3xl font-bold mb-6 text-orange-700 tracking-tight flex items-center gap-2">
            👋 Welcome, {user?.username || "Seller"}
          </h2>

          <div className="flex flex-wrap gap-8 items-center">
            <div className="relative w-32 h-32">
              <Image
                src={
                  user?.img ||
                  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                }
                alt="Profile"
                fill
                sizes="128px"
                className="rounded-full object-cover ring-4 ring-orange-300/60 shadow-md hover:ring-orange-400 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300/30 to-transparent blur-lg animate-pulse"></div>
            </div>

            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Bio:</strong> {user.desc || "No bio yet."}
              </p>
              <p>
                <strong>Country:</strong> {user.country}
              </p>
              <p>
                <strong>Experience:</strong> {user.yearsOfExperience || 0}
              </p>
              <p>
                <strong>Services:</strong> {user.services || "N/A"}
              </p>
              <button
                onClick={handleEdit}
                className="text-orange-600 mt-3 font-medium hover:underline hover:text-orange-700 transition"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        {/** Bar Chart Section **/}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-orange-400 pl-3">
              Revenue Per Gig
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <ReactECharts
                option={barOption}
                style={{ height: "420px", width: "100%" }}
                onChartReady={(chart) => {
                  window.addEventListener("resize", () => chart.resize());
                }}
              />
            </div>
          </div>
        </motion.div>

        {/** Line Chart Section **/}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-orange-400 pl-3">
              Monthly Earnings Trend
            </h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <ReactECharts
                option={lineOption}
                style={{ height: "420px", width: "100%" }}
                onChartReady={(chart) => {
                  window.addEventListener("resize", () => chart.resize());
                }}
              />
            </div>
          </div>
        </motion.div>

        {/** Donut Chart Section **/}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-orange-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 border-l-4 border-orange-400 pl-3">
              Revenue Distribution
            </h3>
          </div>

          <div className="overflow-x-auto w-full">
            <div className="min-w-[600px] flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="w-full md:w-3/5">
                <ReactECharts
                  option={{
                    ...donutOption,
                    legend: {
                      ...donutOption.legend,
                      show: false,
                    },
                  }}
                  style={{ height: "520px", width: "100%" }}
                  onChartReady={(chart) => {
                    window.addEventListener("resize", () => chart.resize());
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* === GIGS SECTION === */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-orange-500 pl-3">
            Your Gigs
          </h2>

          {gigs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gigs.map((gig) => (
                <motion.div
                  key={gig._id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl shadow-sm p-5 bg-gradient-to-br from-white to-orange-50 hover:from-orange-100 hover:to-white border border-orange-100 transition-all duration-300"
                >
                  <div className="relative h-56 w-full mb-3">
                    <Image
                      src={gig.cover}
                      alt={gig.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover rounded-xl shadow"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {gig.title}
                  </h3>
                  <p className="text-sm text-gray-600 break-words whitespace-pre-line truncate mt-1 line-clamp-2">
                    {gig.desc}
                  </p>
                  <p className="text-md font-semibold mt-2 text-orange-600">
                    {currencySymbol}{" "}
                    {new Intl.NumberFormat().format(convertPrice(gig.price))}
                  </p>
                  <button
                    onClick={() => router.push(`/gigdetails/${gig._id}`)}
                    className="text-green-600 hover:text-green-700 mt-2 font-medium transition"
                  >
                    View Details →
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p>No gigs available yet.</p>
          )}
        </motion.div>

        {/* === ORDERS SECTION === */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-2xl p-8 rounded-3xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-orange-500 pl-3">
            Completed Orders
          </h2>

          {orders?.sellerOrders?.length > 0 ? (
            <div className="space-y-4">
              {orders.sellerOrders.map((order) => (
                <div
                  key={order._id}
                  className="border-b border-gray-200 pb-3 hover:bg-orange-50/50 p-3 rounded-lg transition-all"
                >
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Total:</strong> {currencySymbol}
                    {new Intl.NumberFormat().format(order.price)}{" "}
                    {countryCurrency}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        order.isCompleted ? "text-green-600" : "text-yellow-500"
                      }`}
                    >
                      {order.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No completed orders yet.</p>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default SellerDashboard;

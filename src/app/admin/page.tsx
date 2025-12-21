// app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useExchangeRate } from "../hooks/useExchangeRate";
import SellerNavbar from "../seller/components/navbar";
import Footer from "../components/footer";

// Dynamically import ECharts to prevent SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Types
interface User {
  _id: string;
  username: string;
  img?: string;
}

interface Gig {
  _id: string;
  title: string;
  shortTitle: string;
  desc: string;
  cover: string;
  userId: string;
  price: number;
}

interface Order {
  _id: string;
  sellerName: string;
  buyerName: string;
  price: number;
  status: string;
}

interface RevenueData {
  sellerName: string;
  totalSellerRevenueConverted: number;
}

interface AdminRevenueResponse {
  revenueData: RevenueData[];
  totalRevenueAllSellersConverted: number;
  monthlyEarnings: Record<string, number>;
}

const usersPerGroup = 10;

export default function AdminDashboard() {
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : null;
  const { currencySymbol, convertPrice } = useExchangeRate(
    currentUser?.country
  );

  const [currentGroup, setCurrentGroup] = useState(0);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [sortedRevenueData, setSortedRevenueData] = useState<RevenueData[]>([]);

  // Fetch admin revenue
  const { data: revenueData } = useQuery<AdminRevenueResponse>({
    queryKey: ["adminRevenue"],
    queryFn: async () => {
      const res = await newRequest.get("/orders/admin-revenue");
      return res.data;
    },
  });

  // Sort revenue by descending order
  useEffect(() => {
    if (revenueData?.revenueData) {
      const sorted = [...revenueData.revenueData].sort(
        (a, b) => b.totalSellerRevenueConverted - a.totalSellerRevenueConverted
      );
      setSortedRevenueData(sorted);
    }
  }, [revenueData]);

  // Fetch all gigs
  const { data: gigs = [] } = useQuery<Gig[]>({
    queryKey: ["userGigs"],
    queryFn: async () => {
      const res = await newRequest.get("/gigs");
      return res.data;
    },
  });

  // Fetch all completed orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["allCompletedOrders"],
    queryFn: async () => {
      const res = await newRequest.get("/orders/all-completed");
      return res.data || [];
    },
  });

  // Fetch user details for gigs
  useEffect(() => {
    const fetchUsers = async () => {
      const uniqueIds = [...new Set(gigs.map((g) => g.userId))];
      const responses = await Promise.all(
        uniqueIds.map((id) => newRequest.get(`/users/${id}`))
      );
      const usersMap: Record<string, User> = {};
      responses.forEach((r) => (usersMap[r.data._id] = r.data));
      setUserDetails(usersMap);
    };
    if (gigs.length > 0) fetchUsers();
  }, [gigs]);

  // Chart gradient colors
  const gradientColor = {
    type: "linear",
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: "#FFA500" }, // light orange
      { offset: 1, color: "#FF4500" }, // deep orange
    ],
  };

  // Paginated Bar Chart Option
  const start = currentGroup * usersPerGroup;
  const end = (currentGroup + 1) * usersPerGroup;
  const groupedRevenue = sortedRevenueData.slice(start, end);

  const paginatedBarOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: groupedRevenue.map((d) => d.sellerName),
      axisLabel: { rotate: 45, fontSize: 14, color: "#FF7F50" },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 14 },
      splitLine: { lineStyle: { type: "dashed", color: "rgba(0,0,0,0.05)" } },
    },
    series: [
      {
        type: "bar",
        data: groupedRevenue.map((d) => d.totalSellerRevenueConverted),
        barWidth: "40%",
        itemStyle: {
          color: gradientColor,
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 15,
          shadowColor: "rgba(0,0,0,0.15)",
        },
        emphasis: {
          itemStyle: { color: "#FF8C00" },
        },
        animationEasing: "elasticOut",
        animationDelay(idx: number) {
          return idx * 100;
        },
      },
    ],
    grid: { left: "5%", right: "5%", bottom: "20%", containLabel: true },
  };

  // Donut chart
  const pieChartOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        name: "Revenue",
        type: "pie",
        radius: ["35%", "75%"], // slightly bigger donut
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "inside",
          formatter: "{b}\n{d}%",
          fontSize: 14,
          color: "#fff",
        },
        labelLine: { show: false },
        data: [
          {
            value: revenueData?.totalRevenueAllSellersConverted || 0,
            name: "Total Revenue",
            itemStyle: {
              color: gradientColor,
              shadowBlur: 15,
              shadowColor: "rgba(0,0,0,0.2)",
            },
          },
          {
            value: (revenueData?.totalRevenueAllSellersConverted || 0) * 0.1,
            name: "Company Income (10%)",
            itemStyle: {
              color: "#FFB347",
              shadowBlur: 15,
              shadowColor: "rgba(0,0,0,0.2)",
            },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: 200,
      },
    ],
  };

  // Line Chart
  const lineChartOption = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: revenueData ? Object.keys(revenueData.monthlyEarnings) : [],
      axisLabel: { fontSize: 14, color: "#FF7F50" },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 14 },
      splitLine: { lineStyle: { type: "dashed", color: "rgba(0,0,0,0.05)" } },
    },
    series: [
      {
        data: revenueData ? Object.values(revenueData.monthlyEarnings) : [],
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: gradientColor, width: 4 },
        itemStyle: { color: "#FF8C00", borderColor: "#FFA500", borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255,165,0,0.3)" },
              { offset: 1, color: "rgba(255,165,0,0)" },
            ],
          },
        },
        animationEasing: "cubicOut",
      },
    ],
    grid: { left: "5%", right: "5%", bottom: "10%", containLabel: true },
  };

  // Paginated gigs
  const groupedGigs = gigs.slice(start, end);

  return (
    <>
      <SellerNavbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 space-y-6 bg-gradient-to-r from-orange-100 to-white min-h-screen"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        {/* Revenue Per Seller */}
        <motion.div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="font-semibold text-lg mb-4 text-orange-700">
            Total Revenue Per Service Provider
          </h2>
          <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
            <ReactECharts
              option={paginatedBarOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentGroup((prev) => Math.max(prev - 1, 0))}
              disabled={currentGroup === 0}
              className="flex items-center gap-1 px-4 py-2 bg-orange-100 text-orange-800 rounded-full shadow-sm transition hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={18} />
              Previous
            </motion.button>

            <select
              className="px-4 py-2 appearance-none bg-white border border-gray-300 rounded-full shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              value={currentGroup}
              onChange={(e) => setCurrentGroup(Number(e.target.value))}
            >
              {Array.from({
                length: Math.ceil(sortedRevenueData.length / usersPerGroup),
              }).map((_, index) => (
                <option key={index} value={index}>
                  Page {index + 1}
                </option>
              ))}
            </select>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                setCurrentGroup((prev) =>
                  (prev + 1) * usersPerGroup < sortedRevenueData.length
                    ? prev + 1
                    : prev
                )
              }
              disabled={
                (currentGroup + 1) * usersPerGroup >= sortedRevenueData.length
              }
              className="flex items-center gap-1 px-4 py-2 bg-orange-100 text-orange-800 rounded-full shadow-sm transition hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Revenue Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            Revenue Breakdown
          </h2>
          <div className="w-72 sm:w-96 md:w-[28rem] lg:w-[32rem] h-72 sm:h-96 md:h-[28rem] lg:h-[32rem]">
            <ReactECharts
              option={pieChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <p className="mt-4 font-semibold text-orange-700">
            Total Revenue: {currencySymbol}{" "}
            {revenueData?.totalRevenueAllSellersConverted.toLocaleString()}
          </p>
          <p className="font-semibold text-orange-600">
            Company Income (10%): {currencySymbol}{" "}
            {(
              (revenueData?.totalRevenueAllSellersConverted || 0) * 0.1
            ).toLocaleString()}
          </p>
        </div>

        {/* Monthly Sales Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            Monthly Company Income
          </h2>
          <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]">
            <ReactECharts
              option={lineChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            All Completed Orders
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No completed orders.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-orange-50 border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:shadow-lg transition-shadow duration-300"
                >
                  <p>
                    <strong>Order ID:</strong> {order._id}
                  </p>
                  <p>
                    <strong>Seller:</strong> {order.sellerName}
                  </p>
                  <p>
                    <strong>Buyer:</strong> {order.buyerName}
                  </p>
                  <p className="font-semibold text-orange-700">
                    <strong>Total:</strong> {currencySymbol}{" "}
                    {order.price.toLocaleString()}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gigs Listing */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            All Gigs
          </h2>

          {groupedGigs.length === 0 ? (
            <p className="text-gray-500">No gigs available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedGigs.map((gig) => {
                const user = userDetails[gig.userId];

                return (
                  <div
                    key={gig._id}
                    className="bg-orange-50 hover:bg-orange-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-orange-800 truncate">
                      {gig.title}
                    </h3>

                    {/* Cover Image with fallback */}
                    <div className="relative w-full h-60 rounded-xl overflow-hidden">
                      <Image
                        src={gig.cover || "/default-cover.png"}
                        alt={gig.shortTitle}
                        fill
                        className="object-cover w-full h-full"
                        unoptimized
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            "/default-cover.png")
                        }
                      />
                    </div>

                    <p className="mt-2 text-gray-700 break-words whitespace-pre-line line-clamp-3">
                      {gig.desc}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={user?.img || "/default-avatar.png"}
                          alt={user?.username || "Unknown User"}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              "/default-avatar.png")
                          }
                        />
                      </div>
                      <span className="text-gray-800 truncate">
                        {user?.username || "Unknown User"}
                      </span>
                    </div>

                    <p className="font-semibold mt-2 text-orange-700">
                      Price: {currencySymbol}{" "}
                      {convertPrice(gig.price).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {gigs.length > usersPerGroup && (
            <div className="flex justify-between items-center mt-6">
              <button
                disabled={currentGroup === 0}
                onClick={() => setCurrentGroup((prev) => Math.max(prev - 1, 0))}
                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full disabled:opacity-50 transition hover:bg-orange-200 flex items-center gap-2"
              >
                <FiChevronLeft /> Previous
              </button>
              <span className="text-orange-700">
                Page {currentGroup + 1} of{" "}
                {Math.ceil(gigs.length / usersPerGroup)}
              </span>
              <button
                disabled={(currentGroup + 1) * usersPerGroup >= gigs.length}
                onClick={() => setCurrentGroup((prev) => prev + 1)}
                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full disabled:opacity-50 transition hover:bg-orange-200 flex items-center gap-2"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

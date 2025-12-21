"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";
import { RiMessage3Line } from "react-icons/ri";
import ClipLoader from "react-spinners/ClipLoader";
import Navbar from "../components/navbar";

interface Order {
  _id: string;
  title: string;
  price: number;
  img?: string;
  currency?: string;
  sellerId: string;
  buyerId: string;
  isCompleted: boolean;
}

interface User {
  _id: string;
  username: string;
  img?: string;
  country?: string;
}

interface OrdersData {
  buyerOrders?: Order[];
  sellerOrders?: Order[];
}

const Orders: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient(); // React Query client
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});

  // Access localStorage only on client
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const { currencySymbol } = useExchangeRate(currentUser?.country);

  const { isLoading, error, data } = useQuery<OrdersData>({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

  // Fetch user details for orders
  useEffect(() => {
    const fetchUserDetails = async (userId: string) => {
      if (!userId || userDetails[userId]) return;
      try {
        const res = await newRequest.get(`/users/${userId}`);
        setUserDetails((prev) => ({ ...prev, [userId]: res.data }));
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    if (data) {
      data.buyerOrders?.forEach((order) => fetchUserDetails(order.sellerId));
      data.sellerOrders?.forEach((order) => fetchUserDetails(order.buyerId));
    }
  }, [data, userDetails]);

  const handleContact = async (order: Order) => {
    if (!currentUser) return;

    const otherUserId = currentUser.seller ? order.buyerId : order.sellerId;

    if (!currentUser.id || !otherUserId) {
      console.error("Missing user ID(s)");
      return;
    }

    try {
      await newRequest.post("/conversations", {
        userId: currentUser.id,
        otherUserId,
      });
      router.push("/chat");
    } catch (err) {
      console.error("Error opening conversation:", err);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await newRequest.patch(`/orders/${orderId}`, { isCompleted: true });
      // ✅ Invalidate the query so data is refetched
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (!currentUser || isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh]">
        <ClipLoader size={60} color="#f97316" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        {t("somethingWentWrong")}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-12 flex justify-center">
        <div className="w-full max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t("orders")}
          </h1>

          {!data?.buyerOrders?.length && !data?.sellerOrders?.length ? (
            <p className="text-gray-600 text-center mt-12">
              {t("noOrdersYet")}
            </p>
          ) : (
            <div className="space-y-10">
              {(["buyerOrders", "sellerOrders"] as (keyof OrdersData)[]).map(
                (orderType) =>
                  !!data[orderType]?.length && (
                    <div key={orderType} className="overflow-x-auto">
                      <table className="w-full min-w-[600px] border-collapse border border-gray-200 rounded-xl">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-orange-300 text-left">
                              {t("image")}
                            </th>
                            <th className="p-3 text-orange-300 text-left">
                              {t("title")}
                            </th>
                            <th className="p-3 text-orange-300 text-left">
                              {t("price")}
                            </th>
                            <th className="p-3 text-orange-300 text-left">
                              {t("username")}
                            </th>
                            <th className="p-3 text-orange-300 text-left">
                              {t("status")}
                            </th>
                            {orderType === "buyerOrders" && (
                              <th className="p-3 text-orange-300 text-left">
                                {t("actions")}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {data[orderType]?.map((order) => {
                            const user =
                              userDetails[order.sellerId] ||
                              userDetails[order.buyerId];

                            return (
                              <tr
                                key={order._id}
                                className="border-t border-gray-200 hover:bg-gray-50 transition"
                              >
                                <td className="p-3">
                                  <div className="w-12 h-12 relative rounded overflow-hidden">
                                    <Image
                                      src={
                                        order.img ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={order.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 font-medium text-gray-800">
                                  {order.title}
                                </td>
                                <td className="p-3 text-gray-700">
                                  {currencySymbol} {formatPrice(order.price)}
                                </td>
                                <td className="p-3 text-orange-300">
                                  {user?.username || "N/A"}
                                </td>
                                <td className="p-3">
                                  {order.isCompleted ? (
                                    <span className="text-green-500">
                                      {t("completed")}
                                    </span>
                                  ) : (
                                    <span className="text-red-500">
                                      {t("notCompleted")}
                                    </span>
                                  )}
                                </td>
                                {orderType === "buyerOrders" && (
                                  <td className="p-3 flex gap-3">
                                    <button
                                      onClick={() => handleContact(order)}
                                      className="text-blue-500 hover:text-blue-700 transition text-lg"
                                    >
                                      <RiMessage3Line />
                                    </button>
                                    {!order.isCompleted && (
                                      <button
                                        onClick={() =>
                                          handleCompleteOrder(order._id)
                                        }
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                      >
                                        {t("markAsCompleted")}
                                      </button>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;

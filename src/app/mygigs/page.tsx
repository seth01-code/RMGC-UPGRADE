"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

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

const MyGigs: React.FC = () => {
  const { t } = useTranslation();
  const currentUser: User =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "{}")
      : ({} as User);
  const queryClient = useQueryClient();

  // Fetch user data
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["userData", currentUser?.id],
    queryFn: async () => {
      const res = await newRequest.get(`/users/me`);
      return res.data;
    },
  });

  // Fetch gigs
  const {
    data: gigs,
    isLoading,
    error,
  } = useQuery<Gig[]>({
    queryKey: ["myGigs", currentUser?.id],
    queryFn: async () => {
      const res = await newRequest.get(`/gigs?userId=${currentUser.id}`);
      return res.data;
    },
  });

  const country = userData?.country || "Nigeria";
  const { exchangeRate, currencySymbol } = useExchangeRate(country);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGigs", currentUser?.id] });
      toast.success("Gig deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(`Error deleting gig: ${err.message}`);
    },
  });

  const handleDelete = (id: string) => {
    mutation.mutate(id);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading || userLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="relative w-full max-w-5xl p-8 rounded-3xl backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl">
          <div className="space-y-6">
            {/* Simulate table header */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-200/30">
              {["Image", "Title", "Price", "Sales", "Action"].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-300/40 rounded-md animate-pulse w-3/4 mx-auto"
                ></div>
              ))}
            </div>

            {/* Simulate 6 loading rows */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 items-center gap-4 py-4 border-b border-gray-200/20"
              >
                {/* Image Placeholder */}
                <div className="w-16 h-12 bg-gray-300/40 rounded-md animate-pulse mx-auto" />

                {/* Title */}
                <div className="space-y-2">
                  <div className="h-3.5 bg-gray-300/50 rounded-md w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-300/30 rounded-md w-1/2 animate-pulse"></div>
                </div>

                {/* Price */}
                <div className="h-4 bg-gray-300/40 rounded-md w-1/2 mx-auto animate-pulse"></div>

                {/* Sales */}
                <div className="h-4 bg-gray-300/40 rounded-md w-1/3 mx-auto animate-pulse"></div>

                {/* Action (icon placeholder) */}
                <div className="w-6 h-6 bg-gray-300/40 rounded-full mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Floating shimmer light */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="animate-[shimmer_2.5s_infinite] absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );

  if (error || userError)
    return (
      <div className="flex justify-center items-center min-h-[300px] text-red-500 text-lg font-medium">
        {t("errorFetchingData")}: {String(error || userError)}
      </div>
    );

  return (
    <div className="flex justify-center px-4 md:px-8 lg:px-16 py-10 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {t("gigsTitle") || "My Gigs"}
          </h1>
          {currentUser?.isSeller && (
            <Link href="/add">
              <button className="mt-4 md:mt-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-2.5 px-6 rounded-md shadow hover:opacity-90 transition">
                {t("addNewGig") || "Add New Gig"}
              </button>
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm md:text-base">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Sales</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {gigs?.length ? (
                gigs.map((gig) => (
                  <tr
                    key={gig._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <div className="relative w-20 h-14 rounded-md overflow-hidden shadow-sm">
                        <Image
                          src={gig.cover || "/placeholder.jpg"}
                          alt={gig.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {gig.title}
                    </td>
                    <td className="p-4 font-semibold text-green-600">
                      {currencySymbol}{" "}
                      {formatPrice((gig.price * exchangeRate) as any)}
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {formatPrice(gig.sales)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(gig._id)}
                        className="text-red-500 hover:text-red-600 cursor-pointer transition transform hover:scale-110"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No gigs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyGigs;

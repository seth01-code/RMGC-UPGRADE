"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import GigCard from "../components/GigCard/GigCard";
import newRequest from "../utils/newRequest";
import down from "../../assets/images/down.png";
import Image from "next/image";

interface Gig {
  _id: string;
  title: string;
  cover: string;
  price: number;
  cat: string;
  userId: string;
  sellerUsername?: string;
}

const AllGig: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const category = searchParams.get("cat") || "";

  const [sort, setSort] = useState<"sales" | "createdAt">("sales");
  const [open, setOpen] = useState(false);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  // Auto-fetch whenever sort or search changes
  const { isLoading, error, data, refetch } = useQuery<Gig[]>({
    queryKey: ["gigs", sort, searchQuery, category],
    queryFn: async () => {
      const min = minRef.current?.value || "";
      const max = maxRef.current?.value || "";
      let query = `/gigs?sort=${sort}&min=${min}&max=${max}`;

      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (category) query += `&cat=${encodeURIComponent(category)}`;

      const res = await newRequest.get(query);
      return res.data;
    },
    keepPreviousData: true,
  });

  const reSort = (type: "sales" | "createdAt") => {
    setSort(type);
    setOpen(false);
  };

  const applyFilters = () => refetch();

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {searchQuery ? `Results for "${searchQuery}"` : "All Gigs"}
        </h1>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-lg gap-6">
          {/* Budget Filters */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <span className="font-semibold text-gray-700">Budget</span>
            <input
              type="number"
              ref={minRef}
              placeholder="Min"
              className="px-4 py-2 border placeholder:text-gray-500 text-gray-500 border-gray-300 rounded-lg w-28 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
            />
            <input
              type="number"
              ref={maxRef}
              placeholder="Max"
              className="px-4 py-2 border placeholder:text-gray-500 text-gray-500 border-gray-300 rounded-lg w-28 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
            />
            <button
              onClick={applyFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-shadow hover:shadow-lg"
            >
              Apply
            </button>
            <p className="text-xs text-gray-500 mt-1 md:mt-0">(USD only)</p>
          </div>

          {/* Sorting */}
          <div className="relative flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <span className="text-gray-600 text-sm">Sort by:</span>
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-gray-100 px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span className="font-medium text-gray-800">
                  {sort === "sales" ? "Best Selling" : "Newest"}
                </span>
                <Image
                  src={down}
                  alt="down"
                  className={`w-4 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div className="absolute right-0 top-12 w-44 bg-white shadow-lg rounded-xl py-2 z-10">
                  <span
                    onClick={() =>
                      reSort(sort === "sales" ? "createdAt" : "sales")
                    }
                    className="block px-5 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition"
                  >
                    {sort === "sales" ? "Newest" : "Best Selling"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gig Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
          {isLoading ? (
            <p className="text-gray-500 text-center col-span-full">
              Loading...
            </p>
          ) : error ? (
            <p className="text-red-500 text-center col-span-full">
              Something went wrong!
            </p>
          ) : data?.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">
              No gigs available
            </p>
          ) : (
            data?.map((gig) => <GigCard key={gig._id} item={gig} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default AllGig;

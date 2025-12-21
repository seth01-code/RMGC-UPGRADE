"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import newRequest from "../utils/newRequest";

interface GigCategory {
  _id: string;
  cat: string;
}

const CategoriesBar: React.FC = () => {
  const [categories, setCategories] = useState<GigCategory[]>([]);
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat") || "";

  // Show categories bar only on scroll
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const gigsRes = await newRequest.get("/gigs");
        const gigsData: { cat: string }[] = gigsRes.data;

        const uniqueCats = Array.from(
          new Set(gigsData.map((gig) => gig.cat))
        ).slice(0, 8);
        setCategories(
          uniqueCats.map((cat, idx) => ({ _id: idx.toString(), cat }))
        );
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  if (!show || categories.length === 0) return null;

  return (
    <div className="hidden lg:flex justify-between bg-gradient-to-r from-orange-100 to-white shadow-inner overflow-x-auto whitespace-nowrap px-4 py-2 transition-all">
      {categories.map((c) => {
        const isActive = c.cat === activeCat;
        return (
          <Link
            key={c._id}
            href={`/allgigs?cat=${encodeURIComponent(c.cat)}`}
            className={`relative mr-6 last:mr-0 text-gray-700 hover:text-orange-500 font-medium transition-colors pb-1`}
          >
            {c.cat}
            {/* Half-width bottom border for active category */}
            {isActive && (
              <span className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-orange-500 rounded-full"></span>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default CategoriesBar;

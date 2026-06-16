// CategoriesBar.tsx
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

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await newRequest.get("/gigs");
        const unique = Array.from(
          new Set((res.data as { cat: string }[]).map((g) => g.cat)),
        ).slice(0, 8);
        setCategories(unique.map((cat, idx) => ({ _id: idx.toString(), cat })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  if (!show || categories.length === 0) return null;

  return (
    <div className="hidden lg:flex items-center justify-center bg-white border-t border-[#f0f0f0] overflow-x-auto scrollbar-none px-5 gap-1">
      {categories.map((c, i) => {
        const isActive = c.cat === activeCat;
        return (
          <React.Fragment key={c._id}>
            {i > 0 && (
              <span className="w-px h-3.5 bg-[#ebebeb] flex-shrink-0" />
            )}
            <Link
              href={`/allgigs?cat=${encodeURIComponent(c.cat)}`}
              className={`relative px-3.5 py-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? "text-orange-500 border-orange-500"
                  : "text-[#888] border-transparent hover:text-[#111]"
              }`}
            >
              {c.cat}
            </Link>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CategoriesBar;

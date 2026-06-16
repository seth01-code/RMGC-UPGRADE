"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import newRequest from "../../utils/newRequest";
import { motion } from "framer-motion";
// @ts-ignore
import "swiper/css";

interface Gig {
  _id: string;
  cover: string;
  cat: string;
  userId: string;
  sellerUsername?: string;
  sellerImg?: string;
}

const Slide: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellersRes = await newRequest.get("/users/sellers");
        const sellersData = sellersRes.data;

        const gigsRes = await newRequest.get("/gigs");
        const gigsData: Gig[] = gigsRes.data;

        const mergedData = gigsData.map((gig) => {
          const seller = sellersData.find((s: any) => s._id === gig.userId);
          return {
            ...gig,
            sellerUsername: seller?.username || "Unknown",
            sellerImg: seller?.img || "",
          };
        });

        const uniqueCategories = new Set();
        const filteredGigs = mergedData.filter((gig) => {
          if (uniqueCategories.has(gig.cat)) return false;
          uniqueCategories.add(gig.cat);
          return true;
        });

        setGigs(filteredGigs);
      } catch (err) {
        console.error("Error fetching gigs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = (gig: Gig) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (currentUser?.isSeller || currentUser?.isAdmin) {
      router.push(`/gigdetails/${gig._id}`);
    } else {
      router.push(`/gig/${gig._id}`);
    }
  };

  // Skeleton — swap dark colors for light
  const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#f0f0f0] animate-pulse">
      <div className="w-full h-[200px] bg-[#f7f7f7]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#efefef] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 bg-[#efefef] rounded-full w-3/4" />
            <div className="h-2 bg-[#f5f5f5] rounded-full w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative bg-white py-16 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Live on platform
              </span>
            </div>
            <h2 className="text-[24px] md:text-[30px] font-extrabold text-[#111] leading-tight">
              Featured gigs
            </h2>
            <p className="text-[13px] text-[#444] mt-1.5">
              Handpicked services from verified Freelancers
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/allgigs")}
            className="hidden md:flex items-center gap-2 text-[12px] font-semibold text-[#aaa] hover:text-[#111] border border-[#ebebeb] hover:border-[#ccc] px-5 py-2.5 rounded-xl transition-all"
          >
            View all gigs
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : gigs.length > 0 ? (
          <Swiper
            spaceBetween={14}
            slidesPerGroup={1}
            modules={[Autoplay]}
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            loop={false}
            breakpoints={{
              1400: { slidesPerView: 4, spaceBetween: 16 },
              1200: { slidesPerView: 3, spaceBetween: 14 },
              1024: { slidesPerView: 3, spaceBetween: 14 },
              768: { slidesPerView: 2, spaceBetween: 12 },
              576: { slidesPerView: 1.5, spaceBetween: 12 },
              420: { slidesPerView: 1.2, spaceBetween: 10 },
              320: { slidesPerView: 1, spaceBetween: 8 },
            }}
          >
            {gigs.map((gig, index) => (
              <SwiperSlide key={gig._id}>
                <motion.div
                  onClick={() => handleClick(gig)}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#f0f0f0] hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  {/* Image */}
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <Image
                      src={gig.cover}
                      alt={gig.cat}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold tracking-wider text-orange-400 bg-black/60 backdrop-blur-sm border border-orange-500/20 px-2.5 py-1 rounded-lg uppercase">
                        {gig.cat}
                      </span>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 10L10 2M10 2H4M10 2V8"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-3 p-4 border-t border-[#f0f0f0]">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={
                          gig.sellerImg ||
                          "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                        }
                        alt={gig.sellerUsername || "Seller"}
                        fill
                        className="rounded-full object-cover border border-[#2a2a2a]"
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-[12.5px] font-semibold text-[#333] truncate group-hover:text-[#111] transition-colors">
                        {gig.sellerUsername}
                      </span>
                      <span className="text-[11px] text-[#bbb] truncate">
                        Verified Freelancer
                      </span>
                    </div>

                    {/* Right dot indicator */}
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-300 group-hover:bg-orange-500 transition-colors flex-shrink-0" />
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-[#f0f0f0] rounded-2xl">
            <p className="text-[#bbb] text-[13px]">No gigs available yet.</p>
          </div>
        )}

        {/* Mobile view-all */}
        <div className="mt-8 flex md:hidden justify-center">
          <button
            onClick={() => router.push("/allgigs")}
            className="text-[12px] font-semibold text-[#aaa] hover:text-[#111] border border-[#ebebeb] hover:border-[#ccc] px-6 py-2.5 rounded-xl transition-all"
          >
            View all gigs →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Slide;

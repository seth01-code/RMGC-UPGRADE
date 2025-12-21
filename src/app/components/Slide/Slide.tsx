"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import newRequest from "../../utils/newRequest"; // Axios instance
import { motion } from "framer-motion";

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
      className="absolute rounded-full blur-[60px] opacity-70"
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

  const circles = [
    {
      size: 260,
      color: "rgba(255,140,0,0.45)",
      duration: 10,
      delay: 0,
      top: "10%",
      left: "15%",
    },
    {
      size: 200,
      color: "rgba(0,200,255,0.35)",
      duration: 11,
      delay: 1,
      top: "25%",
      left: "70%",
    },
    {
      size: 280,
      color: "rgba(255,100,200,0.35)",
      duration: 9,
      delay: 1.5,
      top: "55%",
      left: "40%",
    },
    {
      size: 220,
      color: "rgba(255,255,255,0.25)",
      duration: 12,
      delay: 2,
      top: "70%",
      left: "10%",
    },
  ];

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

        // Filter duplicate categories
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

  // Glassy loading shimmer placeholders
  const LoadingSkeleton = () => (
    <div className="cursor-pointer rounded-2xl overflow-hidden shadow-md backdrop-blur-md bg-white/10 border border-white/20 animate-pulse">
      <div className="w-full h-[200px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-t-2xl animate-shimmer" />
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
        <div className="flex flex-col flex-1 space-y-2">
          <div className="w-3/4 h-3 bg-white/20 rounded-md" />
          <div className="w-1/2 h-3 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative bg-gradient-to-b from-white to-orange-50 py-14 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="absolute inset-0 bottom-[-150px] overflow-visible z-[2] pointer-events-none">
        {circles.map((circle, index) => (
          <FloatingCircle key={index} {...circle} />
        ))}
      </div>
      {loading ? (
        // Loading shimmer layout
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : gigs.length > 0 ? (
        <Swiper
          spaceBetween={15}
          slidesPerGroup={1}
          modules={[Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          loop={false}
          breakpoints={{
            1400: { slidesPerView: 4, spaceBetween: 40 },
            1200: { slidesPerView: 3, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 25 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            576: { slidesPerView: 1.5, spaceBetween: 15 },
            420: { slidesPerView: 1.2, spaceBetween: 10 },
            320: { slidesPerView: 1, spaceBetween: 8 },
          }}
        >
          {gigs.map((gig) => (
            <SwiperSlide key={gig._id}>
              <div
                onClick={() => {
                  const currentUser = JSON.parse(
                    localStorage.getItem("currentUser") || "{}"
                  );
                  if (currentUser?.isSeller || currentUser?.isAdmin) {
                    router.push(`/gigdetails/${gig._id}`);
                  } else {
                    router.push(`/gig/${gig._id}`);
                  }
                }}
                className="cursor-pointer rounded-2xl overflow-hidden backdrop-blur-md bg-white/20 
  border border-white/30 shadow-md hover:shadow-xl transform transition-all duration-300 
  hover:scale-[1.03] hover:bg-white/30"
              >
                {/* Gig Image */}
                <div className="relative w-full h-[220px]">
                  <Image
                    src={gig.cover}
                    alt={t("slide.projectImageAlt")}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Gig Info */}
                <div className="flex items-center gap-3 p-4">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={
                        gig.sellerImg ||
                        "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                      }
                      alt={t("slide.profileImageAlt")}
                      fill
                      className="rounded-full object-cover border border-white/40 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <h2 className="text-sm text-gray-900 font-semibold truncate">
                      {t("slide.category", { category: gig.cat })}
                    </h2>
                    <span className="text-xs text-gray-600 truncate">
                      {gig.sellerUsername}
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center text-gray-600 font-medium text-lg py-10">
          No gigs available yet.
        </p>
      )}
    </div>
  );
};

export default Slide;

"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { cards } from "../../../data";
// Slider.tsx — add missing Swiper CSS import at the top
// @ts-ignore
import "swiper/css";

interface Card {
  id: number | string;
  img: string;
  title: string;
  desc: string;
}

const Slider: React.FC = () => {
  return (
    <div className="bg-white py-10 px-4 sm:px-6 md:px-12 lg:px-20">
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-orange-500 uppercase mb-1">
            Explore
          </p>
          <h2 className="text-[20px] font-bold text-[#111]">
            Browse by category
          </h2>
        </div>
      </div>

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
        {cards.map((card: Card) => (
          <SwiperSlide key={card.id}>
            <div className="relative w-full h-[260px] sm:h-[240px] rounded-2xl overflow-hidden cursor-pointer group">
              {/* Image */}
              <Image
                src={card.img}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Orange accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content — pinned to bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[11px] font-semibold tracking-widest text-orange-400 uppercase mb-1">
                  {card.desc}
                </p>
                <h3 className="text-white text-[15px] font-bold leading-snug">
                  {card.title}
                </h3>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;

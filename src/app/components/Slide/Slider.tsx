"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { cards } from "../../../data";

interface Card {
  id: number | string;
  img: string;
  title: string;
  desc: string;
}

const Slider: React.FC = () => {
  return (
    <div className="bg-gray-100 py-10 px-4 sm:px-6 md:px-12 lg:px-20">
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
        {cards.map((card: Card) => (
          <SwiperSlide key={card.id}>
            <div className="relative max-w-[320px] sm:max-w-[280px] xs:max-w-[240px] w-full h-auto rounded-lg overflow-hidden shadow-lg group cursor-pointer">
              <div className="relative w-full h-[300px] sm:h-[260px] xs:h-[220px]">
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Description Text */}
              <div className="absolute top-4 left-4 max-w-[80%] text-white drop-shadow-md font-medium font-serif text-sm sm:text-base">
                {card.desc.split(" & ").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>

              {/* Title Text */}
              <div className="absolute top-16 left-4 max-w-[80%] text-white drop-shadow-md font-semibold text-lg sm:text-xl">
                {card.title.split(" & ").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;

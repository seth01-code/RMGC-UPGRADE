"use client";

import React, { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../seller/components/SellerReviews";
import { IoMdStar } from "react-icons/io";
import { MdMessage } from "react-icons/md";
import { FaCheckDouble } from "react-icons/fa6";
import Link from "next/link";
import moment from "moment";
import Recycle from "../../../assets/images/recycle.png";
import Clock from "../../../assets/images/clock.png";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import Image from "next/image";
import SellerNavbar from "@/app/seller/components/navbar";
import Footer from "@/app/components/footer";
import Skeleton from "react-loading-skeleton";
// import Navbar from "@/app/components/navbar";

interface GigData {
  _id: string;
  title: string;
  shortTitle: string;
  shortDesc: string;
  desc: string;
  price: number;
  cat: string;
  userId: string;
  totalStars: number;
  starNumber: number;
  deliveryTime: number;
  revisionNumber: number;
  features: string[];
  images?: string[];
  videos?: string[];
  documents?: string[];
}

interface UserData {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
  languages?: string[];
  yearsOfExperience?: number;
  createdAt: string;
}

const GigDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const gigId = params.id as string;
  const currentUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("currentUser") || "null")
      : null;

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery<GigData>({
    queryKey: ["gig", gigId],
    queryFn: () =>
      newRequest.get(`/gigs/single/${gigId}`).then((res) => res.data),
    enabled: !!gigId,
  });

  const {
    data: dataUser,
    isLoading: isLoadingUser,
    error: errorUser,
  } = useQuery<UserData>({
    queryKey: ["user", data?.userId],
    queryFn: () =>
      data?.userId
        ? newRequest.get(`/users/${data.userId}`).then((res) => res.data)
        : Promise.resolve(undefined),
    enabled: !!data?.userId,
  });

  const { data: userData } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: () => newRequest.get("/users/me").then((res) => res.data),
  });

  const { exchangeRate, currencySymbol } = useExchangeRate(
    userData?.country || "United States"
  );

  const memberSince = dataUser
    ? moment(dataUser.createdAt).format("DD MMMM, YYYY")
    : "";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
        {/* Blurred background version of dashboard */}
        <div className="absolute inset-0 bg-gray-100 blur-lg opacity-30 z-0"></div>

        {/* Foreground loading card */}
        <div className="relative z-10 w-full max-w-6xl bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col gap-4">
            <Skeleton height={40} width={220} />
            <Skeleton height={24} count={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
            <Skeleton height={140} className="rounded-xl animate-pulse-fast" />
          </div>
        </div>

        <p className="text-gray-500 text-sm relative z-10">Loading ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="max-w-md w-full p-8 bg-red-50 border border-red-200 rounded-xl shadow-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Failed to load gig
          </h2>
          <p className="text-red-500 text-sm">
            Something went wrong while fetching this gig. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SellerNavbar />
      <div className="max-w-7xl mx-auto bg-gray-100 px-4 md:px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="text-sm text-gray-500">
            <Link href="/" className="text-orange-600 hover:underline">
              RMGC
            </Link>{" "}
            &rarr; {data.cat} Category
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>

          {isLoadingUser ? (
            <p>Loading seller...</p>
          ) : errorUser ? (
            <p className="text-red-500">Error loading seller info</p>
          ) : (
            <div className="flex items-center gap-3">
              <Image
                src={
                  dataUser?.img ||
                  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                }
                alt="Seller"
                className="rounded-full object-cover"
                width={48} // 12 * 4px = 48px
                height={48}
              />

              <span className="font-medium">{dataUser?.username}</span>
              {!isNaN(data.totalStars / data.starNumber) && (
                <div className="flex items-center gap-1">
                  {Array(Math.round(data.totalStars / data.starNumber))
                    .fill(0)
                    .map((_, i) => (
                      <IoMdStar key={i} className="text-yellow-500" />
                    ))}
                  <span className="ml-1 text-sm">
                    {Math.round(data.totalStars / data.starNumber)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Gig Media */}
          {data.images?.length ||
          data.videos?.length ||
          data.documents?.length ? (
            <div className="relative">
              <div
                ref={prevRef}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                ◀
              </div>
              <div
                ref={nextRef}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                ▶
              </div>
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                modules={[Navigation]}
                className="rounded-lg overflow-hidden bg-gray-50"
              >
                {[
                  ...(data.images || []),
                  ...(data.videos || []),
                  ...(data.documents || []),
                ].map((fileUrl, i) => {
                  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(fileUrl);
                  const isVideo = /\.(mp4|webm|ogg)$/i.test(fileUrl);
                  const isPDF = /\.pdf$/i.test(fileUrl);

                  return (
                    <SwiperSlide
                      key={i}
                      className="flex justify-center items-center bg-gray-50"
                    >
                      {isImage ? (
                        <div className="relative w-full h-[500px]">
                          <Image
                            src={fileUrl}
                            alt={`media ${i}`}
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized // optional: use if your src is external and not in next.config.js
                          />
                        </div>
                      ) : isVideo ? (
                        <video
                          src={fileUrl}
                          controls
                          className="max-h-[500px] w-full object-contain"
                        />
                      ) : isPDF ? (
                        <iframe src={fileUrl} className="w-full h-[500px]" />
                      ) : (
                        <p className="text-gray-500">Unsupported format</p>
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            <p className="text-gray-500">No media available</p>
          )}

          <h2 className="text-xl font-semibold mt-6">About this Gig</h2>
          <p className="text-gray-600 break-words whitespace-pre-line">
            {data.desc}
          </p>

          {/* About Seller */}
          {dataUser && (
            <div className="mt-6 p-4 border rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={dataUser?.img || ""}
                  alt="Seller"
                  className="rounded-full object-cover"
                  width={64} // 16 * 4px = 64px
                  height={64}
                />
                <div>
                  <p className="font-medium">{dataUser.username}</p>
                  <p className="text-sm text-gray-600">
                    {dataUser.desc || "No bio provided"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <p>
                  <strong>From:</strong> {dataUser.country || "Unknown"}
                </p>
                <p>
                  <strong>Member Since:</strong> {memberSince}
                </p>
                <p>
                  <strong>Languages:</strong>{" "}
                  {dataUser.languages?.join(", ") || "Not provided"}
                </p>
                <p>
                  <strong>Years Experience:</strong>{" "}
                  {dataUser.yearsOfExperience || "Not provided"}
                </p>
              </div>
            </div>
          )}

          <Reviews gigId={gigId} />
        </div>

        {/* RIGHT SECTION */}
        <div
          className="
    w-full 
    min-w-[280px]
    bg-white 
    p-6 
    rounded-xl 
    shadow-lg 
    space-y-4 
    lg:sticky 
    lg:top-36 
    transition-all 
    duration-300 
    hover:shadow-xl 
    mt-6 
    lg:mt-0 
    h-auto 
    self-start
  "
        >
          {/* Title & Price */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-900">
              {data.shortTitle}
            </h3>
            <h3 className="font-bold text-lg text-gray-900">
              {currencySymbol}{" "}
              {new Intl.NumberFormat().format(data.price * exchangeRate)}
            </h3>
          </div>

          {/* Short Description */}
          <p className="text-gray-600 text-sm break-words whitespace-pre-line leading-relaxed">
            {data.shortDesc}
          </p>

          {/* Delivery & Revisions */}
          <div className="flex justify-between text-gray-700 text-sm mt-2">
            <div className="flex items-center gap-1">
              <Image src={Clock} alt="Delivery Time" width={20} height={20} />
              <span>{data.deliveryTime} days</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src={Recycle} alt="Revisions" width={20} height={20} />
              <span>{data.revisionNumber} revisions</span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-3 flex flex-col gap-2">
            {data.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-700 text-sm hover:text-orange-600 transition"
              >
                <FaCheckDouble className="text-orange-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GigDetails;

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";
import { RiMessage3Line } from "react-icons/ri";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { MdOutlineShoppingBag, MdOutlineWorkOutline } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";
import ClipLoader from "react-spinners/ClipLoader";
import { motion, AnimatePresence } from "framer-motion";

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

// ── Placeholder types for future job posts feature ──
interface JobPost {
  _id: string;
  title: string;
  description: string;
  budget?: number;
  applicantsCount: number;
  createdAt: string;
  status: "open" | "closed";
}

const Orders: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const { currencySymbol } = useExchangeRate(currentUser?.country);

  const { isLoading, error, data } = useQuery<OrdersData>({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

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
      data.buyerOrders?.forEach((o) => fetchUserDetails(o.sellerId));
      data.sellerOrders?.forEach((o) => fetchUserDetails(o.buyerId));
    }
  }, [data, userDetails]);

  const handleContact = async (order: Order) => {
    if (!currentUser) return;
    const otherUserId = currentUser.seller ? order.buyerId : order.sellerId;
    if (!currentUser.id || !otherUserId) return;
    try {
      await newRequest.post("/conversations", { userId: currentUser.id, otherUserId });
      router.push("/chat");
    } catch (err) {
      console.error("Error opening conversation:", err);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    setCompleting(orderId);
    try {
      await newRequest.patch(`/orders/${orderId}`, { isCompleted: true });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      console.error("Error updating order status:", err);
    } finally {
      setCompleting(null);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!currentUser || isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh] bg-white">
        <ClipLoader size={36} color="#f97316" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-white">
        <p className="text-[13px] text-red-400">{t("somethingWentWrong")}</p>
      </div>
    );
  }

  const isSeller = currentUser?.isSeller;
  const isClient = !isSeller && !currentUser?.isAdmin;

  // ── Seller view ──
  if (isSeller) {
    const orders = data?.sellerOrders || [];

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Seller dashboard
              </span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
              My sales
            </h1>
            <p className="text-[13px] text-[#aaa] mt-1.5">
              Orders placed by clients for your gigs
            </p>
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={<MdOutlineShoppingBag className="text-[36px] text-[#e5e5e5]" />}
              title="No sales yet"
              sub="Orders from clients will appear here once they purchase your gigs."
            />
          ) : (
            <>
              <div className="space-y-3">
                {orders.map((order, index) => {
                  const user = userDetails[order.buyerId];
                  return (
                    <OrderCard
                      key={order._id}
                      order={order}
                      user={user}
                      index={index}
                      currencySymbol={currencySymbol}
                      formatPrice={formatPrice}
                      isSeller
                    />
                  );
                })}
              </div>
              <SummaryFooter
                count={orders.length}
                total={orders.reduce((s, o) => s + o.price, 0)}
                currencySymbol={currencySymbol}
                formatPrice={formatPrice}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Client view ──
  if (isClient) {
    const purchases = data?.buyerOrders || [];

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-orange-500" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
                Client dashboard
              </span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
              My workspace
            </h1>
            <p className="text-[13px] text-[#aaa] mt-1.5">
              Your purchases and job posts in one place
            </p>
          </div>

          {/* ── Two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

            {/* Left — Purchased gigs */}
            <div>
              <SectionHeader
                eyebrow="Purchased gigs"
                title="My orders"
                count={purchases.length}
              />

              {purchases.length === 0 ? (
                <EmptyState
                  icon={<MdOutlineShoppingBag className="text-[36px] text-[#e5e5e5]" />}
                  title="No purchases yet"
                  sub="Gigs you buy from freelancers will appear here."
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {purchases.map((order, index) => {
                      const user = userDetails[order.sellerId];
                      return (
                        <OrderCard
                          key={order._id}
                          order={order}
                          user={user}
                          index={index}
                          currencySymbol={currencySymbol}
                          formatPrice={formatPrice}
                          isSeller={false}
                          onContact={() => handleContact(order)}
                          onComplete={() => handleCompleteOrder(order._id)}
                          completing={completing === order._id}
                          t={t}
                        />
                      );
                    })}
                  </div>
                  <SummaryFooter
                    count={purchases.length}
                    total={purchases.reduce((s, o) => s + o.price, 0)}
                    currencySymbol={currencySymbol}
                    formatPrice={formatPrice}
                  />
                </>
              )}
            </div>

            {/* Right — Job posts (coming soon panel) */}
            <div className="lg:sticky lg:top-24">
              <SectionHeader
                eyebrow="Job board"
                title="My job posts"
                count={0}
              />

              {/* Coming soon card */}
              <div className="relative overflow-hidden border border-dashed border-[#e5e5e5] rounded-2xl p-8 flex flex-col items-center text-center gap-4">
                {/* Subtle orange glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] to-transparent pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <BsPeopleFill className="text-orange-500 text-[20px]" />
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#111] mb-1">
                    Job posts coming soon
                  </p>
                  <p className="text-[12.5px] text-[#aaa] leading-relaxed max-w-[260px]">
                    Post a job, set your budget, and let freelancers pitch directly — with their CV or portfolio attached.
                  </p>
                </div>

                <div className="w-full space-y-2 mt-2">
                  {[
                    "Post a job or gig request",
                    "Freelancers apply with pitches",
                    "Review CVs & portfolios",
                    "Accept the best fit",
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#fafafa] border border-[#f0f0f0]"
                    >
                      <span className="w-5 h-5 rounded-lg bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-[9px] font-bold text-orange-500 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-[#888] text-left">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[11px] text-orange-500 font-semibold tracking-wide">
                    In development
                  </span>
                </div>
              </div>

              {/* Applicants preview placeholder */}
              <div className="mt-4 border border-[#f0f0f0] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[12px] font-bold text-[#111]">Recent applicants</p>
                  <span className="text-[10px] text-[#ccc] bg-[#f5f5f5] px-2 py-1 rounded-md font-semibold">
                    Preview
                  </span>
                </div>
                {[
                  { initials: "AO", name: "Adebayo Oluwaseun", role: "UI/UX Designer" },
                  { initials: "CF", name: "Chisom Felix", role: "Full-stack Developer" },
                  { initials: "EM", name: "Emmanuel Musa", role: "Content Writer" },
                ].map((applicant, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f5] last:border-0 opacity-40"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-500 flex-shrink-0">
                      {applicant.initials}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">{applicant.name}</p>
                      <p className="text-[11px] text-[#bbb]">{applicant.role}</p>
                    </div>
                    <div className="ml-auto w-14 h-2 bg-[#f0f0f0] rounded-full" />
                  </div>
                ))}
                <p className="text-[11px] text-center text-[#ccc] mt-3">
                  Applicant pitches will appear here per job post
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ── Shared sub-components ──

const SectionHeader = ({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count: number;
}) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <p className="text-[10px] font-bold tracking-[0.16em] text-orange-500 uppercase mb-1">
        {eyebrow}
      </p>
      <h2 className="text-[17px] font-extrabold text-[#111]">{title}</h2>
    </div>
    {count > 0 && (
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-500">
        {count}
      </span>
    )}
  </div>
);

const OrderCard = ({
  order,
  user,
  index,
  currencySymbol,
  formatPrice,
  isSeller,
  onContact,
  onComplete,
  completing,
  t,
}: {
  order: Order;
  user?: User;
  index: number;
  currencySymbol: string;
  formatPrice: (n: number) => string;
  isSeller: boolean;
  onContact?: () => void;
  onComplete?: () => void;
  completing?: boolean;
  t?: (key: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="group flex items-center gap-4 p-4 bg-white border border-[#f0f0f0] hover:border-orange-200 rounded-2xl transition-all duration-200 hover:-translate-y-[1px]"
  >
    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#f0f0f0]">
      <Image
        src={order.img || "https://via.placeholder.com/48"}
        alt={order.title}
        fill
        className="object-cover"
      />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-[#111] truncate">{order.title}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] text-[#bbb]">
          {isSeller ? "From" : "By"}
        </span>
        <span className="text-[11px] text-[#888] font-medium truncate">
          {user?.username || "N/A"}
        </span>
      </div>
    </div>

    <div className="hidden sm:flex flex-col items-end flex-shrink-0">
      <span className="text-[13.5px] font-bold text-[#111]">
        {currencySymbol}{formatPrice(order.price)}
      </span>
    </div>

    <div className="flex-shrink-0">
      {order.isCompleted ? (
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
          <HiOutlineCheckCircle className="text-[13px]" />
          Completed
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-[#fff8f5] border border-orange-100 text-orange-400 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
          <HiOutlineXCircle className="text-[13px]" />
          Pending
        </div>
      )}
    </div>

    {!isSeller && (
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onContact}
          className="w-8 h-8 rounded-xl border border-[#f0f0f0] hover:border-orange-200 flex items-center justify-center text-[#bbb] hover:text-orange-500 transition-all"
          title="Message seller"
        >
          <RiMessage3Line className="text-[14px]" />
        </button>
        {!order.isCompleted && (
          <button
            onClick={onComplete}
            disabled={completing}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#111] hover:bg-orange-500 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {completing ? (
              <ClipLoader size={9} color="#fff" />
            ) : (
              <>
                <HiOutlineCheckCircle className="text-[13px]" />
                Mark done
              </>
            )}
          </button>
        )}
      </div>
    )}
  </motion.div>
);

const SummaryFooter = ({
  count,
  total,
  currencySymbol,
  formatPrice,
}: {
  count: number;
  total: number;
  currencySymbol: string;
  formatPrice: (n: number) => string;
}) => (
  <div className="mt-4 flex items-center justify-between px-4 py-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl">
    <span className="text-[12px] text-[#aaa]">
      {count} order{count !== 1 ? "s" : ""}
    </span>
    <span className="text-[12px] font-bold text-[#111]">
      Total:{" "}
      <span className="text-orange-500">
        {currencySymbol}{formatPrice(total)}
      </span>
    </span>
  </div>
);

const EmptyState = ({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 border border-[#f0f0f0] rounded-2xl">
    <div className="mb-3">{icon}</div>
    <p className="text-[13.5px] font-semibold text-[#ccc]">{title}</p>
    <p className="text-[12px] text-[#ddd] mt-1 text-center max-w-[240px]">{sub}</p>
  </div>
);

export default Orders;
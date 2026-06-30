/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useTranslation } from "react-i18next";
import { RiMessage3Line } from "react-icons/ri";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { MdOutlineShoppingBag, MdOutlineWorkOutline } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";
import ClipLoader from "react-spinners/ClipLoader";
import { motion } from "framer-motion";
import { toast } from "sonner";

/* ─── Types ─── */

interface Order {
  _id: string;
  title: string;
  price: number;
  img?: string;
  currency?: string;
  sellerId: string;
  buyerId: string;
  isCompleted: boolean;
  // Job-post order: price is stored in USD and needs conversion to the
  // viewer's local currency before display.
  workId?: string;
  // Gig order: price is already stored in the seller's local currency
  // at the time of purchase, so it should be displayed as-is.
  gigId?: string;
}

interface User {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  desc?: string;
}

interface OrdersData {
  buyerOrders?: Order[];
  sellerOrders?: Order[];
}

/* ══════════════════════════════════════════════
   MAIN ORDERS COMPONENT
══════════════════════════════════════════════ */

const Orders: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<Record<string, User>>({});
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const { currencySymbol, convertPrice } = useExchangeRate(
    currentUser?.country,
  );

  const isSeller = currentUser?.isSeller;
  const isClient = !isSeller && !currentUser?.isAdmin;

  const { isLoading, error, data } = useQuery<OrdersData>({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

  useEffect(() => {
    const fetchUser = async (userId: string) => {
      if (!userId || userDetails[userId]) return;
      try {
        const res = await newRequest.get(`/users/${userId}`);
        setUserDetails((prev) => ({ ...prev, [userId]: res.data }));
      } catch {}
    };
    if (data) {
      data.buyerOrders?.forEach((o) => fetchUser(o.sellerId));
      data.sellerOrders?.forEach((o) => fetchUser(o.buyerId));
    }
  }, [data, userDetails]);

const handleContact = async (otherUserId: string) => {
  if (!currentUser) return;
  const myId = currentUser.id || currentUser._id;
  if (!myId || !otherUserId) return;
  try {
    await newRequest.post("/conversations", { userId: myId, otherUserId });
    router.push("/chat");
  } catch (err: any) {
    const status = err?.response?.status;
    const message = err?.response?.data?.error || "";

    if (status === 404 && message.toLowerCase().includes("not found")) {
      toast.error("User Unavailable", {
        description:
          "This user has been suspended and can no longer be contacted.",
        duration: 6000,
        style: {
          background: "#fff7f0",
          border: "1px solid #fed7aa",
          color: "#111",
        },
      });
    } else if (status === 403) {
      toast.error("Account Suspended", {
        description:
          "Your account has been suspended. You cannot send messages.",
        duration: 6000,
        style: {
          background: "#fff7f0",
          border: "1px solid #fed7aa",
          color: "#111",
        },
      });
    } else {
      toast.error("Something went wrong", {
        description: "Could not open this conversation. Please try again.",
        duration: 5000,
      });
    }
  }
};

  const handleCompleteOrder = async (orderId: string) => {
    setCompleting(orderId);
    try {
      await newRequest.patch(`/orders/${orderId}`, { isCompleted: true });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(null);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Job-post orders (workId) store price in USD -> convert to local currency.
const getDisplayPrice = (order: Order) => convertPrice(order.price);

  if (!currentUser || isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh]">
        <ClipLoader size={32} color="#f97316" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[13px] text-red-400">{t("somethingWentWrong")}</p>
      </div>
    );
  }

  /* ── Seller view ── */
  if (isSeller) {
    const orders = data?.sellerOrders ?? [];
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
          <PageHeader
            eyebrow="Seller dashboard"
            title="My sales"
            sub="Orders placed by clients for your gigs"
          />
          {orders.length === 0 ? (
            <EmptyState
              icon={
                <MdOutlineShoppingBag className="text-[34px] text-[#ddd]" />
              }
              title="No sales yet"
              sub="Orders from clients will appear here once they purchase your gigs."
            />
          ) : (
            <>
              <div className="space-y-3">
                {orders.map((order, i) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    user={userDetails[order.buyerId]}
                    index={i}
                    currencySymbol={currencySymbol}
                    formatPrice={formatPrice}
                    displayPrice={getDisplayPrice(order)}
                    isSeller
                  />
                ))}
              </div>
              <SummaryFooter
                count={orders.length}
                total={orders.reduce((s, o) => s + getDisplayPrice(o), 0)}
                currencySymbol={currencySymbol}
                formatPrice={formatPrice}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Client view ── */
  if (isClient) {
    const purchases = data?.buyerOrders ?? [];

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
          <PageHeader
            eyebrow="Client dashboard"
            title="My orders"
            sub="Gigs you've purchased from freelancers"
          />

          {/* Job posts shortcut banner */}
          <Link
            href="/jobs"
            className="flex items-center gap-4 mb-8 p-4 border border-[#f0f0f0] hover:border-orange-100 bg-white rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <BsPeopleFill className="text-orange-500 text-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#111]">
                My job posts
              </p>
              <p className="text-[12px] text-[#bbb] mt-0.5">
                View your listings and manage proposals from freelancers
              </p>
            </div>
            <HiOutlineExternalLink className="text-[18px] text-[#ccc] group-hover:text-orange-400 transition-colors shrink-0" />
          </Link>

          {/* Purchases */}
          {purchases.length === 0 ? (
            <EmptyState
              icon={
                <MdOutlineShoppingBag className="text-[34px] text-[#ddd]" />
              }
              title="No purchases yet"
              sub="Gigs you buy from freelancers will appear here."
            />
          ) : (
            <>
              <div className="space-y-3">
                {purchases.map((order, i) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    user={userDetails[order.sellerId]}
                    index={i}
                    currencySymbol={currencySymbol}
                    formatPrice={formatPrice}
                    displayPrice={getDisplayPrice(order)}
                    isSeller={false}
                    onContact={() => handleContact(order.sellerId)}
                    onComplete={() => handleCompleteOrder(order._id)}
                    completing={completing === order._id}
                    t={t}
                  />
                ))}
              </div>
              <SummaryFooter
                count={purchases.length}
                total={purchases.reduce((s, o) => s + getDisplayPrice(o), 0)}
                currencySymbol={currencySymbol}
                formatPrice={formatPrice}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

/* ── Shared sub-components ── */

const PageHeader = ({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) => (
  <div className="mb-10">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px w-6 bg-orange-500" />
      <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
        {eyebrow}
      </span>
    </div>
    <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
      {title}
    </h1>
    <p className="text-[13px] text-[#aaa] mt-1.5">{sub}</p>
  </div>
);

const OrderCard = ({
  order,
  user,
  index,
  currencySymbol,
  formatPrice,
  displayPrice,
  isSeller,
  onContact,
  onComplete,
  completing,
}: {
  order: Order;
  user?: User;
  index: number;
  currencySymbol: string;
  formatPrice: (n: number) => string;
  displayPrice: number;
  isSeller: boolean;
  onContact?: () => void;
  onComplete?: () => void;
  completing?: boolean;
  t?: (key: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.05 }}
    className="flex items-center gap-4 p-4 bg-white border border-[#f0f0f0] hover:border-orange-100 rounded-2xl transition-all duration-200"
  >
    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0] bg-[#fafafa]">
      <Image
        src={order.img || "https://via.placeholder.com/44"}
        alt={order.title}
        fill
        className="object-cover"
      />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-[#111] truncate">
        {order.title}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] text-[#bbb]">
          {isSeller ? "From" : "By"}
        </span>
        <span className="text-[11px] text-[#888] font-medium truncate">
          {user?.username ?? "—"}
        </span>
      </div>
    </div>

    <span className="hidden sm:block text-[13.5px] font-bold text-[#111] shrink-0">
      {currencySymbol}
      {formatPrice(displayPrice)}
    </span>

    <div className="shrink-0">
      {order.isCompleted ? (
        <span className="flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
          <HiOutlineCheckCircle className="text-[12px]" />
          Done
        </span>
      ) : (
        <span className="flex items-center gap-1.5 bg-[#fff8f5] border border-orange-100 text-orange-400 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg">
          <HiOutlineXCircle className="text-[12px]" />
          Pending
        </span>
      )}
    </div>

    {!isSeller && (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onContact}
          className="w-8 h-8 rounded-xl border border-[#f0f0f0] hover:border-orange-200 flex items-center justify-center text-[#ccc] hover:text-orange-500 transition-all"
          title="Message seller"
        >
          <RiMessage3Line className="text-[14px]" />
        </button>
        {!order.isCompleted && (
          <button
            onClick={onComplete}
            disabled={completing}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#111] hover:bg-orange-500 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {completing ? (
              <ClipLoader size={9} color="#fff" />
            ) : (
              <>
                <HiOutlineCheckCircle className="text-[12px]" />
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
        {currencySymbol}
        {formatPrice(total)}
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
    <p className="text-[12px] text-[#ddd] mt-1 text-center max-w-55">{sub}</p>
  </div>
);

export default Orders;

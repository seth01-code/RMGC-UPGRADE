/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { RiMessage3Line } from "react-icons/ri";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineUser,
  HiOutlineDotsHorizontal,
  HiOutlineX,
} from "react-icons/hi";
import { MdOutlineWorkOutline } from "react-icons/md";
import {
  BsPeopleFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsClock,
} from "react-icons/bs";
import {
  TbCurrencyDollar,
  TbSend,
  TbCalendar,
  TbBriefcase,
  TbMapPin,
  TbPlus,
} from "react-icons/tb";
import ClipLoader from "react-spinners/ClipLoader";
import { AnimatePresence, motion } from "framer-motion";
import PostJobModal from "../orders/PostJobModal";

interface WorkPost {
  _id: string;
  title: string;
  description?: string;
  budget?: number;
  currency?: string;
  category?: string;
  skills?: string[];
  deliveryDays?: number;
  deadline?: string;
  experienceLevel?: string;
  locationType?: string;
  proposals?: { _id: string }[];
  proposalCount?: number;
  paymentStatus?: "unpaid" | "paid";
  createdAt: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
}

interface Proposal {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  bidAmount: number;
  bidCurrency: string;
  deliveryDays: number;
  coverLetter: string;
  attachmentUrls: string[];
  createdAt: string;
  freelancer: {
    _id: string;
    username: string;
    img?: string;
    country?: string;
    desc?: string;
    suspended?: boolean;           // ← add
    suspendReason?: string;        // ← add
  };
}

interface WorkProposalsResponse {
  workId: string;
  title: string;
  paymentStatus: "unpaid" | "paid";
  isBooked: boolean;
  proposals: Proposal[];
}

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const daysLeft = (deadline?: string): number | null => {
  if (!deadline) return null;
  return Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000),
  );
};

const formatLocal = (
  amount: number,
  convertPrice: (p: number, c?: string) => number,
  originalCurrency?: string,
): string =>
  convertPrice(amount, originalCurrency).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });

const STATUS_CONFIG: Record<
  string,
  { label: string; rail: string; pill: string; dot: string }
> = {
  open: {
    label: "Open",
    rail: "bg-orange-500",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-600 border-orange-200",
  },
  in_progress: {
    label: "In progress",
    rail: "bg-blue-500",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-600 border-blue-200",
  },
  completed: {
    label: "Completed",
    rail: "bg-gray-300",
    dot: "bg-gray-400",
    pill: "bg-gray-50 text-gray-500 border-gray-200",
  },
  cancelled: {
    label: "Cancelled",
    rail: "bg-gray-200",
    dot: "bg-gray-300",
    pill: "bg-gray-50 text-gray-400 border-gray-200",
  },
};

const PROPOSAL_STATUS: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <BsClock className="text-[9px]" />,
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <BsCheckCircleFill className="text-[9px]" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-500 border-red-200",
    icon: <BsXCircleFill className="text-[9px]" />,
  },
};

/* ── Proposal Card (inside modal) ── */
const ProposalCard: React.FC<{
  p: Proposal;
  jobId: string;
  isBooked: boolean;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
  onContact: (id: string) => void;
  onAccept: (jobId: string, proposalId: string) => void;
  onReject: (jobId: string, proposalId: string) => void;
  acceptingId: string | null;
  rejectingId: string | null;
  index: number;
}> = ({
  p,
  jobId,
  isBooked,
  currencySymbol,
  convertPrice,
  onContact,
  onAccept,
  onReject,
  acceptingId,
  rejectingId,
  index,
}) => {
  const [expanded, setExpanded] = useState(false);
  const fl = p.freelancer;
  const isSuspended = !!fl.suspended;
  const isAccepting = acceptingId === p._id;
  const isRejecting = rejectingId === p._id;
  const isBusy = isAccepting || isRejecting;
  const badge = PROPOSAL_STATUS[p.status] ?? PROPOSAL_STATUS.pending;
  const isPaid = isBooked && p.status === "accepted";
  const isLong = p.coverLetter.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.05 }}
      className={`relative bg-white rounded-2xl border overflow-hidden ${
        isSuspended
          ? "border-red-100 opacity-75"
          : p.status === "accepted"
            ? "border-emerald-200"
            : "border-[#ebebeb]"
      }`}
    >
      {/* Accepted top bar */}
      {p.status === "accepted" && !isSuspended && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-400" />
      )}

      {/* Suspended top bar */}
      {isSuspended && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-red-400" />
      )}

      <div className="p-4">
        {/* Suspension banner */}
        {isSuspended && (
          <div className="flex items-start gap-2 mb-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <BsXCircleFill className="text-red-400 text-[11px] mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-red-500">
                Account suspended
              </p>
              {fl.suspendReason && (
                <p className="text-[10.5px] text-red-400 mt-0.5">
                  {fl.suspendReason}
                </p>
              )}
              <p className="text-[10px] text-red-300 mt-0.5">
                This freelancer cannot be accepted or contacted.
              </p>
            </div>
          </div>
        )}

        {/* Freelancer row */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${fl._id}`} className="shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-orange-50 border border-[#ebebeb] hover:border-orange-300 transition-colors">
              {fl.img ? (
                <Image src={fl.img} alt={fl.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[12px] font-bold text-orange-500">
                  {fl.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${fl._id}`}
                className="text-[13px] font-bold text-[#111] hover:text-orange-500 transition-colors"
              >
                {fl.username}
              </Link>
              {fl.country && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#bbb]">
                  <TbMapPin className="text-[9px]" />
                  {fl.country}
                </span>
              )}
              {/* Suspended badge overrides status badge */}
              {isSuspended ? (
                <span className="flex items-center gap-1 text-[9.5px] font-bold border px-1.5 py-0.5 rounded-full ml-auto shrink-0 bg-red-50 text-red-500 border-red-200">
                  <BsXCircleFill className="text-[9px]" /> Suspended
                </span>
              ) : (
                <span
                  className={`flex items-center gap-1 text-[9.5px] font-bold border px-1.5 py-0.5 rounded-full ml-auto shrink-0 ${badge.className}`}
                >
                  {badge.icon} {badge.label}
                </span>
              )}
            </div>
            {fl.desc && (
              <p className="text-[10.5px] text-[#aaa] mt-0.5 line-clamp-1">
                {fl.desc}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 mb-3 rounded-xl border border-[#f0f0f0] overflow-hidden divide-x divide-[#f0f0f0]">
          <div className="px-3 py-2">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-[#ccc] mb-0.5">Bid</p>
            <p className="text-[14px] font-black text-[#111]">
              {currencySymbol}{formatLocal(p.bidAmount, convertPrice, p.bidCurrency)}
            </p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-[#ccc] mb-0.5">Delivery</p>
            <p className="text-[14px] font-black text-[#111]">
              {p.deliveryDays}<span className="text-[10px] font-semibold text-[#bbb] ml-0.5">d</span>
            </p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-[#ccc] mb-0.5">Sent</p>
            <p className="text-[11px] font-semibold text-[#999]">{timeAgo(p.createdAt)}</p>
          </div>
        </div>

        {/* Cover letter */}
        <div className="mb-3 bg-[#fafafa] rounded-xl border border-[#f0f0f0] px-3 py-2.5">
          <p className="text-[8.5px] font-bold uppercase tracking-wider text-[#ccc] mb-1.5">Cover letter</p>
          <p className={`text-[12px] text-[#555] leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
            {p.coverLetter}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-[10.5px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              {expanded ? "Show less" : "See more"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            href={`/profile/${fl._id}`}
            className="flex items-center gap-1 text-[10.5px] font-semibold text-[#777] border border-[#ebebeb] hover:border-[#d0d0d0] px-2.5 py-1.5 rounded-xl transition-all"
          >
            <HiOutlineUser className="text-[11px]" /> Profile
          </Link>

          {/* Message button — disabled if suspended */}
          <button
            onClick={() => !isSuspended && onContact(fl._id)}
            disabled={isSuspended}
            title={isSuspended ? "This user has been suspended" : undefined}
            className={`flex items-center gap-1 text-[10.5px] font-semibold border px-2.5 py-1.5 rounded-xl transition-all ${
              isSuspended
                ? "text-[#ccc] border-[#f0f0f0] cursor-not-allowed opacity-50"
                : "text-[#777] border-[#ebebeb] hover:border-orange-200 hover:text-orange-500"
            }`}
          >
            <RiMessage3Line className="text-[11px]" /> Message
          </button>

          {isPaid ? (
            <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
              <BsCheckCircleFill className="text-[9px]" /> Paid
            </span>
          ) : p.status === "accepted" && !isSuspended ? (
            <Link
              href={`/pay/job/${jobId}`}
              className="flex items-center gap-1 text-[10.5px] font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 rounded-xl transition-all"
            >
              <TbCurrencyDollar className="text-[11px]" /> Pay now
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-1 text-[10.5px] font-semibold text-[#ccc] border border-[#f0f0f0] px-2.5 py-1.5 rounded-xl opacity-40 cursor-not-allowed"
            >
              <TbCurrencyDollar className="text-[11px]" /> Pay
            </button>
          )}

          {p.status === "pending" && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => onReject(jobId, p._id)}
                disabled={isBusy}
                className="flex items-center gap-1 text-[10.5px] font-semibold text-[#aaa] hover:text-red-500 border border-[#ebebeb] hover:border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40"
              >
                {isRejecting ? <ClipLoader size={8} color="#aaa" /> : <><HiOutlineXCircle className="text-[11px]" /> Decline</>}
              </button>

              {/* Accept — disabled if suspended */}
              <button
                onClick={() => !isSuspended && onAccept(jobId, p._id)}
                disabled={isBusy || isSuspended}
                title={isSuspended ? "Cannot accept a suspended freelancer" : undefined}
                className={`flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
                  isSuspended
                    ? "text-[#ccc] bg-[#f5f5f5] cursor-not-allowed opacity-50"
                    : "text-white bg-[#111] hover:bg-emerald-600 disabled:opacity-40"
                }`}
              >
                {isAccepting ? <ClipLoader size={8} color="#fff" /> : <><HiOutlineCheckCircle className="text-[11px]" /> Accept</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Proposals Modal ── */
const ProposalsModal: React.FC<{
  jobId: string;
  jobTitle: string;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
  onClose: () => void;
  onContact: (id: string) => void;
  onAccept: (jobId: string, proposalId: string) => void;
  onReject: (jobId: string, proposalId: string) => void;
  acceptingId: string | null;
  rejectingId: string | null;
}> = ({
  jobId,
  jobTitle,
  currencySymbol,
  convertPrice,
  onClose,
  onContact,
  onAccept,
  onReject,
  acceptingId,
  rejectingId,
}) => {
  const { data, isLoading, error } = useQuery<WorkProposalsResponse>({
    queryKey: ["workProposals", jobId],
    queryFn: () =>
      newRequest.get(`/work/${jobId}/proposals`).then((r) => r.data),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 shrink-0">
          <div className="w-8 h-1 rounded-full bg-[#e0e0e0]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-4 border-b border-[#f0f0f0] shrink-0">
          <div>
            <p className="text-[9px] font-black tracking-[0.18em] text-[#ccc] uppercase mb-0.5">
              Proposals
            </p>
            <h2 className="text-[15px] font-black text-[#111] leading-tight line-clamp-1">
              {jobTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#f5f5f5] text-[#bbb] hover:text-[#666] transition-all shrink-0 ml-4 mt-0.5"
          >
            <HiOutlineX className="text-[15px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <ClipLoader size={20} color="#f97316" />
            </div>
          )}
          {(error || (!isLoading && !data)) && (
            <p className="text-[12px] text-red-400 py-10 text-center">
              Couldn&apos;t load proposals.
            </p>
          )}
          {data && data.proposals.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f0f0] flex items-center justify-center">
                <TbSend className="text-[20px] text-[#ccc]" />
              </div>
              <p className="text-[13px] font-semibold text-[#bbb]">
                No proposals yet
              </p>
              <p className="text-[11px] text-[#ccc]">
                Freelancers will appear here once they apply.
              </p>
            </div>
          )}
          {data && data.proposals.length > 0 && (
            <div className="flex flex-col gap-3">
              {data.proposals.map((p, i) => (
                <ProposalCard
                  key={p._id}
                  p={p}
                  jobId={jobId}
                  isBooked={data.isBooked}
                  currencySymbol={currencySymbol}
                  convertPrice={convertPrice}
                  onContact={onContact}
                  onAccept={onAccept}
                  onReject={onReject}
                  acceptingId={acceptingId}
                  rejectingId={rejectingId}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer count */}
        {data && data.proposals.length > 0 && (
          <div className="px-5 py-3 border-t border-[#f0f0f0] bg-[#fafafa] shrink-0 rounded-b-3xl">
            <p className="text-[10.5px] text-[#bbb] font-semibold text-center">
              {data.proposals.length}{" "}
              {data.proposals.length === 1 ? "proposal" : "proposals"} received
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ── Job Post Card ── */
const JobPostCard: React.FC<{
  post: WorkPost;
  currentUser: any;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
  onClose: (id: string) => void;
  isClosing: boolean;
  onContact: (id: string) => void;
  index: number;
}> = ({
  post,
  currentUser,
  currencySymbol,
  convertPrice,
  onClose,
  isClosing,
  onContact,
  index,
}) => {
  const queryClient = useQueryClient();
  const [proposalsOpen, setProposalsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const proposalCount = post.proposalCount ?? post.proposals?.length ?? 0;
  const status = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.open;
  const days = daysLeft(post.deadline);
  const isUrgent = days !== null && days <= 2;

  const handleAccept = async (jobId: string, proposalId: string) => {
    setAcceptingId(proposalId);
    try {
      await newRequest.patch(`/work/${jobId}/proposals/${proposalId}/accept`);
      queryClient.invalidateQueries({ queryKey: ["workProposals", jobId] });
      queryClient.invalidateQueries({ queryKey: ["clientWork"] });
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (jobId: string, proposalId: string) => {
    setRejectingId(proposalId);
    try {
      await newRequest.patch(`/work/${jobId}/proposals/${proposalId}/reject`);
      queryClient.invalidateQueries({ queryKey: ["workProposals", jobId] });
    } catch (err) {
      console.error(err);
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.26,
          delay: index * 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative bg-white border border-[#e8e8e8] rounded-3xl overflow-hidden hover:border-[#d0d0d0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all flex flex-col"
      >
        {/* Status rail */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] ${status.rail}`}
        />

        <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                {currentUser?.img ? (
                  <Image
                    src={currentUser.img}
                    alt={currentUser.username}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-black text-orange-500">
                    {currentUser?.username?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-bold text-[#111] truncate">
                  {currentUser?.username ?? "You"}
                </p>
                <div className="flex items-center gap-1 text-[9.5px] text-[#bbb]">
                  <span>{timeAgo(post.createdAt)}</span>
                  {post.category && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{post.category}</span>
                    </>
                  )}
                  {days !== null && (
                    <>
                      <span>·</span>
                      <span
                        className={`font-semibold ${isUrgent ? "text-red-400" : ""}`}
                      >
                        {days === 0 ? "Due today" : `${days}d left`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`flex items-center gap-1.5 text-[9.5px] font-bold border px-2 py-0.5 rounded-full ${status.pill}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#ccc] hover:text-[#888] transition-all"
                >
                  <HiOutlineDotsHorizontal className="text-[14px]" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-20 bg-white border border-[#ebebeb] rounded-2xl overflow-hidden py-1 min-w-[136px] shadow-lg">
                    {post.status === "open" && (
                      <button
                        onClick={() => {
                          onClose(post._id);
                          setMenuOpen(false);
                        }}
                        disabled={isClosing}
                        className="flex w-full px-3.5 py-2.5 text-[11.5px] font-semibold text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isClosing ? (
                          <ClipLoader size={9} color="#f87171" />
                        ) : (
                          "Close listing"
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full px-3.5 py-2.5 text-[11.5px] font-semibold text-[#999] hover:bg-[#f8f8f8] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Budget + Title */}
          {post.budget && (
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-[#ccc] uppercase">
                {currencySymbol}
              </span>
              <span className="text-[26px] font-black text-[#0f0f0f] leading-none tabular-nums tracking-tight">
                {formatLocal(post.budget, convertPrice, post.currency)}
              </span>
              <span className="text-[9.5px] font-bold text-[#ccc] uppercase self-end pb-0.5">
                budget
              </span>
            </div>
          )}
          <h3 className="text-[15px] font-bold text-[#111] leading-snug mb-2">
            {post.title}
          </h3>

          {post.description && (
            <p className="text-[12px] text-[#777] leading-relaxed mb-2.5 line-clamp-2">
              {post.description}
            </p>
          )}

          {/* Skills */}
          {post.skills && post.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {post.skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-[9.5px] font-semibold px-2 py-0.5 bg-[#f5f5f5] text-[#888] rounded-full border border-[#ebebeb]"
                >
                  {s}
                </span>
              ))}
              {post.skills.length > 5 && (
                <span className="text-[9.5px] font-semibold px-2 py-0.5 bg-[#f5f5f5] text-[#aaa] rounded-full border border-[#ebebeb]">
                  +{post.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Meta chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-auto">
            {post.deliveryDays && (
              <span className="flex items-center gap-1 text-[9.5px] font-semibold text-[#888] bg-[#f8f8f8] border border-[#f0f0f0] px-2 py-0.5 rounded-full">
                <TbCalendar className="text-[10px] text-[#ccc]" />
                {post.deliveryDays}d
              </span>
            )}
            {post.locationType && (
              <span className="flex items-center gap-1 text-[9.5px] font-semibold text-[#888] bg-[#f8f8f8] border border-[#f0f0f0] px-2 py-0.5 rounded-full capitalize">
                <TbMapPin className="text-[10px] text-[#ccc]" />
                {post.locationType}
              </span>
            )}
            {post.experienceLevel && (
              <span className="flex items-center gap-1 text-[9.5px] font-semibold text-[#888] bg-[#f8f8f8] border border-[#f0f0f0] px-2 py-0.5 rounded-full capitalize">
                <TbBriefcase className="text-[10px] text-[#ccc]" />
                {post.experienceLevel}
              </span>
            )}
            {post.paymentStatus === "paid" && (
              <span className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <BsCheckCircleFill className="text-[9px]" /> Paid
              </span>
            )}
          </div>
        </div>

        {/* Engagement bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#f5f5f5] bg-[#fefefe] mt-auto">
          <button
            onClick={() => setProposalsOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#777] hover:text-orange-500 hover:bg-orange-50 px-2.5 py-1.5 rounded-xl transition-all"
          >
            <BsPeopleFill className="text-[11px]" />
            {proposalCount} {proposalCount === 1 ? "proposal" : "proposals"}
          </button>
          <div className="flex-1" />
          {post.status === "open" && (
            <button
              onClick={() => onClose(post._id)}
              disabled={isClosing}
              className="text-[10.5px] font-semibold text-[#ccc] hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isClosing ? <ClipLoader size={9} color="#aaa" /> : "Close"}
            </button>
          )}
        </div>
      </motion.article>

      {/* Proposals Modal */}
      <AnimatePresence>
        {proposalsOpen && (
          <ProposalsModal
            jobId={post._id}
            jobTitle={post.title}
            currencySymbol={currencySymbol}
            convertPrice={convertPrice}
            onClose={() => setProposalsOpen(false)}
            onContact={onContact}
            onAccept={handleAccept}
            onReject={handleReject}
            acceptingId={acceptingId}
            rejectingId={rejectingId}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Jobs Page ── */
const JobsPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const { currencySymbol, convertPrice } = useExchangeRate(
    currentUser?.country,
  );

  const { data: jobPosts, isLoading } = useQuery<WorkPost[]>({
    queryKey: ["clientWork"],
    queryFn: () => newRequest.get("/work/client/posts").then((r) => r.data),
    enabled: !!currentUser,
  });

  const closeMutation = useMutation({
    mutationFn: (jobId: string) => newRequest.patch(`/work/${jobId}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientWork"] });
      queryClient.invalidateQueries({ queryKey: ["work"] });
    },
  });

  const handleContact = async (otherUserId: string) => {
    if (!currentUser) return;
    const myId = currentUser.id || currentUser._id;
    if (!myId || !otherUserId) return;
    try {
      await newRequest.post("/conversations", { userId: myId, otherUserId });
      router.push("/chat");
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser || isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh]">
        <ClipLoader size={24} color="#f97316" />
      </div>
    );
  }

  const posts = jobPosts ?? [];
  const openCount = posts.filter((p) => p.status === "open").length;
  const inProgressCount = posts.filter(
    (p) => p.status === "in_progress",
  ).length;
  const totalProposals = posts.reduce(
    (acc, p) => acc + (p.proposalCount ?? p.proposals?.length ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f7f6f4]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-5 bg-orange-500 block" />
            <span className="text-[9.5px] font-black tracking-[0.22em] text-orange-500 uppercase">
              Job board
            </span>
          </div>

          <div
            className={`grid gap-3 mb-0 ${posts.length > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1"}`}
          >
            <div
              className={`${posts.length > 0 ? "col-span-2 sm:col-span-2" : ""} flex items-center justify-between gap-4`}
            >
              <h1 className="text-[34px] font-black text-[#0d0d0d] leading-none tracking-tight">
                My posts
              </h1>
              <button
                onClick={() => setIsPostJobOpen(true)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-[#111] hover:bg-orange-500 px-4 py-2.5 rounded-2xl transition-all shrink-0 active:scale-[0.97]"
              >
                <TbPlus className="text-[14px]" /> Post a job
              </button>
            </div>
            {posts.length > 0 && (
              <>
                <div className="bg-white border border-[#e8e8e8] rounded-2xl px-4 py-3">
                  <p className="text-[24px] font-black text-[#0d0d0d] leading-none">
                    {openCount}
                  </p>
                  <p className="text-[9px] font-bold text-[#bbb] uppercase tracking-wider mt-1">
                    Open
                  </p>
                </div>
                <div className="bg-white border border-[#e8e8e8] rounded-2xl px-4 py-3">
                  <p className="text-[24px] font-black text-[#0d0d0d] leading-none">
                    {totalProposals}
                  </p>
                  <p className="text-[9px] font-bold text-[#bbb] uppercase tracking-wider mt-1">
                    Proposals
                  </p>
                </div>
              </>
            )}
          </div>

          {posts.length > 0 && inProgressCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {inProgressCount} active{" "}
                {inProgressCount === 1 ? "job" : "jobs"} in progress
              </span>
            </div>
          )}
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-5 py-20 border-2 border-dashed border-[#e5e5e5] rounded-3xl bg-white">
            <div className="w-14 h-14 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <MdOutlineWorkOutline className="text-orange-400 text-[26px]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#111] mb-1.5">
                No job posts yet
              </p>
              <p className="text-[12px] text-[#bbb] max-w-[200px] mx-auto">
                Post a gig and let freelancers pitch you directly.
              </p>
            </div>
            <button
              onClick={() => setIsPostJobOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-[#111] hover:bg-orange-500 px-5 py-2.5 rounded-2xl transition-all active:scale-[0.97]"
            >
              <TbPlus className="text-[13px]" /> Post your first job
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post, i) => (
              <JobPostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                currencySymbol={currencySymbol}
                convertPrice={convertPrice}
                onClose={(id) => closeMutation.mutate(id)}
                isClosing={
                  closeMutation.isPending &&
                  closeMutation.variables === post._id
                }
                onContact={handleContact}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <PostJobModal
        open={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default JobsPage;

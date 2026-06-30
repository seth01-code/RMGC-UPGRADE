/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { BsChatSquareDots, BsChatSquareDotsFill } from "react-icons/bs";
import {
  RiSendPlaneLine,
  RiVerifiedBadgeFill,
  RiCloseLine,
  RiCheckLine,
  RiHeart3Line,
  RiHeart3Fill,
  RiMoreFill,
  RiRefreshLine,
  RiUserLine,
  RiTimeLine,
  RiBriefcaseLine,
  RiMapPinLine,
} from "react-icons/ri";
import { MdOutlineWifi } from "react-icons/md";
import ClipLoader from "react-spinners/ClipLoader";
import newRequest from "../../utils/newRequest";
import { useExchangeRate } from "../../hooks/useExchangeRate";

interface ClientInfo {
  _id: string;
  username: string;
  img?: string;
  country?: string;
  isVerified?: boolean;
  totalJobsPosted?: number;
}

interface JobPost {
  _id: string;
  title: string;
  description: string;
  budget: number;
  currency?: string;
  deadline?: string;
  category: string;
  skills: string[];
  experienceLevel: "entry" | "mid" | "expert";
  locationType: "remote" | "onsite" | "hybrid";
  location?: string;
  visibility: "public" | "invite";
  proposals?: { _id: string }[];
  proposalCount?: number;
  likeCount?: number;
  hasApplied?: boolean;
  acceptedProposalId?: string | null;
  createdAt: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  clientId: ClientInfo | string;
}

interface MyProposalResponse {
  work: { _id: string };
  proposal: { _id: string; status: string };
}

interface ProposalDraft {
  bidAmount: string;
  deliveryDays: string;
  coverLetter: string;
}

interface ProposalComment {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  bidAmount: number;
  bidCurrency?: string;
  deliveryDays: number;
  coverLetter: string;
  attachmentUrls?: string[];
  createdAt: string;
  freelancer: {
    _id: string;
    username: string;
    img?: string;
    country?: string;
    desc?: string;
    isSeller?: boolean;
  };
}

interface JobFeedProps {
  currentUser?: any;
}

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: "Entry",
  mid: "Mid",
  expert: "Expert",
};
const EMPTY_DRAFT: ProposalDraft = {
  bidAmount: "",
  deliveryDays: "",
  coverLetter: "",
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
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

const getClientInfo = (clientId: JobPost["clientId"]) => {
  if (clientId && typeof clientId === "object") {
    return {
      id: clientId._id,
      username: clientId.username || "Client",
      img: clientId.img,
      isVerified: clientId.isVerified,
    };
  }
  return {
    id: clientId as string,
    username: "Client",
    img: undefined as string | undefined,
    isVerified: false,
  };
};

const STATUS_RAIL: Record<string, string> = {
  open: "bg-orange-500",
  in_progress: "bg-blue-500",
  completed: "bg-gray-300",
  cancelled: "bg-gray-200",
};

const PROPOSAL_STATUS_STYLES: Record<string, string> = {
  pending: "text-[#999] bg-[#f5f5f5] border-[#ececec]",
  accepted: "text-green-600 bg-green-50 border-green-100",
  rejected: "text-red-400 bg-red-50 border-red-100",
  withdrawn: "text-[#bbb] bg-[#f5f5f5] border-[#ececec]",
};

/* ── Proposal list item ── */
const ProposalCommentItem: React.FC<{
  proposal: ProposalComment;
  jobId: string;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
  isOwner: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isActing: boolean;
  hasAcceptedProposal: boolean;
}> = ({
  proposal,
  currencySymbol,
  convertPrice,
  isOwner,
  onAccept,
  onReject,
  isActing,
  hasAcceptedProposal,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = proposal.coverLetter.length > 160;
  const isAccepted = proposal.status === "accepted";
  return (
    <div
      className={`flex gap-2.5 py-3 ${isAccepted ? "bg-green-50 -mx-4 px-4 rounded-2xl" : ""}`}
    >
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-orange-50 border border-[#ececec]">
        {proposal.freelancer?.img ? (
          <Image
            src={proposal.freelancer.img}
            alt={proposal.freelancer.username}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-orange-500">
            {proposal.freelancer?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-2xl rounded-tl-sm px-3 py-2.5 ${isAccepted ? "bg-white border border-green-100" : "bg-[#f7f7f7]"}`}
        >
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-[#222] truncate">
                {proposal.freelancer?.username ?? "Freelancer"}
              </span>
              {isAccepted && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  <RiCheckLine /> Hired
                </span>
              )}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${PROPOSAL_STATUS_STYLES[proposal.status] ?? PROPOSAL_STATUS_STYLES.pending}`}
            >
              {proposal.status}
            </span>
          </div>
          <p
            className={`text-[12.5px] text-[#555] leading-relaxed ${expanded || !isLong ? "" : "line-clamp-2"}`}
          >
            {proposal.coverLetter}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] font-bold text-orange-500 mt-0.5"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 px-1">
          <span className="text-[11px] font-bold text-[#333]">
            {currencySymbol}
            {formatLocal(
              proposal.bidAmount,
              convertPrice,
              proposal.bidCurrency,
            )}
          </span>
          <span className="text-[10.5px] text-[#bbb]">
            {proposal.deliveryDays}d delivery
          </span>
          <span className="text-[10.5px] text-[#ccc]">·</span>
          <span className="text-[10.5px] text-[#bbb]">
            {timeAgo(proposal.createdAt)}
          </span>
          {isOwner && proposal.status === "pending" && !hasAcceptedProposal && (
            <>
              <button
                onClick={() => onAccept(proposal._id)}
                disabled={isActing}
                className="ml-auto text-[11px] font-bold text-green-600 hover:text-green-700 disabled:opacity-40"
              >
                Accept
              </button>
              <button
                onClick={() => onReject(proposal._id)}
                disabled={isActing}
                className="text-[11px] font-bold text-[#bbb] hover:text-red-400 disabled:opacity-40"
              >
                Decline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AcceptedFreelancerBanner: React.FC<{
  proposal: ProposalComment | undefined;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
}> = ({ proposal, currencySymbol, convertPrice }) => {
  if (!proposal) return null;
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-green-100 border border-green-200">
        {proposal.freelancer?.img ? (
          <Image
            src={proposal.freelancer.img}
            alt={proposal.freelancer.username}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiUserLine className="text-green-600 text-[14px]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
          Freelancer hired
        </p>
        <p className="text-[12px] font-bold text-[#222] truncate">
          {proposal.freelancer?.username ?? "Freelancer"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[12px] font-black text-[#111]">
          {currencySymbol}
          {formatLocal(proposal.bidAmount, convertPrice, proposal.bidCurrency)}
        </p>
        <p className="text-[10px] text-green-600 font-semibold">
          {proposal.deliveryDays}d
        </p>
      </div>
    </div>
  );
};

type FeedTab = "feed" | "saved";

/* ════════════════════════════════════════════════
   JOB CARD — all cards use the large/featured layout
════════════════════════════════════════════════ */
const JobCard: React.FC<{
  job: JobPost;
  isSaved: boolean;
  isLiked: boolean;
  isApplied: boolean;
  isProposalOpen: boolean;
  isCommentsOpen: boolean;
  isOwnPost: boolean;
  showApplyButton: boolean;
  showAppliedBadge: boolean;
  showInProgressLabel: boolean;
  showClosedLabel: boolean;
  hasAcceptedProposal: boolean;
  isActingOnProposal: boolean;
  likeCountDisplay: number;
  proposalsCount: number;
  currencySymbol: string;
  convertPrice: (p: number, c?: string) => number;
  userId?: string;
  proposalsData?: { proposals: ProposalComment[] };
  proposalsLoading: boolean;
  proposalsError: unknown;
  canViewOpenComments: boolean;
  isOwnerOfOpenJob: boolean;
  isSendingProposal: boolean;
  draft: ProposalDraft;
  convertToUSD: (p: number) => number;
  onLike: () => void;
  onSave: () => void;
  onToggleComments: () => void;
  onStartProposal: () => void;
  onCancelProposal: () => void;
  onSendProposal: () => void;
  onDraftChange: (d: ProposalDraft) => void;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onOpenComments: () => void;
}> = ({
  job,
  isSaved,
  isLiked,
  isApplied,
  isProposalOpen,
  isCommentsOpen,
  isOwnPost,
  showApplyButton,
  showAppliedBadge,
  showInProgressLabel,
  showClosedLabel,
  hasAcceptedProposal,
  isActingOnProposal,
  likeCountDisplay,
  proposalsCount,
  currencySymbol,
  convertPrice,
  proposalsData,
  proposalsLoading,
  proposalsError,
  canViewOpenComments,
  isOwnerOfOpenJob,
  isSendingProposal,
  draft,
  convertToUSD,
  onLike,
  onSave,
  onToggleComments,
  onStartProposal,
  onCancelProposal,
  onSendProposal,
  onDraftChange,
  onAccept,
  onReject,
  onOpenComments,
}) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysLeft(job.deadline);
  const client = getClientInfo(job.clientId);
  const isOpen = job.status === "open";
  const isInProgress = job.status === "in_progress";
  const isUrgent = days !== null && days <= 2;
  const railColor = STATUS_RAIL[job.status] ?? STATUS_RAIL.open;
  const acceptedProposal = proposalsData?.proposals?.find(
    (p) => p.status === "accepted",
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white rounded-3xl border border-[#e8e8e8] overflow-hidden flex flex-col hover:border-[#d0d0d0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
    >
      {/* Status rail */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${railColor}`} />

      {/* Card body — always two-column on sm+ */}
      <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col sm:flex-row sm:gap-6 flex-1">
        {/* Left column */}
        <div className="flex flex-col flex-1 min-w-0 sm:flex-[0_0_55%]">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 bg-orange-50 border border-[#ececec]">
                {client.img ? (
                  <Image
                    src={client.img}
                    alt={client.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-orange-500">
                    {client.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11.5px] font-bold text-[#222] truncate">
                    {client.username}
                  </span>
                  {client.isVerified && (
                    <RiVerifiedBadgeFill className="text-orange-500 text-[10px] shrink-0" />
                  )}
                  {job.visibility === "invite" && (
                    <HiOutlineLockClosed className="text-[#ccc] text-[9px] shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9.5px] text-[#bbb]">
                  <RiTimeLine className="text-[9px]" />
                  <span>{timeAgo(job.createdAt)}</span>
                  <span className="mx-0.5">·</span>
                  <RiMapPinLine className="text-[9px]" />
                  <span className="capitalize">{job.locationType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isInProgress ? (
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                  In progress
                </span>
              ) : !isOpen ? (
                <span className="text-[9px] font-bold text-[#aaa] bg-[#f5f5f5] border border-[#ececec] px-1.5 py-0.5 rounded-full capitalize">
                  {job.status.replace("_", " ")}
                </span>
              ) : days !== null ? (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isUrgent ? "text-red-500 bg-red-50 border-red-100" : "text-[#aaa] bg-[#fafafa] border-[#ececec]"}`}
                >
                  {days === 0 ? "Today" : `${days}d`}
                </span>
              ) : null}
              <button
                aria-label="More"
                className="w-5 h-5 rounded-full flex items-center justify-center text-[#ddd] hover:text-[#999] transition-colors"
              >
                <RiMoreFill className="text-[12px]" />
              </button>
            </div>
          </div>

          {/* Budget + title */}
          <div className="mb-2">
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-[26px] sm:text-[30px] font-black text-[#0d0d0d] leading-none tabular-nums tracking-tight">
                <span className="text-[10px] font-bold text-orange-400 align-top mr-0.5 inline-block mt-0.5">
                  {currencySymbol}
                </span>
                {formatLocal(job.budget, convertPrice, job.currency)}
              </span>
              <span className="text-[8.5px] font-black text-orange-300 uppercase tracking-widest self-end pb-0.5">
                budget
              </span>
            </div>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1a1a1a] leading-snug">
              {job.title}
            </h2>
          </div>

          {/* Description */}
          <p
            className={`text-[12px] text-[#666] leading-relaxed mb-2 ${expanded ? "" : "line-clamp-3"}`}
          >
            <span className="font-semibold text-[#333] mr-1">
              {client.username}
            </span>
            {job.description}
          </p>
          {job.description.length > 180 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[10.5px] font-bold text-orange-500 mb-1.5 self-start"
            >
              {expanded ? "less" : "more"}
            </button>
          )}

          {/* In-progress banner */}
          {isInProgress && isOwnPost && !isCommentsOpen && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-2">
              <RiCheckLine className="text-blue-500 text-[11px] shrink-0" />
              <p className="text-[10.5px] font-bold text-blue-700">
                Freelancer accepted.{" "}
                <button
                  onClick={onOpenComments}
                  className="underline underline-offset-2"
                >
                  View proposals
                </button>
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1 mt-auto pt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
              {job.category}
            </span>
            <span className="text-[9.5px] font-semibold text-[#bbb] border border-[#eee] px-2 py-0.5 rounded-full">
              {EXPERIENCE_LABELS[job.experienceLevel] ?? job.experienceLevel}
            </span>
            {job.skills?.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[9.5px] font-semibold text-[#999] border border-[#eee] px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {job.skills?.length > 4 && (
              <span className="text-[9.5px] text-[#bbb]">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Right column — always visible on sm+ */}
        <div className="hidden sm:flex flex-col flex-[0_0_40%] mt-4 sm:mt-0">
          {isInProgress && isCommentsOpen && acceptedProposal ? (
            <AcceptedFreelancerBanner
              proposal={acceptedProposal}
              currencySymbol={currencySymbol}
              convertPrice={convertPrice}
            />
          ) : (
            <div className="flex-1 bg-[#fafafa] rounded-2xl border border-[#f0f0f0] p-4">
              <p className="text-[10px] font-black text-[#ccc] uppercase tracking-widest mb-2">
                About this gig
              </p>
              <p className="text-[12px] text-[#666] leading-relaxed line-clamp-6">
                {job.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-[#f3f3f3] bg-[#fefefe] mt-auto">
        <button
          onClick={onLike}
          disabled={!client || isOwnPost}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all disabled:opacity-40 ${isLiked ? "text-red-500" : "text-[#bbb] hover:bg-[#f5f5f5]"}`}
        >
          {isLiked ? (
            <RiHeart3Fill className="text-[14px]" />
          ) : (
            <RiHeart3Line className="text-[14px]" />
          )}
          <span className="text-[10.5px] font-semibold">
            {likeCountDisplay > 0 ? likeCountDisplay : "Like"}
          </span>
        </button>
        <button
          onClick={onToggleComments}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${isCommentsOpen ? "text-orange-500 bg-orange-50" : "text-[#bbb] hover:bg-[#f5f5f5]"}`}
        >
          {isCommentsOpen ? (
            <BsChatSquareDotsFill className="text-[13px]" />
          ) : (
            <BsChatSquareDots className="text-[13px]" />
          )}
          <span className="text-[10.5px] font-semibold">{proposalsCount}</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={onSave}
          disabled={!client}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${isSaved ? "text-orange-500 bg-orange-50" : "text-[#ccc] hover:text-orange-400"}`}
        >
          {isSaved ? (
            <HiBookmark className="text-[14px]" />
          ) : (
            <HiOutlineBookmark className="text-[14px]" />
          )}
        </button>
        {showAppliedBadge && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
            <RiCheckLine className="text-[11px]" /> Applied
          </span>
        )}
        {showInProgressLabel && (
          <span className="text-[10px] font-bold text-[#bbb] border border-[#eee] px-2.5 py-1 rounded-full">
            Hired
          </span>
        )}
        {showClosedLabel && (
          <span className="text-[10px] font-bold text-[#bbb] border border-[#eee] px-2.5 py-1 rounded-full capitalize">
            {job.status.replace("_", " ")}
          </span>
        )}
        {showApplyButton && (
          <button
            onClick={isProposalOpen ? onCancelProposal : onStartProposal}
            className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${isProposalOpen ? "text-[#888] border border-[#e5e5e5]" : "text-white bg-[#111] hover:bg-orange-500"}`}
          >
            <RiSendPlaneLine className="text-[10px]" />
            {isProposalOpen ? "Cancel" : "Apply"}
          </button>
        )}
      </div>

      {/* Proposals panel */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-[#f3f3f3] bg-[#fafafa]">
              {!canViewOpenComments ? (
                <p className="text-[11.5px] text-[#bbb] text-center py-5">
                  Only {client.username} or a freelancer can view proposals.
                </p>
              ) : proposalsLoading ? (
                <div className="flex justify-center py-6">
                  <ClipLoader size={16} color="#f97316" />
                </div>
              ) : proposalsError ? (
                <p className="text-[11.5px] text-red-400 text-center py-5">
                  Couldn&apos;t load proposals.
                </p>
              ) : !proposalsData?.proposals?.length ? (
                <p className="text-[11.5px] text-[#bbb] text-center py-5">
                  No proposals yet.
                </p>
              ) : (
                <div className="divide-y divide-[#f0f0f0]">
                  {proposalsData.proposals.map((p) => (
                    <ProposalCommentItem
                      key={p._id}
                      proposal={p}
                      jobId={job._id}
                      currencySymbol={currencySymbol}
                      convertPrice={convertPrice}
                      isOwner={isOwnerOfOpenJob}
                      isActing={isActingOnProposal}
                      hasAcceptedProposal={hasAcceptedProposal}
                      onAccept={onAccept}
                      onReject={onReject}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal form */}
      <AnimatePresence>
        {isProposalOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 rounded-2xl border border-[#efefef] bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f5f5f5] bg-[#fafafa]">
                <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest">
                  Your proposal
                </p>
                <button
                  onClick={onCancelProposal}
                  className="text-[#ccc] hover:text-[#888]"
                >
                  <RiCloseLine className="text-[14px]" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9.5px] font-semibold text-[#bbb] mb-1.5">
                      Bid ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.bidAmount}
                      onChange={(e) =>
                        onDraftChange({ ...draft, bidAmount: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 text-[13px] font-semibold text-[#111] bg-[#fafafa] border border-[#eee] rounded-xl outline-none focus:border-orange-300 focus:bg-white transition-all"
                    />
                    {draft.bidAmount && currencySymbol !== "$" && (
                      <p className="text-[9.5px] text-[#bbb] mt-1">
                        ≈ $
                        {convertToUSD(Number(draft.bidAmount)).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}{" "}
                        USD
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-semibold text-[#bbb] mb-1.5">
                      Delivery (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.deliveryDays}
                      onChange={(e) =>
                        onDraftChange({
                          ...draft,
                          deliveryDays: e.target.value,
                        })
                      }
                      placeholder="e.g. 7"
                      className="w-full px-3 py-2 text-[13px] font-semibold text-[#111] bg-[#fafafa] border border-[#eee] rounded-xl outline-none focus:border-orange-300 focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold text-[#bbb] mb-1.5">
                    Why you&apos;re the right fit
                  </label>
                  <textarea
                    rows={3}
                    value={draft.coverLetter}
                    onChange={(e) =>
                      onDraftChange({ ...draft, coverLetter: e.target.value })
                    }
                    placeholder="Your experience and approach…"
                    className="w-full px-3 py-2 text-[12.5px] text-[#333] bg-[#fafafa] border border-[#eee] rounded-xl outline-none focus:border-orange-300 focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <p className="text-[9.5px] text-[#ccc]">
                    {draft.coverLetter.length}/2000
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={onCancelProposal}
                      className="px-3 py-1.5 text-[11px] font-bold text-[#999] border border-[#eee] rounded-xl hover:bg-[#fafafa]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSendProposal}
                      disabled={
                        isSendingProposal ||
                        !draft.bidAmount ||
                        !draft.coverLetter.trim()
                      }
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-white bg-[#111] hover:bg-orange-500 rounded-xl transition-all disabled:opacity-40"
                    >
                      {isSendingProposal ? (
                        <ClipLoader size={10} color="#fff" />
                      ) : (
                        <>
                          <RiSendPlaneLine className="text-[10px]" /> Send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

/* ════════════════════════════════════════════════
   MAIN FEED
════════════════════════════════════════════════ */
const JobFeed: React.FC<JobFeedProps> = ({ currentUser: propUser }) => {
  const queryClient = useQueryClient();

  const currentUser =
    propUser ??
    (() => {
      try {
        const raw = localStorage.getItem("currentUser");
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    })();

  const { currencySymbol, convertPrice, convertToUSD } = useExchangeRate(
    currentUser?.country,
  );
  const userId: string | undefined =
    currentUser?._id?.toString() || currentUser?.id?.toString() || undefined;
  const isSeller: boolean =
    currentUser?.isSeller === true ||
    currentUser?.isSeller === "true" ||
    currentUser?.role === "seller";

  const [tab, setTab] = useState<FeedTab>("feed");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const savedFromServer = useRef<Set<string>>(new Set());
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const likedFromServer = useRef<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [openProposalId, setOpenProposalId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProposalDraft>(EMPTY_DRAFT);
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newJobsAvailable, setNewJobsAvailable] = useState(false);
  const latestCreatedAt = useRef<string | null>(null);
  const [displayJobs, setDisplayJobs] = useState<JobPost[]>([]);
  const initialLoadDone = useRef(false);

  const { isLoading, error, data, refetch, isRefetching } = useQuery<JobPost[]>(
    {
      queryKey: ["work"],
      queryFn: () => newRequest.get("/work").then((r) => r.data),
      staleTime: 0,
      refetchInterval: false,
      placeholderData: (prev) => prev,
    },
  );

  useEffect(() => {
    if (!data?.length || initialLoadDone.current) return;
    setDisplayJobs(data);
    latestCreatedAt.current = data[0]?.createdAt ?? null;
    initialLoadDone.current = true;
  }, [data]);

  useEffect(() => {
    if (!initialLoadDone.current && !data?.length) return;
    const interval = setInterval(async () => {
      try {
        const res = await newRequest.get("/work?limit=1");
        const newest = res.data?.[0];
        if (
          newest &&
          latestCreatedAt.current &&
          newest.createdAt > latestCreatedAt.current
        )
          setNewJobsAvailable(true);
      } catch {
        /* silent */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [data]);

  const handleRefresh = useCallback(() => {
    setNewJobsAvailable(false);
    refetch().then(({ data: freshData }) => {
      if (!freshData?.length) return;
      setDisplayJobs((prev) => {
        const existingIds = new Set(prev.map((j) => j._id));
        const newOnly = freshData.filter((j) => !existingIds.has(j._id));
        const merged = [...newOnly, ...prev];
        latestCreatedAt.current = merged[0]?.createdAt ?? null;
        return merged;
      });
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [refetch]);

  const { data: savedData } = useQuery<JobPost[]>({
    queryKey: ["savedWork"],
    queryFn: () => newRequest.get("/work/freelancer/saved").then((r) => r.data),
    enabled: !!userId,
    staleTime: 0,
  });
  const { data: likedData } = useQuery<{ jobIds: string[] }>({
    queryKey: ["likedWork"],
    queryFn: () => newRequest.get("/work/freelancer/liked").then((r) => r.data),
    enabled: !!userId,
    staleTime: 0,
  });
  const { data: myProposalsData } = useQuery<MyProposalResponse[]>({
    queryKey: ["myProposals"],
    queryFn: () =>
      newRequest.get("/work/freelancer/proposals").then((r) => r.data),
    enabled: !!userId && isSeller,
    staleTime: 0,
  });

  useEffect(() => {
    if (!savedData) return;
    const ids = new Set(savedData.map((j) => j._id));
    savedFromServer.current = ids;
    setSavedJobs(ids);
  }, [savedData]);

  useEffect(() => {
    if (!likedData) return;
    const ids = new Set(likedData.jobIds ?? []);
    likedFromServer.current = ids;
    setLikedJobs(ids);
  }, [likedData]);

  useEffect(() => {
    if (myProposalsData)
      setAppliedJobs(
        new Set(myProposalsData.map((p) => p.work._id.toString())),
      );
  }, [myProposalsData]);

  const openJob = displayJobs.find((j) => j._id === openCommentsId);
  const isOwnerOfOpenJob =
    !!openJob && getClientInfo(openJob.clientId).id === userId;
  const canViewOpenComments = isOwnerOfOpenJob || isSeller;

  const {
    data: proposalsData,
    isLoading: proposalsLoading,
    error: proposalsError,
  } = useQuery<{ proposals: ProposalComment[] }>({
    queryKey: ["workProposals", openCommentsId, isOwnerOfOpenJob],
    queryFn: () =>
      newRequest
        .get(
          isOwnerOfOpenJob
            ? `/work/${openCommentsId}/proposals`
            : `/work/${openCommentsId}/proposals/applicants`,
        )
        .then((r) => r.data),
    enabled: !!openCommentsId && canViewOpenComments,
  });

  const saveMutation = useMutation({
    mutationFn: (jobId: string) => newRequest.patch(`/work/${jobId}/save`),
    onMutate: (jobId) =>
      setSavedJobs((prev) => {
        const n = new Set(prev);
        n.has(jobId) ? n.delete(jobId) : n.add(jobId);
        return n;
      }),
    onSuccess: (res, jobId) => {
      const { saved } = res.data as { saved: boolean };
      setSavedJobs((prev) => {
        const n = new Set(prev);
        saved ? n.add(jobId) : n.delete(jobId);
        return n;
      });
      const ns = new Set(savedFromServer.current);
      saved ? ns.add(jobId) : ns.delete(jobId);
      savedFromServer.current = ns;
      queryClient.invalidateQueries({ queryKey: ["savedWork"] });
    },
    onError: (_e, jobId) =>
      setSavedJobs((prev) => {
        const n = new Set(prev);
        savedFromServer.current.has(jobId) ? n.add(jobId) : n.delete(jobId);
        return n;
      }),
  });

  const likeMutation = useMutation({
    mutationFn: (jobId: string) => newRequest.patch(`/work/${jobId}/like`),
    onMutate: (jobId) =>
      setLikedJobs((prev) => {
        const n = new Set(prev);
        n.has(jobId) ? n.delete(jobId) : n.add(jobId);
        return n;
      }),
    onSuccess: (res, jobId) => {
      const { liked, likeCount } = res.data as {
        liked: boolean;
        likeCount: number;
      };
      setLikedJobs((prev) => {
        const n = new Set(prev);
        liked ? n.add(jobId) : n.delete(jobId);
        return n;
      });
      const ns = new Set(likedFromServer.current);
      liked ? ns.add(jobId) : ns.delete(jobId);
      likedFromServer.current = ns;
      setDisplayJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, likeCount } : j)),
      );
    },
    onError: (_e, jobId) =>
      setLikedJobs((prev) => {
        const n = new Set(prev);
        likedFromServer.current.has(jobId) ? n.add(jobId) : n.delete(jobId);
        return n;
      }),
  });

  const proposalMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: any }) =>
      newRequest.post(`/work/${jobId}/proposals`, payload),
    onSuccess: (_d, variables) => {
      setAppliedJobs((prev) => new Set([...prev, variables.jobId]));
      setDisplayJobs((prev) =>
        prev.map((j) =>
          j._id === variables.jobId ? { ...j, hasApplied: true } : j,
        ),
      );
      setOpenProposalId(null);
      setDraft(EMPTY_DRAFT);
      queryClient.invalidateQueries({ queryKey: ["work"] });
      queryClient.invalidateQueries({ queryKey: ["myProposals"] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({
      jobId,
      proposalId,
    }: {
      jobId: string;
      proposalId: string;
    }) => newRequest.patch(`/work/${jobId}/proposals/${proposalId}/accept`),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["work"] });
      queryClient.invalidateQueries({
        queryKey: ["workProposals", vars.jobId],
      });
      setDisplayJobs((prev) =>
        prev.map((j) =>
          j._id === vars.jobId
            ? {
                ...j,
                status: "in_progress",
                acceptedProposalId: vars.proposalId,
              }
            : j,
        ),
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      jobId,
      proposalId,
    }: {
      jobId: string;
      proposalId: string;
    }) => newRequest.patch(`/work/${jobId}/proposals/${proposalId}/reject`),
    onSuccess: (_d, vars) =>
      queryClient.invalidateQueries({
        queryKey: ["workProposals", vars.jobId],
      }),
  });

  const allJobs = displayJobs;
  const visibleSavedCount = allJobs.filter(
    (j) => savedJobs.has(j._id) && j.status === "open",
  ).length;
  const jobs =
    tab === "saved"
      ? allJobs.filter((j) => savedJobs.has(j._id) && j.status === "open")
      : allJobs;

  return (
    <div className="min-h-screen bg-[#f7f6f4]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* ── Hero ── */}
        <div className="pt-10 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black tracking-[0.22em] text-orange-500 uppercase">
              <MdOutlineWifi className="text-[11px]" /> Live
            </span>
            <span className="w-1 h-1 rounded-full bg-[#ddd]" />
            <span className="text-[9.5px] font-bold tracking-[0.15em] text-[#bbb] uppercase">
              Remote gigs
            </span>
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-[38px] sm:text-[50px] font-black text-[#0d0d0d] leading-[0.92] tracking-tight">
              Open
              <br />
              <span className="text-orange-500">work.</span>
            </h1>
            {!isLoading && allJobs.length > 0 && (
              <div className="flex gap-2 mb-1">
                <div className="bg-white rounded-2xl border border-[#e8e8e8] px-4 py-2.5 text-center min-w-[60px]">
                  <p className="text-[20px] font-black text-[#0d0d0d] leading-none">
                    {allJobs.filter((j) => j.status === "open").length}
                  </p>
                  <p className="text-[8.5px] font-bold text-[#bbb] uppercase tracking-wider mt-0.5">
                    Open
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-[#e8e8e8] px-4 py-2.5 text-center min-w-[60px]">
                  <p className="text-[20px] font-black text-[#0d0d0d] leading-none">
                    {allJobs.filter((j) => j.status === "in_progress").length}
                  </p>
                  <p className="text-[8.5px] font-bold text-[#bbb] uppercase tracking-wider mt-0.5">
                    Active
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-[#e8e8e8] px-4 py-2.5 text-center min-w-[60px]">
                  <p className="text-[20px] font-black text-[#0d0d0d] leading-none">
                    {allJobs.length}
                  </p>
                  <p className="text-[8.5px] font-bold text-[#bbb] uppercase tracking-wider mt-0.5">
                    Total
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab + refresh ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {!!userId && (
            <div className="flex items-center gap-1 bg-white border border-[#e8e8e8] p-1 rounded-2xl">
              <button
                onClick={() => setTab("feed")}
                className={`px-4 py-1.5 text-[11.5px] font-bold rounded-xl transition-all ${tab === "feed" ? "bg-[#111] text-white" : "text-[#999] hover:text-[#555]"}`}
              >
                Feed
              </button>
              <button
                onClick={() => setTab("saved")}
                className={`px-4 py-1.5 text-[11.5px] font-bold rounded-xl transition-all ${tab === "saved" ? "bg-[#111] text-white" : "text-[#999] hover:text-[#555]"}`}
              >
                Saved
                {visibleSavedCount > 0 && (
                  <span
                    className={`ml-1.5 text-[9.5px] font-black px-1.5 py-0.5 rounded-full ${tab === "saved" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600"}`}
                  >
                    {visibleSavedCount}
                  </span>
                )}
              </button>
            </div>
          )}
          <AnimatePresence>
            {newJobsAvailable && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleRefresh}
                className="flex items-center gap-1.5 py-2 px-4 rounded-2xl bg-orange-500 text-white text-[11.5px] font-bold hover:bg-orange-600 transition-all shadow-[0_2px_8px_rgba(249,115,22,0.3)]"
              >
                <RiRefreshLine className="text-[13px]" /> New gigs — load
              </motion.button>
            )}
          </AnimatePresence>
          {isRefetching && <ClipLoader size={14} color="#f97316" />}
        </div>

        {/* ── Feed ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <ClipLoader size={24} color="#f97316" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-3xl border border-[#e8e8e8]">
            <p className="text-[14px] font-bold text-[#ccc]">
              Couldn&apos;t load gigs
            </p>
            <p className="text-[12px] text-[#ddd] mt-1">
              Check connection and refresh.
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center bg-white rounded-3xl border border-[#e8e8e8]">
            {tab === "saved" ? (
              <>
                <HiOutlineBookmark className="text-[28px] text-[#e0e0e0] mb-3" />
                <p className="text-[13px] font-bold text-[#ccc]">
                  No saved gigs
                </p>
                <p className="text-[11.5px] text-[#ddd] mt-1">
                  Bookmark open gigs to find them here.
                </p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-bold text-[#ccc]">
                  No open gigs yet
                </p>
                <p className="text-[11.5px] text-[#ddd] mt-1">
                  Check back soon.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 auto-rows-min">
            {jobs.map((job, i) => {
              const isSaved = savedJobs.has(job._id);
              const isLiked = likedJobs.has(job._id);
              const isApplied =
                job.hasApplied === true || appliedJobs.has(job._id);
              const isProposalOpen = openProposalId === job._id;
              const isCommentsOpen = openCommentsId === job._id;
              const isSendingProposal =
                proposalMutation.isPending &&
                proposalMutation.variables?.jobId === job._id;
              const client = getClientInfo(job.clientId);
              const isOwnPost = client.id === userId;
              const proposalsCount =
                job.proposalCount ?? job.proposals?.length ?? 0;
              const isOpen = job.status === "open";
              const isInProgress = job.status === "in_progress";
              const acceptedProposal = proposalsData?.proposals?.find(
                (p) => p.status === "accepted",
              );
              const hasAcceptedProposal =
                !!job.acceptedProposalId || !!acceptedProposal;
              const isActingOnProposal =
                (acceptMutation.isPending &&
                  acceptMutation.variables?.jobId === job._id) ||
                (rejectMutation.isPending &&
                  rejectMutation.variables?.jobId === job._id);

              return (
                <JobCard
                  key={job._id}
                  job={job}
                  isSaved={isSaved}
                  isLiked={isLiked}
                  isApplied={isApplied}
                  isProposalOpen={isProposalOpen}
                  isCommentsOpen={isCommentsOpen}
                  isOwnPost={isOwnPost}
                  showApplyButton={
                    !!userId &&
                    isSeller &&
                    !isOwnPost &&
                    isOpen &&
                    !isApplied &&
                    !hasAcceptedProposal
                  }
                  showAppliedBadge={
                    !!userId && isSeller && !isOwnPost && isApplied
                  }
                  showInProgressLabel={!isOwnPost && isInProgress && !isApplied}
                  showClosedLabel={
                    !isOwnPost && !isOpen && !isInProgress && !isApplied
                  }
                  hasAcceptedProposal={hasAcceptedProposal}
                  isActingOnProposal={isActingOnProposal}
                  likeCountDisplay={job.likeCount ?? 0}
                  proposalsCount={proposalsCount}
                  currencySymbol={currencySymbol}
                  convertPrice={convertPrice}
                  userId={userId}
                  proposalsData={isCommentsOpen ? proposalsData : undefined}
                  proposalsLoading={proposalsLoading}
                  proposalsError={proposalsError}
                  canViewOpenComments={canViewOpenComments}
                  isOwnerOfOpenJob={isOwnerOfOpenJob}
                  isSendingProposal={isSendingProposal}
                  draft={draft}
                  convertToUSD={convertToUSD}
                  onLike={() => likeMutation.mutate(job._id)}
                  onSave={() => saveMutation.mutate(job._id)}
                  onToggleComments={() =>
                    setOpenCommentsId((prev) =>
                      prev === job._id ? null : job._id,
                    )
                  }
                  onStartProposal={() => {
                    setOpenProposalId(job._id);
                    setDraft(EMPTY_DRAFT);
                  }}
                  onCancelProposal={() => {
                    setOpenProposalId(null);
                    setDraft(EMPTY_DRAFT);
                  }}
                  onSendProposal={() => {
                    if (!draft.bidAmount || !draft.coverLetter.trim()) return;
                    proposalMutation.mutate({
                      jobId: job._id,
                      payload: {
                        bidAmount: convertToUSD(Number(draft.bidAmount)),
                        bidCurrency: "USD",
                        deliveryDays: draft.deliveryDays
                          ? Number(draft.deliveryDays)
                          : undefined,
                        coverLetter: draft.coverLetter.trim(),
                      },
                    });
                  }}
                  onDraftChange={setDraft}
                  onAccept={(proposalId) =>
                    acceptMutation.mutate({ jobId: job._id, proposalId })
                  }
                  onReject={(proposalId) =>
                    rejectMutation.mutate({ jobId: job._id, proposalId })
                  }
                  onOpenComments={() => setOpenCommentsId(job._id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFeed;

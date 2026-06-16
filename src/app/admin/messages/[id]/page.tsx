"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import { IoTimeOutline } from "react-icons/io5";
import {
  FaFilePdf, FaFileWord, FaFileExcel,
  FaFilePowerpoint, FaFileAlt,
} from "react-icons/fa";
import newRequest from "../../../utils/newRequest";
import AudioMessagePlayer from "../components/AudioMessagePlayer";
import ChatImage from "../components/ChatImage";
import CustomVideoPlayer from "../components/CustomVideoPlayer";

const FALLBACK =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

interface User { _id: string; username: string; img?: string; }
interface Message {
  _id: string;
  senderId: User | string; // ← can be either
  text?: string;
  media?: string;
  createdAt: string;
}
interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: string;
  updatedAt: string;
}

const fileIconMap: Record<string, React.ReactNode> = {
  pdf:  <FaFilePdf className="text-red-500 text-[15px]" />,
  doc:  <FaFileWord className="text-blue-500 text-[15px]" />,
  docx: <FaFileWord className="text-blue-500 text-[15px]" />,
  xls:  <FaFileExcel className="text-green-500 text-[15px]" />,
  xlsx: <FaFileExcel className="text-green-500 text-[15px]" />,
  ppt:  <FaFilePowerpoint className="text-orange-500 text-[15px]" />,
  pptx: <FaFilePowerpoint className="text-orange-500 text-[15px]" />,
  txt:  <FaFileAlt className="text-[#aaa] text-[15px]" />,
};

const getFileIcon = (url: string) => {
  const ext = getExt(url);
  return fileIconMap[ext] || <FaFileAlt className="text-[#aaa] text-[15px]" />;
};

const getFileName = (url: string) => url.split("/").pop()?.split("?")[0] || "file";

// ── Safely extract extension even from URLs with query strings ──
const getExt = (url: string) => {
  const clean = url.split("?")[0];
  return clean.split(".").pop()?.toLowerCase() ?? "";
};

const isImage    = (url: string) => /^(jpeg|jpg|png|gif|webp|svg|bmp|tiff|ico|heic|avif)$/.test(getExt(url));
const isVideo    = (url: string) => /^(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/.test(getExt(url));
const isAudio    = (url: string) => /^(mp3|wav|ogg|flac|aac|m4a)$/.test(getExt(url));
const isDocument = (url: string) => /^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/.test(getExt(url));

// ── Safely get sender ID whether senderId is a User object or a string ──
const getSenderId = (senderId: User | string): string => {
  if (typeof senderId === "string") return senderId;
  return senderId._id;
};

// ── Safely get sender User object if populated ──
const getSenderUser = (senderId: User | string): User | undefined => {
  if (typeof senderId === "object" && senderId !== null) return senderId;
  return undefined;
};

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

// ── Skeleton ──
const MessageSkeleton = () => (
  <div className="space-y-4 p-4">
    {[false, true, false, false, true].map((right, i) => (
      <div key={i} className={`flex items-end gap-3 ${right ? "justify-end" : "justify-start"}`}>
        {!right && <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex-shrink-0" />}
        <div className={`h-10 rounded-2xl bg-[#f5f5f5] animate-pulse ${right ? "w-48" : "w-56"}`} />
        {right && <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex-shrink-0" />}
      </div>
    ))}
  </div>
);

// ── Participant chip ──
const ParticipantChip = ({ user, role, color }: { user: User; role: string; color: "orange" | "gray" }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#f0f0f0] flex-shrink-0">
      <Image src={user.img || FALLBACK} alt={user.username} fill className="object-cover" />
    </div>
    <div>
      <p className="text-[12.5px] font-bold text-[#111] truncate leading-none mb-1">{user.username}</p>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
        color === "orange" ? "bg-orange-500/10 text-orange-500" : "bg-[#f5f5f5] text-[#aaa]"
      }`}>
        {role}
      </span>
    </div>
  </div>
);

// ── Message bubble ──
const Bubble = ({
  msg, isSender, senderUser, receiverUser,
}: {
  msg: Message; isSender: boolean; senderUser?: User; receiverUser?: User;
}) => {
  // Use populated user from senderId if available, fallback to participant data
  const populatedSender = getSenderUser(msg.senderId);
  const avatar = isSender
    ? (populatedSender || senderUser)
    : receiverUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2.5 ${isSender ? "justify-end" : "justify-start"}`}
    >
      {!isSender && (
        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#f0f0f0] flex-shrink-0 mb-4">
          <Image src={avatar?.img || FALLBACK} alt={avatar?.username || ""} fill className="object-cover" />
        </div>
      )}

      <div className={`flex flex-col max-w-[72%] ${isSender ? "items-end" : "items-start"}`}>

        {/* Text */}
        {msg.text && (
          <div className={`px-4 py-2.5 text-[13.5px] leading-relaxed rounded-2xl shadow-sm ${
            isSender
              ? "bg-[#111] text-white rounded-br-sm"
              : "bg-white border border-[#f0f0f0] text-[#333] rounded-bl-sm"
          }`}>
            {msg.text}
          </div>
        )}

        {/* Image */}
        {msg.media && isImage(msg.media) && (
          <div className="mt-1 rounded-2xl overflow-hidden max-w-[260px]">
            <ChatImage media={msg.media} />
          </div>
        )}

        {/* Video */}
        {msg.media && isVideo(msg.media) && (
          <div className="mt-1 rounded-2xl overflow-hidden max-w-[280px]">
            <CustomVideoPlayer
              src={msg.media}
              fileExtension={(getExt(msg.media) as any) ?? "mp4"}
            />
          </div>
        )}

        {/* Audio */}
        {msg.media && isAudio(msg.media) && (
          <div className="mt-1">
            <AudioMessagePlayer
              src={msg.media}
              fileExtension={getExt(msg.media)}
              fileName={getFileName(msg.media)}
              isSender={isSender}
            />
          </div>
        )}

        {/* Document */}
        {msg.media && isDocument(msg.media) && (
          <a
            href={msg.media}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-[12.5px] font-medium transition-colors ${
              isSender
                ? "bg-[#111] border-[#222] text-white hover:bg-[#222]"
                : "bg-white border-[#f0f0f0] text-[#333] hover:border-orange-200"
            }`}
          >
            {getFileIcon(msg.media)}
            <span className="truncate max-w-[180px]">{getFileName(msg.media)}</span>
          </a>
        )}

        {/* Timestamp */}
        <div className={`flex items-center gap-1 mt-1 ${isSender ? "flex-row-reverse" : ""}`}>
          <IoTimeOutline className="text-[10px] text-[#ccc]" />
          <span className="text-[10px] text-[#ccc]">{formatTime(msg.createdAt)}</span>
        </div>
      </div>

      {isSender && (
        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#f0f0f0] flex-shrink-0 mb-4">
          <Image src={avatar?.img || FALLBACK} alt={avatar?.username || ""} fill className="object-cover" />
        </div>
      )}
    </motion.div>
  );
};

// ── Group by date ──
const groupByDate = (messages: Message[]) => {
  const groups: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

// ── Main ──
const MessageDetail: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const { data: conversationData, isLoading: convoLoading, error: convoError } =
    useQuery<Conversation>({
      queryKey: ["conversation", id],
      queryFn: () => newRequest.get(`/conversations/single/${id}`).then((r) => r.data),
      enabled: !!id,
    });

  const { data: messages = [], isLoading: messagesLoading, error: messagesError } =
    useQuery<Message[]>({
      queryKey: ["messages", id],
      queryFn: () => newRequest.get(`/messages/${id}`).then((r) => r.data),
      enabled: !!id,
    });

  const sender   = conversationData?.participants?.[0];
  const receiver = conversationData?.participants?.[1];
  const grouped  = groupByDate(messages);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col h-screen max-h-screen">

        {/* ── Header ── */}
        <div className="flex-shrink-0 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[12.5px] font-semibold text-[#aaa] hover:text-orange-500 transition-colors mb-5"
          >
            <HiArrowLeft className="text-[15px]" />
            Back to conversations
          </button>

          <div className="flex items-center justify-between gap-4 p-4 bg-white border border-[#f0f0f0] rounded-2xl">
            {convoLoading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0]" />
                <div className="h-3 bg-[#f5f5f5] rounded-full w-24" />
              </div>
            ) : (
              <>
                {sender && <ParticipantChip user={sender} role="Client" color="gray" />}

                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="h-px w-8 bg-[#f0f0f0]" />
                  <span className="text-[9px] font-bold text-[#ccc] tracking-widest uppercase">vs</span>
                  <div className="h-px w-8 bg-[#f0f0f0]" />
                </div>

                {receiver && <ParticipantChip user={receiver} role="Freelancer" color="orange" />}

                <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                  <span className="text-[20px] font-extrabold text-[#111]">{messages.length}</span>
                  <span className="text-[10px] text-[#bbb] uppercase tracking-wider">messages</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto scrollbar-none bg-[#fafafa] border border-[#f0f0f0] rounded-2xl p-4 space-y-1">
          {convoLoading || messagesLoading ? (
            <MessageSkeleton />
          ) : convoError || messagesError ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="text-[14px] font-semibold text-red-400">Failed to load messages</p>
              <p className="text-[12px] text-red-300 mt-1">Please try again later.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="text-[13px] text-[#ccc]">No messages in this conversation.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-[#f0f0f0]" />
                  <span className="text-[10px] font-bold text-[#ccc] tracking-wide px-2">
                    {formatDate(msgs[0].createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-[#f0f0f0]" />
                </div>

                <div className="space-y-3">
                  {msgs.map((msg) => {
                    const senderId = getSenderId(msg.senderId);
                    const isSender = senderId === sender?._id;
                    return (
                      <Bubble
                        key={msg._id}
                        msg={msg}
                        isSender={isSender}
                        senderUser={sender}
                        receiverUser={receiver}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Read-only notice ── */}
        <div className="flex-shrink-0 mt-3">
          <div className="flex items-center justify-center gap-2 py-3 border border-dashed border-[#ebebeb] rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ddd]" />
            <p className="text-[11.5px] text-[#ccc] font-medium">
              Read-only view — admin monitoring mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
"use client";

import React, { JSX, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone, FaFileAlt, FaCamera, FaVideo, FaPaperclip,
} from "react-icons/fa";
import {
  HiOutlineSearch, HiOutlineChatAlt2,
} from "react-icons/hi";
import { IoChevronForward } from "react-icons/io5";
import { TbMessages } from "react-icons/tb";

const FALLBACK =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

interface User { _id: string; username: string; img?: string; }
interface Message { text?: string; mediaType?: "audio" | "document" | "image" | "video" | "file"; }
interface Conversation { _id: string; participants: [User, User]; lastMessage?: Message; }

const mediaMap: Record<string, JSX.Element> = {
  audio:    <><FaMicrophone className="inline text-blue-400 mr-1 text-[11px]" />Voice message</>,
  document: <><FaFileAlt className="inline text-green-400 mr-1 text-[11px]" />Document</>,
  image:    <><FaCamera className="inline text-purple-400 mr-1 text-[11px]" />Photo</>,
  video:    <><FaVideo className="inline text-red-400 mr-1 text-[11px]" />Video</>,
  file:     <><FaPaperclip className="inline text-[#aaa] mr-1 text-[11px]" />File</>,
};

const getLastMessage = (msg?: Message | null): JSX.Element | string => {
  if (!msg) return "No messages yet";
  if (msg.mediaType) return mediaMap[msg.mediaType] || msg.text || "No messages yet";
  return msg.text || "No messages yet";
};

const AvatarPair = ({ client, provider }: { client: User; provider: User }) => (
  <div className="flex items-center">
    <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 z-10">
      <Image src={client.img?.trim() || FALLBACK} alt={client.username} fill className="object-cover" />
    </div>
    <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 -ml-3">
      <Image src={provider.img?.trim() || FALLBACK} alt={provider.username} fill className="object-cover" />
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse flex items-center gap-4 p-4 border border-[#f0f0f0] rounded-2xl">
    <div className="flex -space-x-3">
      <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] border-2 border-white z-10" />
      <div className="w-10 h-10 rounded-xl bg-[#f0f0f0] border-2 border-white" />
    </div>
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-3 bg-[#f5f5f5] rounded-full w-2/3" />
      <div className="h-2.5 bg-[#fafafa] rounded-full w-1/2" />
      <div className="h-2.5 bg-[#fafafa] rounded-full w-3/4" />
    </div>
    <div className="w-4 h-4 bg-[#f5f5f5] rounded-full flex-shrink-0" />
  </div>
);

const AdminMessages: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading, error } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get("/conversations").then((r) => r.data),
  });

  const filtered = conversations.filter((conv) => {
    const [c, p] = conv.participants;
    const q = search.toLowerCase();
    return (
      c.username.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-orange-500" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              Admin
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
                Conversations
              </h1>
              <p className="text-[13px] text-[#aaa] mt-1.5">
                Monitor all client ↔ freelancer message threads
              </p>
            </div>
            {/* Count badge */}
            {!isLoading && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#f0f0f0] rounded-2xl self-start sm:self-auto">
                <HiOutlineChatAlt2 className="text-orange-500 text-[18px]" />
                <span className="text-[13px] font-extrabold text-[#111]">
                  {conversations.length}
                </span>
                <span className="text-[12px] text-[#aaa]">
                  thread{conversations.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="flex items-center gap-3 border-2 border-[#f0f0f0] focus-within:border-orange-300 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.06)] rounded-xl px-4 py-3 mb-8 transition-all bg-white">
          <HiOutlineSearch className="text-[#ccc] text-[17px] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by client or freelancer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-[13.5px] text-[#111] placeholder:text-[#ccc]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#ccc] hover:text-orange-500 text-[12px] transition-colors flex-shrink-0">
              Clear
            </button>
          )}
        </div>

        {/* ── States ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 border border-red-100 bg-red-50/50 rounded-2xl">
            <p className="text-[14px] font-semibold text-red-400">Failed to load conversations</p>
            <p className="text-[12px] text-red-300 mt-1">Please refresh or check your connection.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#ebebeb] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <TbMessages className="text-orange-500 text-[26px]" />
            </div>
            <p className="text-[14px] font-bold text-[#333]">
              {search ? `No results for "${search}"` : "No conversations yet"}
            </p>
            <p className="text-[12.5px] text-[#bbb] mt-1">
              {search ? "Try a different name." : "Conversations will appear here once users start messaging."}
            </p>
          </div>
        ) : (
          <>
            {/* ── Column header ── */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_40px] gap-4 px-4 py-2.5 mb-2 border-b border-[#f5f5f5]">
              {["Participants", "Client", "Freelancer", ""].map((h, i) => (
                <span key={i} className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase">{h}</span>
              ))}
            </div>

            {/* ── List ── */}
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map((conv, index) => {
                  const [client, provider] = conv.participants;
                  return (
                    <motion.div
                      key={conv._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      onClick={() => router.push(`/admin/messages/${conv._id}`)}
                      className="group grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_40px] items-center gap-4 p-4 bg-white border border-[#f0f0f0] hover:border-orange-200 hover:bg-[#fffaf7] rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-[1px]"
                    >
                      {/* Participants — avatar pair + last message */}
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarPair client={client} provider={provider} />
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#333] truncate">
                            {client.username} & {provider.username}
                          </p>
                          <p className="text-[11.5px] text-[#aaa] truncate mt-0.5">
                            {getLastMessage(conv.lastMessage)}
                          </p>
                        </div>
                      </div>

                      {/* Client */}
                      <div className="hidden sm:flex items-center gap-2.5 min-w-0">
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#f0f0f0] flex-shrink-0">
                          <Image src={client.img?.trim() || FALLBACK} alt={client.username} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-[#333] truncate">{client.username}</p>
                          <span className="text-[10px] font-bold text-[#aaa] bg-[#f5f5f5] px-1.5 py-0.5 rounded-md">Client</span>
                        </div>
                      </div>

                      {/* Freelancer */}
                      <div className="hidden sm:flex items-center gap-2.5 min-w-0">
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#f0f0f0] flex-shrink-0">
                          <Image src={provider.img?.trim() || FALLBACK} alt={provider.username} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-[#333] truncate">{provider.username}</p>
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md">Freelancer</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden sm:flex justify-end">
                        <div className="w-7 h-7 rounded-lg border border-[#f0f0f0] group-hover:border-orange-200 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-200">
                          <IoChevronForward className="text-[#ccc] group-hover:text-white text-[13px] transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ── Footer count ── */}
            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl">
              <span className="text-[11.5px] text-[#aaa]">
                {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
                {search && ` matching "${search}"`}
              </span>
              {search && (
                <button onClick={() => setSearch("")} className="text-[11.5px] font-semibold text-orange-500 hover:underline">
                  Clear search
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
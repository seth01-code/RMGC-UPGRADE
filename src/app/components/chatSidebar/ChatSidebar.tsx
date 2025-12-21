"use client";

import React, { useEffect, useState, useRef } from "react";
import newRequest from "../../utils/newRequest";
import { io, Socket } from "socket.io-client";
import {
  FaArrowLeft,
  FaTimes,
  FaCamera,
  FaFile,
  FaMicrophone,
  FaVideo,
  FaRedo,
} from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Participant {
  _id: string;
  username: string;
  img?: string;
}

interface LastMessage {
  text?: string;
  mediaType?: "image" | "video" | "audio" | "document" | string;
}

interface Conversation {
  _id: string;
  otherParticipant: Participant;
  lastMessage?: LastMessage;
}

interface ChatSidebarProps {
  userId: string;
  selectConversation: (conv: Conversation) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  userId,
  selectConversation,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await newRequest.get(`/conversations/${userId}`);
      setConversations(data);
    } catch (err: any) {
      console.error("Error fetching conversations:", err);
      if (err.response) {
        setError(`Server Error: ${err.response.status}`);
      } else if (err.request) {
        setError("No response from server. Check your connection.");
      } else {
        setError("Failed to fetch conversations.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.current = io("https://api.renewedmindsglobalconsult.com/api");
    fetchConversations();

    socket.current.on("messageSeen", (seenMessage: any) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === seenMessage.conversationId
            ? { ...conv, lastMessage: seenMessage }
            : conv
        )
      );
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [userId]);

  const renderLastMessage = (lastMessage?: LastMessage) => {
    if (!lastMessage) return "No messages yet";

    switch (lastMessage.mediaType) {
      case "image":
        return (
          <span className="flex items-center gap-2 text-gray-400">
            <FaCamera className="text-blue-400" /> Photo
          </span>
        );
      case "video":
        return (
          <span className="flex items-center gap-2 text-gray-400">
            <FaVideo className="text-green-400" /> Video
          </span>
        );
      case "audio":
        return (
          <span className="flex items-center gap-2 text-gray-400">
            <FaMicrophone className="text-purple-400" /> Voice
          </span>
        );
      case "document":
        return (
          <span className="flex items-center gap-2 text-gray-400">
            <FaFile className="text-red-400" /> Document
          </span>
        );
      default:
        return lastMessage.text || "No messages yet";
    }
  };

  const router = useRouter();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-20 bg-gray-900 border-r border-gray-700
        transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? "w-3/12 sm:w-1/5 lg:w-1/4" : "w-0 sm:w-1/5 lg:w-1/6"}
        ${isSidebarOpen ? "block" : "hidden sm:block"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <button
          onClick={toggleSidebar}
          className="sm:hidden text-white text-2xl hover:text-gray-400 transition"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-bold text-white truncate">Chats</h2>
        <button
          onClick={() => router.back()}
          className="hidden sm:flex items-center gap-2 text-white text-lg hover:text-gray-400 transition"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Conversations */}
      <div className="overflow-y-auto h-[calc(100vh-64px)] p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {loading ? (
          <p className="text-gray-400 text-center mt-4">
            Loading conversations...
          </p>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 mt-4">
            <p>{error}</p>
            <button
              onClick={fetchConversations}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded transition"
            >
              <FaRedo /> Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">
            No conversations found
          </p>
        ) : (
          conversations.map((conv) => {
            const other = conv.otherParticipant || {};
            return (
              <div
                key={conv._id}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition cursor-pointer shadow-sm"
                onClick={() => selectConversation(conv)}
              >
                <div className="relative w-12 h-12 rounded-full ring-2 ring-orange-400 overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      other.img ||
                      "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                    }
                    alt={other.username}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate whitespace-nowrap">
                    {other.username}
                  </p>
                  <p className="text-gray-300 text-sm truncate whitespace-nowrap">
                    {renderLastMessage(conv.lastMessage)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;

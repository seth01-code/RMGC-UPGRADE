"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import newRequest from "../../../utils/newRequest";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileAlt,
} from "react-icons/fa";
import AudioMessagePlayer from "../components/AudioMessagePlayer";
import ChatImage from "../components/ChatImage";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ... User, Message, Conversation interfaces remain the same

interface User {
  _id: string;
  username: string;
  img?: string;
}

interface Message {
  _id: string;
  senderId: User;
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


const MessageDetail: React.FC = () => {
  const { id } = useParams();
  const router = useRouter(); // <-- add router

  // Fetch conversation
  const {
    data: conversationData,
    isLoading: convoLoading,
    error: convoError,
  } = useQuery<Conversation>({
    queryKey: ["conversation", id],
    queryFn: async () =>
      (await newRequest.get(`/conversations/single/${id}`)).data,
    enabled: !!id,
  });

  // Fetch messages
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery<Message[]>({
    queryKey: ["messages", id],
    queryFn: async () => (await newRequest.get(`/messages/${id}`)).data,
    enabled: !!id,
  });

  // Loading skeleton
  if (convoLoading || messagesLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton height={40} width="50%" />
        <div className="flex gap-4">
          <Skeleton circle height={48} width={48} />
          <Skeleton circle height={48} width={48} />
        </div>
        <Skeleton count={5} height={80} />
      </div>
    );
  }

  // Error UI
  if (convoError || messagesError) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-600 text-lg font-semibold">
          Oops! Failed to load conversation.
        </p>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return <p className="text-center text-gray-500 mt-6">No messages found.</p>;
  }

  const sender = conversationData?.participants?.[0];
  const receiver = conversationData?.participants?.[1];

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    const icons: Record<string, React.ReactNode> = {
      pdf: <FaFilePdf className="text-red-700 text-xl" />,
      doc: <FaFileWord className="text-blue-900 text-xl" />,
      docx: <FaFileWord className="text-blue-900 text-xl" />,
      xls: <FaFileExcel className="text-green-600 text-xl" />,
      xlsx: <FaFileExcel className="text-green-600 text-xl" />,
      ppt: <FaFilePowerpoint className="text-orange-600 text-xl" />,
      pptx: <FaFilePowerpoint className="text-orange-600 text-xl" />,
      txt: <FaFileAlt className="text-gray-500 text-xl" />,
    };
    return icons[extension] || <FaFileAlt className="text-gray-500 text-xl" />;
  };

  const getFileName = (url: string) => url.split("/").pop();

  return (
    <div className="p-4 sm:p-6 mx-auto bg-white rounded-2xl shadow-lg h-[85vh] flex flex-col w-full max-w-3xl">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <FaArrowLeft className="text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 border-b pb-3 text-center flex-1">
          Conversation
        </h1>
      </div>

      {/* Participants */}
      <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm gap-4 mt-2">
        {/* Receiver */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 shadow-sm">
            <Image
              src={
                receiver?.img ||
                "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
              }
              alt={receiver?.username || "Receiver"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-gray-500">Service Provider</p>
            <p className="font-semibold text-gray-800 truncate">
              {receiver?.username}
            </p>
          </div>
        </div>

        {/* Sender */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 shadow-sm">
            <Image
              src={
                sender?.img ||
                "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
              }
              alt={sender?.username || "Sender"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-blue-500">Client</p>
            <p className="font-semibold text-gray-800 truncate">
              {sender?.username}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 mt-4 space-y-4">
        {messages.map((msg) => {
          const isSender = msg.senderId._id === sender?._id;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-3 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar */}
              {!isSender && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={
                      receiver?.img ||
                      "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                    }
                    alt="Receiver"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Message content */}
              <div className={`flex flex-col max-w-[80%] space-y-2`}>
                {msg.text && (
                  <div
                    className={`p-3 text-sm rounded-lg shadow-md ${
                      isSender
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {msg.media?.match(
                  /\.(jpeg|jpg|png|gif|webp|svg|bmp|tiff|tif|ico|heic|heif|avif)$/
                ) && <ChatImage message={msg} />}

                {msg.media?.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/) && (
                  <CustomVideoPlayer
                    src={msg.media}
                    fileExtension={msg.media.split(".").pop()}
                  />
                )}

                {msg.media?.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/) && (
                  <AudioMessagePlayer
                    src={msg.media}
                    fileExtension={msg.media.split(".").pop()}
                    isSender={isSender}
                  />
                )}

                {msg.media && (
                  <div
                    className={`p-3 flex items-center gap-2 shadow-md rounded-lg ${
                      isSender
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {getFileIcon(msg.media)}
                    <a
                      href={msg.media}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate underline"
                    >
                      {getFileName(msg.media)}
                    </a>
                  </div>
                )}

                <p
                  className={`text-xs text-gray-400 mt-1 ${
                    isSender ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {isSender && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={
                                            sender?.img ||
                      "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                    }
                    alt="Sender"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageDetail;


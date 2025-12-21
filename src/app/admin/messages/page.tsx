"use client";

import React, { JSX, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaChevronRight,
  FaMicrophone,
  FaFileAlt,
  FaCamera,
  FaVideo,
  FaPaperclip,
} from "react-icons/fa";
import SellerNavbar from "@/app/seller/components/navbar";
import Footer from "@/app/components/footer";

interface User {
  _id: string;
  username: string;
  img?: string;
}

interface Message {
  text?: string;
  mediaType?: "audio" | "document" | "image" | "video" | "file";
}

interface Conversation {
  _id: string;
  participants: [User, User];
  lastMessage?: Message;
}

const AdminMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const router = useRouter();

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await newRequest.get("/conversations");
      return res.data;
    },
  });

  const getLastMessageDisplay = (message?: Message | null) => {
    if (!message) return "No messages yet";

    const { mediaType, text } = message;

    const mediaIcons: Record<string, JSX.Element> = {
      audio: (
        <>
          <FaMicrophone className="inline text-blue-500 mr-1" />
          Voice
        </>
      ),
      document: (
        <>
          <FaFileAlt className="inline text-green-500 mr-1" />
          Document
        </>
      ),
      image: (
        <>
          <FaCamera className="inline text-purple-500 mr-1" />
          Photo
        </>
      ),
      video: (
        <>
          <FaVideo className="inline text-red-500 mr-1" />
          Video
        </>
      ),
      file: (
        <>
          <FaPaperclip className="inline text-gray-500 mr-1" />
          File
        </>
      ),
    };

    return mediaType
      ? mediaIcons[mediaType] || text || "No messages yet"
      : text || "No messages yet";
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Client & Service Provider Conversations
        </h1>
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col justify-between bg-gray-100 p-4 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Failed to load conversations
          </h2>
          <p className="text-sm">
            Please try refreshing the page or check your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SellerNavbar />
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Client & Service Provider Conversations
        </h1>

        <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl overflow-hidden p-4 md:p-6">
          {conversations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {conversations.map((conv) => {
                const [client, provider] = conv.participants;
                const lastMessage = getLastMessageDisplay(conv.lastMessage);

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv._id);
                      router.push(`/admin/messages/${conv._id}`);
                    }}
                    className="flex flex-col justify-between bg-gray-50 p-4 rounded-2xl cursor-pointer hover:bg-orange-50 hover:shadow-lg transition duration-300 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                          <Image
                            src={
                              client.img ||
                              "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                            }
                            alt={client.username}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {client.username}
                          </p>
                          <p className="text-sm text-gray-500">Client</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300 shadow-sm">
                          <Image
                            src={
                              provider.img ||
                              "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                            }
                            alt={provider.username}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {provider.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            Service Provider
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm truncate max-w-[70%]">
                        {lastMessage}
                      </p>
                      <FaChevronRight className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">
              No conversations yet.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminMessages;

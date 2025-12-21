"use client";

import React, { useState } from "react";
import ChatSidebar from "../chatSidebar/ChatSidebar";
import ChatWindow from "../chatWindow/ChatWindow";

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          bg-gray-800 shadow-lg transition-all duration-300
          ${isSidebarOpen ? "w-full md:w-1/4 lg:w-1/4" : "w-0"}
          md:min-w-[250px] lg:min-w-[300px]
          overflow-hidden
        `}
      >
        <ChatSidebar
          userId={userId}
          selectConversation={setSelectedConversation}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-gray-900">
        {/* Top bar for small screens */}
        <div className="flex items-center justify-between bg-gray-800 p-3 shadow-md lg:hidden">
          <button
            onClick={toggleSidebar}
            className="text-orange-500 hover:text-orange-400 transition text-xl"
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
          <h1 className="text-lg font-semibold">Chats</h1>
        </div>

        {/* Chat content */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatWindow
              userId={userId}
              conversation={selectedConversation}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-gray-400 text-center">
              <p className="text-2xl font-semibold mb-2">
                No conversation selected
              </p>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;

"use client";

import React, { useState } from "react";
import ChatSidebar from "../chatSidebar/ChatSidebar";
import ChatWindow from "../chatWindow/ChatWindow";
import { FaCommentDots } from "react-icons/fa";

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    // On mobile, close sidebar when a conversation is selected
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0F0F0F",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar column */}
      <div
        style={{
          width: isSidebarOpen ? "320px" : "0px",
          minWidth: isSidebarOpen ? "280px" : "0px",
          maxWidth: "360px",
          flexShrink: 0,
          transition: "width 0.3s ease, min-width 0.3s ease",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        <ChatSidebar
          userId={userId}
          selectConversation={handleSelectConversation}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          selectedId={selectedConversation?._id}
        />
      </div>

      {/* Main area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#141414",
            borderBottom: "1px solid #1F1F1F",
          }}
          className="mobile-topbar"
        >
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "#FF6B1A",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#FFFFFF" }}>
            {selectedConversation?.otherParticipant?.username || "Chats"}
          </h1>
          <div style={{ width: "28px" }} />
        </div>

        {/* Chat or empty state */}
        {selectedConversation ? (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <ChatWindow
              userId={userId}
              conversation={selectedConversation}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              color: "#374151",
              padding: "40px",
            }}
          >
            {/* Decorative ring */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#141414",
                border: "2px solid #1F1F1F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B1A18, #FF6B1A08)",
                  border: "1.5px solid #FF6B1A30",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaCommentDots size={22} color="#FF6B1A" style={{ opacity: 0.7 }} />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#4B5563" }}>
                No conversation open
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                Pick a chat from the sidebar to get started
              </p>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .mobile-topbar {
          display: none;
        }
        @media (max-width: 767px) {
          .mobile-topbar {
            display: flex !important;
          }
        }
        @media (min-width: 768px) {
          .mobile-topbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
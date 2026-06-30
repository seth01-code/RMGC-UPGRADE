/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import ChatSidebar from "../chatSidebar/ChatSidebar";
import ChatWindow from "../chatWindow/ChatWindow";
import { FaCommentDots } from "react-icons/fa";

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ── Track viewport so we know whether sidebar should behave as a
  // persistent column (desktop) or a slide-in drawer (mobile) ──────────────
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");

    const applyState = (mobile: boolean) => {
      setIsMobile(mobile);
      // On mobile, default to a closed drawer. On desktop, default open.
      setIsSidebarOpen(!mobile);
    };

    applyState(mql.matches);

    const handler = (e: MediaQueryListEvent) => applyState(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv);
    // On mobile, close the drawer once a conversation is picked
    if (isMobile) setIsSidebarOpen(false);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "100vh",
        background: "#0F0F0F",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Backdrop (mobile only, shown when drawer is open) ── */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 30,
          }}
        />
      )}

      {/* ── Sidebar column ── */}
      <div
        className="chat-sidebar-panel"
        style={
          isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "85vw",
                maxWidth: "340px",
                zIndex: 40,
                transform: isSidebarOpen
                  ? "translateX(0)"
                  : "translateX(-100%)",
                transition: "transform 0.25s ease",
                boxShadow: isSidebarOpen
                  ? "4px 0 24px rgba(0,0,0,0.5)"
                  : "none",
              }
            : {
                position: "relative",
                width: isSidebarOpen ? "320px" : "0px",
                minWidth: isSidebarOpen ? "280px" : "0px",
                maxWidth: "360px",
                flexShrink: 0,
                transition: "width 0.25s ease, min-width 0.25s ease",
                overflow: "hidden",
              }
        }
      >
        <ChatSidebar
          userId={userId}
          selectConversation={handleSelectConversation}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          selectedId={selectedConversation?._id}
        />
      </div>

      {/* ── Main area ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Chat or empty state */}
        {selectedConversation ? (
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              padding: "40px 24px",
              textAlign: "center",
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
                <FaCommentDots
                  size={22}
                  color="#FF6B1A"
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#4B5563",
                }}
              >
                No conversation open
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                {isMobile
                  ? "Tap ☰ to pick a chat from the list"
                  : "Pick a chat from the sidebar to get started"}
              </p>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  style={{
                    marginTop: "16px",
                    background: "#FF6B1A",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Open conversations
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;

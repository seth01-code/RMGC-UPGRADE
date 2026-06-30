/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  FaCommentDots,
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
  selectedId?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  userId,
  selectConversation,
  toggleSidebar,
  selectedId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const socket = useRef<Socket | null>(null);
  const router = useRouter();

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await newRequest.get(`/conversations/${userId}`);
      setConversations(data);
    } catch (err: any) {
      if (err.response) setError(`Server Error: ${err.response.status}`);
      else if (err.request) setError("No response from server. Check your connection.");
      else setError("Failed to fetch conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.current = io("http://localhost:4000/api");
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
    return () => { socket.current?.disconnect(); };
  }, [userId]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const renderLastMessage = (lastMessage?: LastMessage) => {
    if (!lastMessage) return <span style={{ color: "#4B5563" }}>No messages yet</span>;
    const iconStyle = { flexShrink: 0 as const };
    switch (lastMessage.mediaType) {
      case "image":   return <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}><FaCamera size={11} color="#FF8C47" style={iconStyle} /> Photo</span>;
      case "video":   return <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}><FaVideo size={11} color="#22C55E" style={iconStyle} /> Video</span>;
      case "audio":   return <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}><FaMicrophone size={11} color="#A78BFA" style={iconStyle} /> Voice</span>;
      case "document":return <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}><FaFile size={11} color="#60A5FA" style={iconStyle} /> Document</span>;
      default:        return <span style={{ color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{lastMessage.text || "No messages yet"}</span>;
    }
  };

  const filtered = conversations.filter((c) =>
    (c.otherParticipant?.username ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#111111",
        borderRight: "1px solid #1F1F1F",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px 12px",
          background: "#141414",
          borderBottom: "1px solid #1F1F1F",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B1A, #E85D0A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FaCommentDots color="#fff" size={14} />
            </div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.01em" }}>
              Messages
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => router.back()}
              className="sidebar-back-btn"
              style={{
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                padding: "5px 8px",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = "#FF6B1A"; b.style.background = "#FF6B1A12"; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "#6B7280"; b.style.background = "none"; }}
            >
              <FaArrowLeft size={11} /> <span className="sidebar-back-label">Back</span>
            </button>
            {/* Close button: always usable, but most useful as the drawer-close on mobile */}
            <button
              onClick={toggleSidebar}
              style={{
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                padding: "5px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s",
              }}
              className="sidebar-close-btn"
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#FF6B1A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#6B7280")}
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              paddingLeft: "12px",
              borderRadius: "10px",
              background: "#1E1E1E",
              border: "1.5px solid #2A2A2A",
              color: "#E5E7EB",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B1A")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
          />
        </div>
      </div>

      {/* List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          scrollbarWidth: "thin",
          scrollbarColor: "#2A2A2A #111111",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px",
                marginBottom: "4px",
                borderRadius: "12px",
                background: "#181818",
              }}
            >
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#242424", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ height: "13px", borderRadius: "6px", background: "#242424", width: "60%", marginBottom: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: "11px", borderRadius: "6px", background: "#1E1E1E", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))
        ) : error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "32px 16px", color: "#6B7280", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
            <button
              onClick={fetchConversations}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#FF6B1A",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#E85D0A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FF6B1A")}
            >
              <FaRedo size={11} /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "40px 16px", color: "#4B5563" }}>
            <FaCommentDots size={28} />
            <p style={{ margin: 0, fontSize: "13px" }}>{search ? "No results found" : "No conversations yet"}</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const other = conv.otherParticipant ?? { _id: "", username: "Unknown" };
            const isSelected = conv._id === selectedId;
            return (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  marginBottom: "2px",
                  borderRadius: "12px",
                  background: isSelected ? "#FF6B1A18" : "transparent",
                  border: isSelected ? "1px solid #FF6B1A30" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#1A1A1A";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {other.img ? (
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${isSelected ? "#FF6B1A" : "#2A2A2A"}`, transition: "border-color 0.15s" }}>
                      <Image
                        src={other.img}
                        alt={other.username}
                        width={44}
                        height={44}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: isSelected
                          ? "linear-gradient(135deg, #FF6B1A, #E85D0A)"
                          : "linear-gradient(135deg, #2A2A2A, #1E1E1E)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: isSelected ? "#fff" : "#6B7280",
                        border: `2px solid ${isSelected ? "#FF6B1A" : "#2A2A2A"}`,
                        transition: "all 0.15s",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(other.username || "?")}
                    </div>
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? "#FF8C47" : "#E5E7EB",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "color 0.15s",
                    }}
                  >
                    {other.username}
                  </p>
                  <div style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    {renderLastMessage(conv.lastMessage)}
                  </div>
                </div>

                {/* Active indicator */}
                {isSelected && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#FF6B1A",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        /* On mobile (drawer mode) the X close button is the primary way
           to dismiss the sidebar, and there's no room for a separate
           "Back" text label — collapse it to icon-only. The router-back
           button stays available everywhere since it serves a different
           purpose (leaving the chat feature entirely). */
        @media (max-width: 480px) {
          .sidebar-back-label { display: none; }
          .sidebar-back-btn { padding: 5px !important; }
        }
        @media (min-width: 768px) {
          .sidebar-close-btn { display: none !important; }
        }
      `}</style>
    </aside>
  );
};

export default ChatSidebar;
"use client";

import React, { useEffect, useState } from "react";
import ChatPage from "../components/ChatPage/ChatPage";
import { FaCommentDots } from "react-icons/fa";

const ChatWrapper = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem("currentUser");
      if (user) {
        const parsed = JSON.parse(user);
        setUserId(parsed.id || parsed._id || null);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error parsing currentUser:", err);
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0F0F0F",
          gap: "16px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#FF6B1A18",
            border: "1.5px solid #FF6B1A40",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaCommentDots size={24} color="#FF6B1A" />
        </div>
        <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>
          Session expired. Please log in again.
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0F0F0F",
          gap: "20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Animated orange spinner */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "3px solid #1F1F1F",
            borderTop: "3px solid #FF6B1A",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#4B5563", margin: 0, fontSize: "13px" }}>
          Loading your session…
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <ChatPage userId={userId} />;
};

export default ChatWrapper;
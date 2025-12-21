"use client";

import React, { useEffect, useState } from "react";
import ChatPage from "../components/ChatPage/ChatPage";

const ChatWrapper = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        console.log("parsed user id:", parsed.id); // debug
        setUserId(parsed.id); // <-- use `id` instead of `_id`
      } catch (err) {
        console.error("Error parsing currentUser:", err);
      }
    } else {
      console.log("No currentUser found in localStorage");
    }
  }, []);

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading user...
      </div>
    );
  }

  return <ChatPage userId={userId} />;
};

export default ChatWrapper;

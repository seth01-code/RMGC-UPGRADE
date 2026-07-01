"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useCallManager } from "./chatWindow/useCallManager";
import CallModal, { CallType } from "./chatWindow/CallModal";

const SOCKET_URL = "https://api.renewedmindsglobalconsult.com/api";

interface CurrentUser {
  id: string;
  username: string;
  avatar?: string;
}

interface CallContextValue {
  socket: Socket | null;
  userId: string | null;
  currentUsername: string;
  isUserOnline: (id: string) => boolean;
  initiateCall: (
    remoteUserId: string,
    remoteUsername: string,
    type: CallType,
    remoteAvatar?: string,
  ) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return ctx;
}

export default function CallProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ── Resolve the logged-in user the same way ChatWrapper does ──────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const id = parsed.id || parsed._id || null;
      const username = parsed.username || parsed.name || "";
      const avatar = parsed.img || parsed.avatar || parsed.profilePicture || "";
      if (id) setCurrentUser({ id, username, avatar });
    } catch (err) {
      console.error("CallProvider: failed to read currentUser", err);
    }
  }, []);

  // ── Own the single, app-wide socket connection ─────────────────────────────
  // One connection per browser tab, alive for as long as the user is logged
  // in, regardless of route — this is what lets the receiver's online status
  // (and incoming calls) be known immediately, even before any chat is opened.
  useEffect(() => {
    if (!currentUser?.id) return;

    const s = io(SOCKET_URL);
    socketRef.current = s;
    setSocket(s);

    s.emit("join", currentUser.id);

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [currentUser?.id]);

  // ── Global online-presence tracking ────────────────────────────────────────
  // Lives here (not inside ChatWindow) so the snapshot is already correct by
  // the time any chat window mounts, instead of waiting for a fresh "join"
  // event that may never come again this session.
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const handleOnlineStatus = ({
      userId: id,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(id);
        else next.delete(id);
        return next;
      });
    };

    const handleUpdateOnlineUsers = (ids: string[]) => {
      setOnlineUserIds(new Set(ids));
    };

    socket.on("onlineStatus", handleOnlineStatus);
    socket.on("updateOnlineUsers", handleUpdateOnlineUsers);

    return () => {
      socket.off("onlineStatus", handleOnlineStatus);
      socket.off("updateOnlineUsers", handleUpdateOnlineUsers);
    };
  }, [socket]);

  const isUserOnline = (id: string) => onlineUserIds.has(id);

  const { callState, initiateCall, acceptCall, endCall } = useCallManager(
    socket,
    currentUser?.id || "",
  );

  return (
    <CallContext.Provider
      value={{
        socket,
        userId: currentUser?.id || null,
        currentUsername: currentUser?.username || "",
        isUserOnline,
        initiateCall,
        endCall,
      }}
    >
      {children}

      {/* Renders above whatever page is currently mounted — chat, dashboard, anything */}
      {callState && socket && currentUser && (
        <CallModal
          callState={callState}
          userId={currentUser.id}
          currentUsername={currentUser.username}
          currentUserAvatar={currentUser.avatar}
          socket={socket}
          onEndCall={endCall}
          onAccept={acceptCall}
        />
      )}
    </CallContext.Provider>
  );
}

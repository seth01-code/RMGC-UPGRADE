import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { CallState, CallType } from "./CallModal";

const CALL_TIMEOUT_MS = 30_000; // 30 s before auto-cancel

export function useCallManager(socket: Socket | null, userId: string) {
  const [callState, setCallState] = useState<CallState | null>(null);
  const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Helper: clear the ring/call timeout ───────────────────────────────────
  const clearCallTimeout = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  };

  // ── Incoming offer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleIncomingOffer = ({
      from,
      fromUsername,
      callType,
      sdp,
      remoteAvatar,
    }: {
      from: string;
      fromUsername: string;
      callType: CallType;
      sdp: RTCSessionDescriptionInit;
      remoteAvatar?: string;
    }) => {
      pendingOffer.current = sdp;
      setCallState({
        status: "incoming",
        type: callType,
        remoteUserId: from,
        remoteUsername: fromUsername || "",
        remoteAvatar,
      });
    };

    // Receiver is online — flip caller UI to "ringing"
    const handleRinging = () => {
      setCallState((prev) =>
        prev && prev.status === "calling"
          ? { ...prev, status: "ringing" }
          : prev
      );
    };

    // No answer within timeout — server tells caller it was missed
    const handleMissed = () => {
      clearCallTimeout();
      setCallState((prev) =>
        prev ? { ...prev, status: "missed" } : prev
      );
      // Show missed state briefly then close modal
      setTimeout(() => setCallState(null), 2500);
    };

    const handleCallEnd = () => {
      clearCallTimeout();
      pendingOffer.current = null;
      setCallState(null);
    };

    socket.on("call:offer", handleIncomingOffer);
    socket.on("call:ringing", handleRinging);
    socket.on("call:missed", handleMissed);
    socket.on("call:end", handleCallEnd);

    return () => {
      socket.off("call:offer", handleIncomingOffer);
      socket.off("call:ringing", handleRinging);
      socket.off("call:missed", handleMissed);
      socket.off("call:end", handleCallEnd);
    };
  }, [socket]);

  // ── When caller receives answer, flip to active ───────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleAnswer = () => {
      clearCallTimeout();
      setCallState((prev) =>
        prev && (prev.status === "calling" || prev.status === "ringing")
          ? { ...prev, status: "active" }
          : prev
      );
    };

    socket.on("call:answer", handleAnswer);
    return () => {
      socket.off("call:answer", handleAnswer);
    };
  }, [socket]);

  // ── Accept ────────────────────────────────────────────────────────────────
  const acceptCall = useCallback((): RTCSessionDescriptionInit | null => {
    clearCallTimeout();
    const offer = pendingOffer.current;
    pendingOffer.current = null;
    setCallState((prev) => (prev ? { ...prev, status: "active" } : prev));
    return offer;
  }, []);

  // ── Initiate — start timeout immediately ──────────────────────────────────
  const initiateCall = useCallback(
    (
      remoteUserId: string,
      remoteUsername: string,
      type: CallType,
      remoteAvatar?: string
    ) => {
      clearCallTimeout();
      setCallState({
        status: "calling",
        type,
        remoteUserId,
        remoteUsername,
        remoteAvatar,
      });

      // Auto-cancel if no answer after CALL_TIMEOUT_MS
      callTimeoutRef.current = setTimeout(() => {
        if (socket) {
          socket.emit("call:timeout", {
            to: remoteUserId,
            from: userId,
            callType: type,
          });
        }
        setCallState((prev) =>
          prev ? { ...prev, status: "missed" } : prev
        );
        setTimeout(() => setCallState(null), 2500);
      }, CALL_TIMEOUT_MS);
    },
    [socket, userId]
  );

  // ── End / decline ─────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    clearCallTimeout();
    pendingOffer.current = null;
    setCallState(null);
  }, []);

  return { callState, initiateCall, acceptCall, endCall };
}
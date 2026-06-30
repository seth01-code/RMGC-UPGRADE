/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaPhone,
} from "react-icons/fa";
import { Socket } from "socket.io-client";

// ─── Premium ring tones via Web Audio API ─────────────────────────────────────
// Two distinct tones, like WhatsApp:
//  - "caller"  → ringback tone heard by the person who placed the call
//                (classic telephone beep-beep… pause… cadence)
//  - "callee"  → incoming-call tone heard by the person being called
//                (gentle melodic arpeggio, more attention-grabbing)

type RingMode = "caller" | "callee" | null;

function useRingTone(mode: RingMode) {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, []);

  // Outgoing call ringback — two short beeps then a pause, like a
  // standard telephone ringback tone. Cycle length ~3.5s.
  const playCallerRingback = useCallback(() => {
    try {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const beepStarts = [0, 0.45]; // two beeps close together
      const beepDuration = 0.35;

      beepStarts.forEach((offset) => {
        const start = ctx.currentTime + offset;
        const end = start + beepDuration;

        [440, 480].forEach((freq, hi) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = "sine";
          osc.frequency.value = freq;

          const vol = hi === 0 ? 0.18 : 0.12;

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(vol, start + 0.02);
          gain.gain.setValueAtTime(vol, end - 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, end);

          osc.start(start);
          osc.stop(end + 0.05);
        });
      });
    } catch (_) {}
  }, []);

  // Incoming call tone — gentle ascending arpeggio (D major: D4, F#4, A4, D5)
  // followed by a resolving chord. Cycle length ~3s.
  const playCalleeTone = useCallback(() => {
    try {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const notes = [293.66, 369.99, 440.0, 587.33];
      const noteDuration = 0.12;
      const noteGap = 0.04;

      notes.forEach((freq, i) => {
        const start = ctx.currentTime + i * (noteDuration + noteGap);
        const end = start + noteDuration;

        [1, 2].forEach((harmonic, hi) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = "sine";
          osc.frequency.value = freq * harmonic;

          const vol = hi === 0 ? 0.22 : 0.06;

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(vol, start + 0.03);
          gain.gain.setValueAtTime(vol, end - 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, end);

          osc.start(start);
          osc.stop(end + 0.05);
        });
      });

      const resolveStart =
        ctx.currentTime + notes.length * (noteDuration + noteGap) + 0.05;
      [293.66, 440.0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, resolveStart);
        gain.gain.linearRampToValueAtTime(
          freq === 293.66 ? 0.18 : 0.1,
          resolveStart + 0.04,
        );
        gain.gain.exponentialRampToValueAtTime(0.001, resolveStart + 0.35);
        osc.start(resolveStart);
        osc.stop(resolveStart + 0.4);
      });
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!mode) {
      stopRing();
      return;
    }

    ctxRef.current = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    const play = mode === "caller" ? playCallerRingback : playCalleeTone;
    const cycleMs = mode === "caller" ? 3500 : 3000;

    play();
    intervalRef.current = setInterval(play, cycleMs);

    return () => stopRing();
  }, [mode, playCallerRingback, playCalleeTone, stopRing]);
}

export type CallType = "audio" | "video";
export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "incoming"
  | "active"
  | "ended"
  | "missed";

export interface CallState {
  status: CallStatus;
  type: CallType;
  remoteUserId: string;
  remoteUsername: string;
  remoteAvatar?: string;
}

interface CallModalProps {
  callState: CallState;
  userId: string;
  currentUsername: string; // ← the logged-in user's own username
  currentUserAvatar?: string; // ← the logged-in user's own avatar, sent to the other party when calling
  socket: Socket;
  onEndCall: () => void;
  onAccept: () => RTCSessionDescriptionInit | null;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CallModal: React.FC<CallModalProps> = ({
  callState,
  userId,
  currentUsername,
  currentUserAvatar,
  socket,
  onEndCall,
  onAccept,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteUserIdRef = useRef(callState.remoteUserId);
  useEffect(() => {
    remoteUserIdRef.current = callState.remoteUserId;
  }, [callState.remoteUserId]);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isVideo = callState.type === "video";

  // Caller hears a ringback tone while "calling" / "ringing".
  // Callee hears the melodic incoming-call tone while "incoming".
  const ringMode: RingMode =
    callState.status === "calling" || callState.status === "ringing"
      ? "caller"
      : callState.status === "incoming"
        ? "callee"
        : null;
  useRingTone(ringMode);
  const cleanup = useCallback(() => {
    localStream.current?.getTracks().forEach((t) => t.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
    localStream.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    if (callState.status === "active") {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState.status]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEndCallRef = useRef<() => void>(() => {});
  const handleEndCall = useCallback(() => {
    socket.emit("call:end", { to: remoteUserIdRef.current });
    cleanup();
    onEndCall();
  }, [cleanup, onEndCall, socket]);
  handleEndCallRef.current = handleEndCall;

  const buildPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("call:ice-candidate", {
          to: remoteUserIdRef.current,
          candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        handleEndCallRef.current();
      }
    };

    return pc;
  }, [socket]);

  const getMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo,
    });
    localStream.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, [isVideo]);

  // ── Caller: send offer ─────────────────────────────────────────────────────

  useEffect(() => {
    if (callState.status !== "calling") return;

    let cancelled = false;

    (async () => {
      try {
        const stream = await getMedia();
        if (cancelled) return;

        const pc = buildPC();
        peerConnection.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:offer", {
          to: callState.remoteUserId,
          from: userId,
          fromUsername: currentUsername, // ← prop, not window hack
          remoteAvatar: currentUserAvatar, // ← caller's own avatar (becomes "remote" from the receiver's side)
          callType: callState.type,
          sdp: offer,
        });
      } catch (err) {
        console.error("Error initiating call:", err);
        if (!cancelled) handleEndCall();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState.status]);

  // ── Callee: accept ─────────────────────────────────────────────────────────

  const handleAccept = useCallback(async () => {
    const offer = onAccept();
    if (!offer) return;

    try {
      const stream = await getMedia();
      const pc = buildPC();
      peerConnection.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", {
        to: remoteUserIdRef.current,
        sdp: answer,
      });

      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error("Error accepting call:", err);
      handleEndCall();
    }
  }, [buildPC, getMedia, handleEndCall, onAccept, socket]);

  // ── Socket listeners (caller side) ────────────────────────────────────────

  useEffect(() => {
    const handleAnswer = async ({
      sdp,
    }: {
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(sdp),
      );
    };

    const handleIceCandidate = async ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        await peerConnection.current?.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    };

    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);

    return () => {
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
    };
  }, [socket]);

  const toggleMute = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  };

  const toggleVideo = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsVideoOff((v) => !v);
  };

  const getInitials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const statusLabel = {
    calling: "Calling…",
    ringing: "Ringing…",
    incoming: "Incoming call…",
    active: formatDuration(callDuration),
    ended: "Call ended",
    missed: "No answer",
    idle: "",
  }[callState.status];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: isVideo ? "min(90vw, 840px)" : "360px",
          background: "#0F0F0F",
          borderRadius: "20px",
          border: "1px solid #2A2A2A",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isVideo && (
          <div
            style={{
              position: "relative",
              background: "#050505",
              aspectRatio: "16/9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: callState.status === "active" ? "block" : "none",
              }}
            />
            {callState.status !== "active" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {callState.remoteAvatar ? (
                  <img
                    src={callState.remoteAvatar}
                    alt={callState.remoteUsername}
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #FF6B1A",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#FF6B1A,#E85D0A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {getInitials(callState.remoteUsername)}
                  </div>
                )}
              </div>
            )}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                width: "120px",
                aspectRatio: "4/3",
                borderRadius: "10px",
                objectFit: "cover",
                border: "2px solid #FF6B1A",
                background: "#1A1A1A",
                display: isVideoOff ? "none" : "block",
              }}
            />
          </div>
        )}

        <div
          style={{
            padding: isVideo ? "16px 20px" : "36px 24px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            background: isVideo ? "#0F0F0F" : "transparent",
          }}
        >
          {!isVideo &&
            (callState.remoteAvatar ? (
              <img
                src={callState.remoteAvatar}
                alt={callState.remoteUsername}
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #FF6B1A",
                  marginBottom: "4px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#FF6B1A,#E85D0A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "4px",
                }}
              >
                {getInitials(callState.remoteUsername)}
              </div>
            ))}

          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "18px",
              color: "#FFF",
            }}
          >
            {callState.remoteUsername}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color:
                callState.status === "active"
                  ? "#FF6B1A"
                  : callState.status === "missed"
                    ? "#EF4444"
                    : "#9CA3AF",
            }}
          >
            {statusLabel}
          </p>

          {!isVideo && (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        {callState.status !== "missed" && (
          <div
            style={{
              padding: "16px 24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              background: "#0F0F0F",
            }}
          >
            <ControlBtn
              onClick={toggleMute}
              active={isMuted}
              label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </ControlBtn>

            {isVideo && (
              <ControlBtn
                onClick={toggleVideo}
                active={isVideoOff}
                label={isVideoOff ? "Cam on" : "Cam off"}
              >
                {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              </ControlBtn>
            )}

            {callState.status === "incoming" && (
              <button
                onClick={handleAccept}
                title="Accept"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#22C55E",
                  color: "#fff",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(34,197,94,0.45)",
                }}
              >
                <FaPhone />
              </button>
            )}

            <button
              onClick={handleEndCall}
              title={callState.status === "incoming" ? "Decline" : "End call"}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "none",
                background: "#EF4444",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(239,68,68,0.45)",
              }}
            >
              <FaPhoneSlash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ControlBtn: React.FC<{
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}> = ({ onClick, active, label, children }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: `1.5px solid ${active ? "#FF6B1A" : "#2A2A2A"}`,
      background: active ? "#FF6B1A22" : "#1A1A1A",
      color: active ? "#FF6B1A" : "#9CA3AF",
      fontSize: "18px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    }}
  >
    {children}
  </button>
);

export default CallModal;

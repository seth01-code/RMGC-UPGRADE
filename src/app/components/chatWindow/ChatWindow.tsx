/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import Image from "next/image";
import newRequest from "../../utils/newRequest";
import {
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaMicrophone,
  FaStop,
  FaBars,
  FaTimes,
  FaPhone,
  FaVideo,
} from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import upload from "../../utils/upload";
import WhatsAppAudioPlayer from "./WhatsAppAudioPlayer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import DocumentMessage from "./DocumentMessage";
import WhatsAppImage from "./WhatsAppImage";
import { toast } from "sonner";
import { useCall } from "../Callprovider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  _id: string;
  username: string;
  img?: string;
}

interface LastMessage {
  text?: string;
  media?: string;
  display_name?: string;
  senderId: { _id: string };
  mediaType?: "image" | "video" | "audio" | "document" | "missed_call" | string;
  callType?: "audio" | "video";
  createdAt?: string;
}

interface Conversation {
  _id: string;
  otherParticipant: Participant;
}

interface ChatWindowProps {
  userId: string;
  conversation: Conversation;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ChatWindow: React.FC<ChatWindowProps> = ({
  userId,
  conversation,
  toggleSidebar,
}) => {
  const [messages, setMessages] = useState<LastMessage[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ── Global socket + call controls (shared across the whole app) ───────────
  const { socket, initiateCall, isUserOnline } = useCall();

  // Online status now comes from CallProvider's app-wide presence tracking,
  // so it's correct the moment this chat window mounts — not just after a
  // fresh "join" event happens to fire while this listener exists.
  const isOnline = isUserOnline(conversation.otherParticipant._id);

  // ── Socket listeners (socket itself lives in CallProvider now) ────────────

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: LastMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket]);

  // ── Fetch messages ─────────────────────────────────────────────────────────

  useEffect(() => {
    setLoadingMessages(true);
    const fetchMessages = async () => {
      try {
        const { data } = await newRequest.get(`/messages/${conversation._id}`);
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [conversation._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Text / send helpers ────────────────────────────────────────────────────

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        128,
      )}px`;
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file && !audioBlob) {
      toast.error("Cannot send an empty message.");
      return;
    }
    let fileUrl = "";
    let audioUrlForMessage = "";
    try {
      if (file) {
        setLoadingFile(true);
        setUploadProgress(0);
        const uploadedFile = await upload(file, (progress: number) =>
          setUploadProgress(progress),
        );
        fileUrl = uploadedFile?.secure_url || uploadedFile?.url || "";
        if (!fileUrl) throw new Error("File upload failed");
      }
      if (audioBlob) {
        const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, {
          type: "audio/wav",
        });
        const uploadedAudio = await upload(audioFile, (progress: number) =>
          setUploadProgress(progress),
        );
        audioUrlForMessage =
          uploadedAudio?.secure_url || uploadedAudio?.url || "";
        if (!audioUrlForMessage) throw new Error("Audio upload failed");
      }
      if (!text.trim() && !fileUrl && !audioUrlForMessage) return;

      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("conversationId", conversation._id);
      if (text) formData.append("text", text);
      if (fileUrl) formData.append("media", fileUrl);
      if (audioUrlForMessage) formData.append("media", audioUrlForMessage);

      const { data } = await newRequest.post("/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const formattedMessage = { ...data, senderId: { _id: userId } };
      socket?.emit("sendMessage", formattedMessage);
      setMessages((prev) => [...prev, formattedMessage]);
      setText("");
      setFile(null);
      setAudioBlob(null);
      if (textareaRef.current) textareaRef.current.style.height = "40px";
    } catch (err) {
      toast.error((err as Error).message || "Failed to send message.");
    } finally {
      setLoadingFile(false);
      setUploadProgress(0);
    }
  };

  // ── Recording helpers ──────────────────────────────────────────────────────

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startRecording = async () => {
    setIsRecording(true);
    audioChunks.current = [];
    setRecordingDuration(0);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) =>
      audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/wav" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setIsRecording(false);
    };
    mediaRecorder.current.start();
    recordingInterval.current = window.setInterval(
      () => setRecordingDuration((prev) => prev + 1),
      1000,
    );
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    mediaRecorder.current.stop();
  };

  const onEmojiClick = (emojiData: EmojiClickData) =>
    setText((prev) => prev + emojiData.emoji);

  // ── Media preview renderer ─────────────────────────────────────────────────

  const renderMediaPreview = (message: LastMessage) => {
    if (!message.media) return null;
    const ext = message.media.split(".").pop()?.toLowerCase();
    if (!ext) return null;
    const isSender = message.senderId._id === userId;
    const fileName =
      message.display_name || message.media.split("/").pop() || "file";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <WhatsAppImage message={message as any} />;
    if (["mp4", "mov", "webm"].includes(ext))
      return <CustomVideoPlayer src={message.media} fileExtension={ext} />;
    if (["mp3", "wav", "ogg"].includes(ext))
      return (
        <WhatsAppAudioPlayer
          src={message.media}
          fileExtension={ext}
          isSender={isSender}
        />
      );
    if (
      ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"].includes(ext)
    )
      return (
        <DocumentMessage
          message={message as any}
          fileExtension={ext}
          fileName={fileName}
          isSender={isSender}
        />
      );
    return null;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="flex flex-col w-full h-full"
        style={{
          background: "#0F0F0F",
          color: "#FFFFFF",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div
          className="chat-header"
          style={{
            background: "#141414",
            borderBottom: "1px solid #1F1F1F",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
            minWidth: 0,
          }}
        >
          {/* Sidebar toggle (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="chat-sidebar-toggle"
            style={{
              background: "none",
              border: "none",
              color: "#FF6B1A",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px",
              flexShrink: 0,
            }}
            aria-label="Toggle conversation list"
          >
            <FaBars />
          </button>

          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {conversation.otherParticipant.img ? (
              <Image
                src={conversation.otherParticipant.img}
                alt={conversation.otherParticipant.username}
                width={44}
                height={44}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #FF6B1A",
                  width: "44px",
                  height: "44px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B1A, #FF8C47)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {getInitials(conversation.otherParticipant.username)}
              </div>
            )}
            <span
              style={{
                position: "absolute",
                bottom: "1px",
                right: "1px",
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                background: isOnline ? "#22C55E" : "#4B5563",
                border: "2px solid #141414",
                display: "block",
              }}
            />
          </div>

          {/* Name + status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {conversation.otherParticipant.username}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: isOnline ? "#22C55E" : "#6B7280",
                marginTop: "1px",
              }}
            >
              {isOnline ? "● Active now" : "Offline"}
            </p>
          </div>

          {/* ── Call buttons ── */}
          <div
            className="chat-call-buttons"
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {/* Audio call */}
            <button
              onClick={() =>
                initiateCall(
                  conversation.otherParticipant._id,
                  conversation.otherParticipant.username,
                  "audio",
                  conversation.otherParticipant.img,
                )
              }
              title="Audio call"
              style={{
                background: "none",
                border: "1.5px solid #2A2A2A",
                color: "#9CA3AF",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#FF6B1A";
                (e.currentTarget as HTMLButtonElement).style.color = "#FF6B1A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#2A2A2A";
                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              }}
            >
              <FaPhone />
            </button>

            {/* Video call */}
            <button
              onClick={() =>
                initiateCall(
                  conversation.otherParticipant._id,
                  conversation.otherParticipant.username,
                  "video",
                  conversation.otherParticipant.img,
                )
              }
              title="Video call"
              style={{
                background: "none",
                border: "1.5px solid #2A2A2A",
                color: "#9CA3AF",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#FF6B1A";
                (e.currentTarget as HTMLButtonElement).style.color = "#FF6B1A";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#2A2A2A";
                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              }}
            >
              <FaVideo />
            </button>
          </div>
        </div>

        {/* Upload progress bar */}
        {loadingFile && (
          <div
            style={{
              height: "3px",
              background: "#1A1A1A",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${uploadProgress}%`,
                background: "linear-gradient(90deg, #FF6B1A, #FF8C47)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        )}

        {/* ── Messages ── */}
        <div
          className="chat-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            scrollbarWidth: "thin",
            scrollbarColor: "#2A2A2A #0F0F0F",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loadingMessages ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: idx % 2 === 0 ? "flex-start" : "flex-end",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: `${Math.random() * 120 + 100}px`,
                    height: "36px",
                    borderRadius: "12px",
                    background: "#1A1A1A",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            ))
          ) : messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#4B5563",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#1A1A1A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                💬
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSender = msg.senderId._id === userId;
              if (msg.mediaType === "missed_call") {
                const isMissedByMe = msg.senderId._id !== userId; // caller is not me = I missed it
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#1A1A1A",
                        border: "1px solid #2A2A2A",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        color: isMissedByMe ? "#EF4444" : "#6B7280",
                      }}
                    >
                      <FaPhone style={{ fontSize: "11px" }} />
                      <span>
                        {isMissedByMe
                          ? `Missed ${msg.callType === "video" ? "video" : "voice"} call`
                          : `You called · no answer`}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: isSender ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    className="chat-bubble"
                    style={{
                      maxWidth: "72%",
                      padding: msg.media && !msg.text ? "4px" : "10px 14px",
                      borderRadius: isSender
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: isSender
                        ? "linear-gradient(135deg, #FF6B1A 0%, #E85D0A 100%)"
                        : "#1E1E1E",
                      borderLeft: !isSender ? "3px solid #2A2A2A" : "none",
                      boxShadow: isSender
                        ? "0 2px 12px rgba(255, 107, 26, 0.25)"
                        : "0 2px 8px rgba(0,0,0,0.3)",
                      transition: "transform 0.1s ease",
                    }}
                  >
                    {msg.media && renderMediaPreview(msg)}
                    {msg.text && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          lineHeight: "1.5",
                          wordBreak: "break-word",
                          color: "#FFFFFF",
                          marginTop: msg.media ? "6px" : 0,
                        }}
                      >
                        {msg.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div
            style={{
              background: "#1A0A00",
              borderTop: "1px solid #2A1500",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#FF6B1A",
                display: "inline-block",
                animation: "pulse 1s ease-in-out infinite",
              }}
            />
            <span
              style={{ color: "#FF8C47", fontSize: "14px", fontWeight: 600 }}
            >
              Recording · {formatTime(recordingDuration)}
            </span>
          </div>
        )}

        {/* Audio preview */}
        {audioBlob && !isRecording && audioUrl && (
          <div
            style={{
              background: "#141414",
              borderTop: "1px solid #1F1F1F",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <audio
              controls
              src={audioUrl}
              style={{ flex: 1, height: "36px", minWidth: 0 }}
            />
            <button
              onClick={() => {
                setAudioBlob(null);
                setAudioUrl(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
              }}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* File preview */}
        {file && (
          <div
            style={{
              background: "#141414",
              borderTop: "1px solid #1F1F1F",
              padding: "8px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "#FF6B1A22",
                border: "1px solid #FF6B1A44",
                borderRadius: "8px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                maxWidth: "260px",
                minWidth: 0,
              }}
            >
              <FaPaperclip style={{ color: "#FF6B1A", flexShrink: 0 }} />
              <span
                style={{
                  fontSize: "13px",
                  color: "#E5E7EB",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: "0 2px",
                }}
              >
                <FaTimes size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── Input bar ── */}
        <form
          onSubmit={handleSendMessage}
          className="chat-input-bar"
          style={{
            background: "#141414",
            borderTop: "1px solid #1F1F1F",
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            position: "relative",
          }}
        >
          {showEmojiPicker && (
            <div className="chat-emoji-picker">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={"dark" as any} />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              background: "none",
              border: "none",
              color: showEmojiPicker ? "#FF6B1A" : "#6B7280",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px",
              transition: "color 0.2s",
              flexShrink: 0,
              marginBottom: "4px",
            }}
          >
            <FaSmile />
          </button>

          <textarea
            ref={textareaRef}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "10px 14px",
              borderRadius: "24px",
              background: "#242424",
              color: "#FFFFFF",
              border: "1.5px solid #2A2A2A",
              outline: "none",
              resize: "none",
              height: "40px",
              maxHeight: "128px",
              fontSize: "14px",
              lineHeight: "1.5",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
              scrollbarWidth: "none",
            }}
            placeholder="Type a message…"
            value={text}
            onChange={handleTextChange}
            disabled={isRecording}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B1A")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
          />

          <label
            htmlFor="file-upload"
            style={{
              cursor: "pointer",
              color: "#6B7280",
              fontSize: "18px",
              padding: "4px",
              flexShrink: 0,
              marginBottom: "4px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "#FF6B1A")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "#6B7280")
            }
          >
            <FaPaperclip />
          </label>
          <input
            type="file"
            id="file-upload"
            style={{ display: "none" }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files?.[0] || null)
            }
          />

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              background: isRecording ? "#FF6B1A22" : "none",
              border: isRecording ? "1.5px solid #FF6B1A" : "none",
              color: isRecording ? "#FF6B1A" : "#6B7280",
              cursor: "pointer",
              fontSize: "18px",
              padding: "6px",
              borderRadius: "50%",
              flexShrink: 0,
              marginBottom: "2px",
              transition: "all 0.2s",
              animation: isRecording ? "pulse 1s ease-in-out infinite" : "none",
            }}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
          </button>

          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #FF6B1A, #E85D0A)",
              border: "none",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(255, 107, 26, 0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1.08)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 20px rgba(255, 107, 26, 0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 2px 12px rgba(255, 107, 26, 0.4)";
            }}
          >
            <FaPaperPlane size={15} />
          </button>
        </form>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }

          /* Hamburger is only needed on mobile, where the sidebar is a
             drawer rather than a persistent column. */
          .chat-sidebar-toggle { display: none; }
          @media (max-width: 767px) {
            .chat-sidebar-toggle { display: flex !important; align-items: center; }
          }

          /* Tight phones: shrink padding + drop the call button labels'
             implicit hover affordance gap so nothing wraps/overflows. */
          @media (max-width: 480px) {
            .chat-header { padding: 10px 12px !important; gap: 8px !important; }
            .chat-call-buttons { gap: 6px !important; }
            .chat-call-buttons button { width: 32px !important; height: 32px !important; font-size: 13px !important; }
            .chat-input-bar { padding: 10px 10px !important; gap: 6px !important; }
            .chat-messages { padding: 14px 10px !important; }
            .chat-bubble { max-width: 84% !important; }
          }

          /* Emoji picker: anchored above the input bar on desktop, but
             full-width and capped in height on small screens so it never
             pushes off-screen or gets clipped. */
          .chat-emoji-picker {
            position: absolute;
            bottom: 72px;
            left: 12px;
            z-index: 20;
          }
          @media (max-width: 480px) {
            .chat-emoji-picker {
              left: 8px;
              right: 8px;
              bottom: 64px;
              width: auto;
            }
            .chat-emoji-picker > * {
              width: 100% !important;
              max-height: 320px !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ChatWindow;

"use client";

import React, {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import newRequest from "../../utils/newRequest";
import { io, Socket } from "socket.io-client";
import {
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaMicrophone,
  FaStop,
  FaBars,
} from "react-icons/fa";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import upload from "../../utils/upload";
import WhatsAppAudioPlayer from "./WhatsAppAudioPlayer";
import CustomVideoPlayer from "./CustomVideoPlayer";
import DocumentMessage from "./DocumentMessage";
import WhatsAppImage from "./WhatsAppImage";
import { toast } from "react-toastify";

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
  mediaType?: "image" | "video" | "audio" | "document" | string;
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

const ChatWindow: React.FC<ChatWindowProps> = ({
  userId,
  conversation,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const [messages, setMessages] = useState<LastMessage[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const socket = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<NodeJS.Timer | null>(null);

  // Socket init
  useEffect(() => {
    socket.current = io("https://api.renewedmindsglobalconsult.com");
    socket.current.emit("join", userId);

    socket.current.on("onlineStatus", ({ userId: onlineUserId, status }) => {
      if (conversation.otherParticipant._id === onlineUserId) {
        setIsOnline(status === "online");
      }
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [conversation._id, userId]);

  // Fetch messages
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

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
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
          setUploadProgress(progress)
        );
        fileUrl = uploadedFile?.secure_url || uploadedFile?.url || "";
        if (!fileUrl) throw new Error("File upload failed");
      }

      if (audioBlob) {
        const audioFile = new File([audioBlob], `audio_${Date.now()}.wav`, {
          type: "audio/wav",
        });
        const uploadedAudio = await upload(audioFile, (progress: number) =>
          setUploadProgress(progress)
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
      socket.current?.emit("sendMessage", formattedMessage);
      setMessages((prev) => [...prev, formattedMessage]);
      setText("");
      setFile(null);
      setAudioBlob(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to send message.");
    } finally {
      setLoadingFile(false);
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Recording handlers
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
    recordingInterval.current = setInterval(
      () => setRecordingDuration((prev) => prev + 1),
      1000
    );
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;
    clearInterval(recordingInterval.current as NodeJS.Timer);
    mediaRecorder.current.stop();
  };

  // Emoji
  const onEmojiClick = (emojiData: EmojiClickData) =>
    setText((prev) => prev + emojiData.emoji);

  // Render media
  const renderMediaPreview = (message: LastMessage) => {
    if (!message.media) return null;
    const ext = message.media.split(".").pop()?.toLowerCase();
    if (!ext) return null;

    const isSender = message.senderId._id === userId;
    const fileName =
      message.display_name || message.media.split("/").pop() || "file";

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <WhatsAppImage message={message} />;
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
          message={message}
          fileExtension={ext}
          fileName={fileName}
          isSender={isSender}
        />
      );
    return null;
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <button
          onClick={toggleSidebar}
          className="sm:hidden text-white text-xl"
        >
          <FaBars />
        </button>
        <div className="flex items-center gap-3">
          {conversation.otherParticipant.img && (
            <img
              src={conversation.otherParticipant.img}
              alt={conversation.otherParticipant.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-400"
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold">
              {conversation.otherParticipant.username}
            </span>
            <span
              className={`text-xs ${
                isOnline ? "text-green-400" : "text-gray-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {loadingMessages ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse my-2 flex justify-start">
              <div className="bg-gray-700 rounded-xl w-1/3 h-6" />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSender = msg.senderId._id === userId;
            return (
              <div
                key={idx}
                className={`flex ${
                  isSender ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`p-2 rounded-xl max-w-[75%] ${
                    isSender
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.media && renderMediaPreview(msg)}
                  {msg.text && <p className="break-words">{msg.text}</p>}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 bg-gray-800 border-t border-gray-700 relative"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-xl"
        >
          <FaSmile />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-20">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <textarea
          className="flex-1 p-2 rounded-md bg-gray-700 text-white resize-none h-10 max-h-32 scrollbar-hidden focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRecording}
        />

        {file && (
          <div className="flex items-center gap-1 bg-gray-700 p-2 rounded-md truncate max-w-[120px]">
            <FaPaperclip /> {file.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-red-500"
            >
              &times;
            </button>
          </div>
        )}

        <label htmlFor="file-upload" className="cursor-pointer">
          <FaPaperclip />
        </label>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        <button
          type="submit"
          className="bg-blue-600 p-2 rounded-full text-white"
        >
          <FaPaperPlane />
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`${
            isRecording ? "animate-pulse text-red-600" : "text-blue-600"
          }`}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

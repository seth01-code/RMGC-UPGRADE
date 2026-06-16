"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaExpand, FaTimes, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

let currentlyPlayingVideo: HTMLVideoElement | null = null;

interface CustomVideoPlayerProps {
  src: string;
  fileExtension: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, fileExtension }) => {
  const smallVideoRef = useRef<HTMLVideoElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullView, setIsFullView] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const togglePlay = (videoRef: React.RefObject<HTMLVideoElement>, setPlaying: React.Dispatch<React.SetStateAction<boolean>>) => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
        currentlyPlayingVideo.pause();
      }
      currentlyPlayingVideo = video;
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const handleProgress = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    setCurrentTime(formatTime(video.currentTime));
    setDuration(formatTime(video.duration));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, videoRef: React.RefObject<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = ratio * videoRef.current.duration;
  };

  const handleFullScreen = () => {
    setIsFullView(true);
    smallVideoRef.current?.pause();
    setIsPlaying(false);
  };

  const closeFullScreen = () => {
    setIsFullView(false);
    fullVideoRef.current?.pause();
  };

  useEffect(() => {
    const smallVideo = smallVideoRef.current;
    if (!smallVideo) return;
    const handlePause = () => {
      if (currentlyPlayingVideo === smallVideo) {
        currentlyPlayingVideo = null;
        setIsPlaying(false);
      }
    };
    smallVideo.addEventListener("pause", handlePause);
    return () => smallVideo.removeEventListener("pause", handlePause);
  }, []);

  return (
    <>
      {/* Compact Player */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#0A0A0A",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={smallVideoRef}
          style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }}
          muted={isMuted}
          onTimeUpdate={() => handleProgress(smallVideoRef)}
        >
          <source src={src} type={`video/${fileExtension}`} />
        </video>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Center play button */}
        <button
          onClick={() => togglePlay(smallVideoRef, setIsPlaying)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: isPlaying && !showControls ? "transparent" : "rgba(255,107,26,0.9)",
            border: "none",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: showControls || !isPlaying ? 1 : 0,
            transition: "all 0.2s ease",
            boxShadow: "0 2px 16px rgba(255,107,26,0.5)",
          }}
        >
          {isPlaying ? <FaPause color="#fff" size={16} /> : <FaPlay color="#fff" size={16} style={{ marginLeft: "2px" }} />}
        </button>

        {/* Bottom controls */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "8px 10px 10px",
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          {/* Progress bar */}
          <div
            style={{
              height: "4px",
              background: "rgba(255,255,255,0.25)",
              borderRadius: "2px",
              cursor: "pointer",
              marginBottom: "6px",
            }}
            onClick={(e) => handleSeek(e, smallVideoRef)}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #FF6B1A, #FF8C47)",
                borderRadius: "2px",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Controls row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#fff", fontSize: "11px", opacity: 0.8 }}>
              {currentTime} / {duration}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (smallVideoRef.current) smallVideoRef.current.muted = !isMuted;
                }}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "2px" }}
              >
                {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
              </button>
              <button
                onClick={handleFullScreen}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "2px" }}
              >
                <FaExpand size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Modal */}
      {isFullView && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.97)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <button
            onClick={closeFullScreen}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              color: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              zIndex: 10000,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FF6B1A")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1A1A1A")}
          >
            <FaTimes size={16} />
          </button>

          <video
            ref={fullVideoRef}
            style={{
              width: "100%",
              maxWidth: "1100px",
              maxHeight: "90vh",
              borderRadius: "12px",
              boxShadow: "0 0 60px rgba(255,107,26,0.1)",
            }}
            controls
            autoPlay
            onTimeUpdate={() => handleProgress(fullVideoRef)}
          >
            <source src={src} type={`video/${fileExtension}`} />
          </video>
        </div>
      )}
    </>
  );
};

export default CustomVideoPlayer;
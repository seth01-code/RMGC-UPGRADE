"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaDownload, FaPause, FaPlay } from "react-icons/fa";

interface WhatsAppAudioPlayerProps {
  src: string;
  fileExtension: string;
  fileName?: string;
  isSender: boolean;
}

let currentlyPlayingAudio: HTMLAudioElement | WaveSurfer | null = null;

const WhatsAppAudioPlayer: React.FC<WhatsAppAudioPlayerProps> = ({
  src,
  fileExtension,
  fileName = "audio",
  isSender,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloaded, setDownloaded] = useState(
    () => localStorage.getItem(`downloaded-${fileName}`) === "true"
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (fileExtension.toLowerCase() !== "wav" || !waveformRef.current) return;
    const wave = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isSender ? "rgba(255,255,255,0.35)" : "#3A3A3A",
      progressColor: isSender ? "#FFFFFF" : "#FF6B1A",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      responsive: true,
      height: 40,
    });
    waveSurferRef.current = wave;
    let isUnmounted = false;
    const safe = (fn: () => void) => { if (!isUnmounted) fn(); };
    wave.load(src);
    wave.on("ready", () => safe(() => setDuration(formatTime(wave.getDuration()))));
    wave.on("audioprocess", () => safe(() => {
      setCurrentTime(formatTime(wave.getCurrentTime()));
      setProgress((wave.getCurrentTime() / wave.getDuration()) * 100);
    }));
    wave.on("finish", () => safe(() => { setIsPlaying(false); setProgress(0); }));
    return () => {
      isUnmounted = true;
      if (waveSurferRef.current) {
        try { waveSurferRef.current.empty(); waveSurferRef.current.destroy(); } catch { }
        waveSurferRef.current = null;
      }
    };
  }, [fileExtension, src, isSender]);

  useEffect(() => {
    if (fileExtension.toLowerCase() === "wav") return;
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (!isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(formatTime(audio.currentTime));
      }
    };
    const handleLoadedMetadata = () => { if (!isNaN(audio.duration)) setDuration(formatTime(audio.duration)); };
    const handlePlay = () => {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) (currentlyPlayingAudio as HTMLAudioElement).pause();
      currentlyPlayingAudio = audio;
      setIsPlaying(true);
    };
    const handlePause = () => { if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null; setIsPlaying(false); };
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [fileExtension]);

  const togglePlay = () => {
    if (fileExtension.toLowerCase() === "wav" && waveSurferRef.current) {
      try {
        if (currentlyPlayingAudio && currentlyPlayingAudio !== waveSurferRef.current)
          (currentlyPlayingAudio as WaveSurfer).pause();
        currentlyPlayingAudio = waveSurferRef.current;
        isPlaying ? waveSurferRef.current.pause() : waveSurferRef.current.play();
        setIsPlaying(!isPlaying);
      } catch (err) { console.warn(err); }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
      (currentlyPlayingAudio as HTMLAudioElement).pause();
      (currentlyPlayingAudio as HTMLAudioElement).currentTime = 0;
    }
    currentlyPlayingAudio = audio;
    isPlaying ? audio.pause() : audio.play();
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (fileExtension.toLowerCase() === "wav") {
      waveSurferRef.current?.seekTo(ratio);
    } else {
      if (audioRef.current) audioRef.current.currentTime = ratio * audioRef.current.duration;
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(`downloaded-${fileName}`, "true");
  };

  const senderBg = "linear-gradient(135deg, #FF6B1A 0%, #E85D0A 100%)";
  const receiverBg = "#1E1E1E";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "10px 12px",
        borderRadius: "14px",
        width: "100%",
        minWidth: "220px",
        maxWidth: "340px",
        background: isSender ? senderBg : receiverBg,
        boxShadow: isSender
          ? "0 2px 16px rgba(255, 107, 26, 0.3)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {fileExtension.toLowerCase() !== "wav" && (
        <audio ref={audioRef} src={src} className="hidden" />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Play button */}
        <button
          onClick={togglePlay}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "none",
            background: isSender ? "rgba(255,255,255,0.2)" : "#FF6B1A",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.2s, transform 0.15s",
            boxShadow: isSender ? "none" : "0 2px 10px rgba(255,107,26,0.4)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
        >
          {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} style={{ marginLeft: "2px" }} />}
        </button>

        <span style={{ color: isSender ? "rgba(255,255,255,0.75)" : "#9CA3AF", fontSize: "11px", flexShrink: 0, minWidth: "34px" }}>
          {currentTime}
        </span>

        {/* Waveform or progress bar */}
        {fileExtension.toLowerCase() === "wav" ? (
          <div ref={waveformRef} style={{ flex: 1 }} />
        ) : (
          <div
            style={{
              position: "relative",
              flex: 1,
              height: "4px",
              background: isSender ? "rgba(255,255,255,0.25)" : "#2A2A2A",
              borderRadius: "2px",
              cursor: "pointer",
            }}
            onClick={handleSeek}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: isSender ? "#FFFFFF" : "linear-gradient(90deg, #FF6B1A, #FF8C47)",
                borderRadius: "2px",
                transition: "width 0.15s linear",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: isSender ? "#FFFFFF" : "#FF6B1A",
                boxShadow: "0 0 4px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        )}

        <span style={{ color: isSender ? "rgba(255,255,255,0.75)" : "#9CA3AF", fontSize: "11px", flexShrink: 0, minWidth: "34px", textAlign: "right" }}>
          {duration}
        </span>
      </div>

      {/* Download */}
      {!isSender && !downloaded && fileExtension.toLowerCase() !== "wav" && (
        <a
          href={src}
          download={fileName}
          onClick={handleDownload}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            background: "#FF6B1A",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "background 0.2s",
            marginTop: "2px",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E85D0A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#FF6B1A")}
        >
          <FaDownload size={11} />
          Save audio
        </a>
      )}
    </div>
  );
};

export default WhatsAppAudioPlayer;
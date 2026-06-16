"use client";

import React, { useRef, useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { HiPlay, HiPause } from "react-icons/hi";
import { HiOutlineExclamationCircle, HiOutlineDownload } from "react-icons/hi";

interface AudioMessagePlayerProps {
  src: string;
  fileExtension: string;
  fileName: string;
  isSender: boolean;
}

let currentlyPlaying: HTMLAudioElement | WaveSurfer | null = null;

const stopPlayback = (player: HTMLAudioElement | WaveSurfer | null) => {
  if (!player) return;
  if (player instanceof WaveSurfer) player.stop();
  else { player.pause(); player.currentTime = 0; }
};

const formatTime = (t: number) => {
  if (isNaN(t) || t < 0) return "0:00";
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
};

const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  src, fileExtension, fileName, isSender,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [downloaded, setDownloaded] = useState(
    () => localStorage.getItem(`downloaded-${fileName}`) === "true"
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  // WAV → WaveSurfer
  useEffect(() => {
    if (fileExtension !== "wav") return;
    try {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: isSender ? "rgba(255,255,255,0.3)" : "#e5e5e5",
        progressColor: "#f97316",
        cursorColor: "transparent",
        barWidth: 2,
        barRadius: 2,
        height: 32,
      });
      waveSurferRef.current.load(src);
      waveSurferRef.current.on("ready", () => {
        setDuration(formatTime(waveSurferRef.current!.getDuration()));
        setLoaded(true);
      });
      waveSurferRef.current.on("audioprocess", () => {
        setCurrentTime(formatTime(waveSurferRef.current!.getCurrentTime()));
      });
      waveSurferRef.current.on("finish", () => {
        setIsPlaying(false);
        currentlyPlaying = null;
      });
    } catch {
      setError(true);
    }
    return () => {
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
    };
  }, [src, fileExtension, isSender]);

  // Non-WAV → native audio
  useEffect(() => {
    if (fileExtension === "wav") return;
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (!isNaN(audio.duration)) {
        setDuration(formatTime(audio.duration));
        setLoaded(true);
      }
    };
    const onTimeUpdate = () => {
      if (!isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(formatTime(audio.currentTime));
      }
    };
    const onPlay = () => {
      if (currentlyPlaying && currentlyPlaying !== audio) stopPlayback(currentlyPlaying);
      currentlyPlaying = audio;
      setIsPlaying(true);
    };
    const onPause = () => { setIsPlaying(false); currentlyPlaying = null; };
    const onError = () => setError(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("canplaythrough", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    // Handle cached audio that already has metadata
    if (audio.readyState >= 2 && !isNaN(audio.duration)) {
      setDuration(formatTime(audio.duration));
      setLoaded(true);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("canplaythrough", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [fileExtension, src]);

  const togglePlay = () => {
    const active = fileExtension === "wav" ? waveSurferRef.current : audioRef.current;
    if (currentlyPlaying && currentlyPlaying !== active) stopPlayback(currentlyPlaying);

    if (fileExtension === "wav") {
      isPlaying ? waveSurferRef.current?.pause() : waveSurferRef.current?.play();
      if (!isPlaying) currentlyPlaying = waveSurferRef.current;
      setIsPlaying(!isPlaying);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play().catch(() => setError(true));
    if (!isPlaying) currentlyPlaying = audio;
  };

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(`downloaded-${fileName}`, "true");
  };

  const bg = isSender ? "bg-[#111]" : "bg-white border border-[#f0f0f0]";
  const textMuted = isSender ? "text-white/40" : "text-[#bbb]";
  const trackBg = isSender ? "bg-white/10" : "bg-[#f0f0f0]";

  return (
    <div className={`flex flex-col gap-2 px-3.5 py-3 rounded-2xl w-full max-w-[280px] ${bg}`}>

      {/* Always render audio element so ref is available before effect fires */}
      {fileExtension !== "wav" && (
        <audio ref={audioRef} preload="metadata" className="hidden">
          <source src={src} type={`audio/${fileExtension}`} />
        </audio>
      )}

      {/* Error */}
      {error && (
        <div className={`flex items-center gap-2 text-[12px] ${isSender ? "text-red-300" : "text-red-400"}`}>
          <HiOutlineExclamationCircle className="text-[14px]" />
          Failed to load audio
        </div>
      )}

      {/* Skeleton */}
      {!loaded && !error && (
        <div className={`h-8 rounded-xl animate-pulse ${trackBg}`} />
      )}

      {/* Player */}
      {!error && loaded && (
        <div className="flex items-center gap-3">

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isSender
                ? "bg-orange-500 hover:bg-orange-400 text-white"
                : "bg-[#111] hover:bg-orange-500 text-white"
            }`}
          >
            {isPlaying
              ? <HiPause className="text-[15px]" />
              : <HiPlay className="text-[15px] ml-0.5" />}
          </button>

          {/* Waveform / progress track */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            {fileExtension === "wav" ? (
              <div ref={waveformRef} className="w-full" />
            ) : (
              <div className={`h-1.5 rounded-full overflow-hidden ${trackBg}`}>
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Time stamps */}
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold ${textMuted}`}>{currentTime}</span>
              <span className={`text-[10px] font-semibold ${textMuted}`}>{duration}</span>
            </div>
          </div>

          {/* Download */}
          {!downloaded && (
            <a
              href={src}
              download={fileName}
              onClick={handleDownload}
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isSender
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-[#f5f5f5] hover:bg-orange-50 hover:text-orange-500 text-[#aaa]"
              }`}
            >
              <HiOutlineDownload className="text-[13px]" />
            </a>
          )}
        </div>
      )}

      {/* File name */}
      {!error && loaded && (
        <p className={`text-[10px] truncate ${textMuted}`}>{fileName}</p>
      )}
    </div>
  );
};

export default AudioMessagePlayer;
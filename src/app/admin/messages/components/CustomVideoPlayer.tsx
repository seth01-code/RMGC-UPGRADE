// CustomVideoPlayer.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlay, HiPause, HiOutlineX } from "react-icons/hi";
import { MdOutlineFullscreen } from "react-icons/md";

let currentlyPlayingVideo: HTMLVideoElement | null = null;

type VideoExtension = "mp4" | "webm" | "ogg" | "mov" | "avi" | "mkv" | "flv" | "wmv";

interface CustomVideoPlayerProps { src: string; fileExtension: VideoExtension; }

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, fileExtension }) => {
  const smallRef = useRef<HTMLVideoElement>(null);
  const fullRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullView, setIsFullView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (t: number) =>
    `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  const togglePlay = (ref: React.RefObject<HTMLVideoElement | null>) => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      if (currentlyPlayingVideo && currentlyPlayingVideo !== video) currentlyPlayingVideo.pause();
      currentlyPlayingVideo = video;
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleProgress = (ref: React.RefObject<HTMLVideoElement | null>) => {
    const v = ref.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    setCurrentTime(v.currentTime);
    setDuration(v.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = smallRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const openFull = () => {
    smallRef.current?.pause();
    setIsPlaying(false);
    setIsFullView(true);
  };

  useEffect(() => {
    const v = smallRef.current;
    if (!v) return;
    const onPause = () => { if (currentlyPlayingVideo === v) { currentlyPlayingVideo = null; setIsPlaying(false); } };
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => { v.removeEventListener("pause", onPause); v.removeEventListener("ended", onEnded); };
  }, []);

  return (
    <>
      {/* ── Thumbnail player ── */}
      <div
        className="relative rounded-2xl overflow-hidden group cursor-pointer max-w-[280px]"
        style={{ background: "#111" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video
          ref={smallRef}
          className="w-full h-auto block rounded-2xl"
          onTimeUpdate={() => handleProgress(smallRef)}
          onClick={() => togglePlay(smallRef)}
          style={{ maxHeight: "180px", objectFit: "cover" }}
        >
          <source src={src} type={`video/${fileExtension}`} />
        </video>

        {/* Centre play/pause overlay */}
        <AnimatePresence>
          {(isHovered || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"
              onClick={() => togglePlay(smallRef)}
            >
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                {isPlaying
                  ? <HiPause className="text-[#111] text-[18px]" />
                  : <HiPlay className="text-[#111] text-[18px] ml-0.5" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen button */}
        <button
          onClick={(e) => { e.stopPropagation(); openFull(); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/50 hover:bg-orange-500 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <MdOutlineFullscreen className="text-[15px]" />
        </button>

        {/* Progress bar + time */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          {/* Seek bar */}
          <div
            className="h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer mb-1.5"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Time */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/60 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-[9px] text-white/40 font-semibold">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* ── Fullscreen modal ── */}
      <AnimatePresence>
        {isFullView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
            style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(12px)" }}
            onClick={() => { fullRef.current?.pause(); setIsFullView(false); }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); fullRef.current?.pause(); setIsFullView(false); }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500 border border-white/10 hover:border-orange-500 text-white flex items-center justify-center transition-all z-10"
            >
              <HiOutlineX className="text-[16px]" />
            </button>

            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl"
            >
              <video
                ref={fullRef}
                className="w-full max-h-[88vh] rounded-2xl"
                controls
                autoPlay
                onTimeUpdate={() => handleProgress(fullRef)}
              >
                <source src={src} type={`video/${fileExtension}`} />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomVideoPlayer;
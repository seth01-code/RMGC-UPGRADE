"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaExpand, FaTimes } from "react-icons/fa";

let currentlyPlayingVideo: HTMLVideoElement | null = null;

type VideoExtension =
  | "mp4"
  | "webm"
  | "ogg"
  | "mov"
  | "avi"
  | "mkv"
  | "flv"
  | "wmv";

interface CustomVideoPlayerProps {
  src: string;
  fileExtension: VideoExtension;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  fileExtension,
}) => {
  const smallVideoRef = useRef<HTMLVideoElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullView, setIsFullView] = useState(false);

  const togglePlay = (
    videoRef: React.RefObject<HTMLVideoElement>,
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
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

  const handleProgress = (
    videoRef: React.RefObject<HTMLVideoElement>,
    setProgressState: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
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
      {/* Small Video Container */}
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl group">
        <video
          ref={smallVideoRef}
          className="rounded-lg w-full border border-gray-600 cursor-pointer object-cover shadow-md"
          onTimeUpdate={() => handleProgress(smallVideoRef, setProgress)}
        >
          <source src={src} type={`video/${fileExtension || "mp4"}`} />
        </video>

        {/* Play/Pause Overlay */}
        <button
          onClick={() => togglePlay(smallVideoRef, setIsPlaying)}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {isPlaying ? (
            <FaPause className="text-white text-4xl" />
          ) : (
            <FaPlay className="text-white text-4xl" />
          )}
        </button>

        {/* Full-Screen Button */}
        <button
          onClick={handleFullScreen}
          className="absolute bottom-3 right-3 bg-gray-800 bg-opacity-70 p-2 rounded-full hover:bg-opacity-90 transition-transform transform active:scale-95"
        >
          <FaExpand className="text-white text-lg" />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Full-Screen Modal */}
      {isFullView && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          {/* Close Button */}
          <button
            onClick={closeFullScreen}
            className="absolute top-4 right-4 bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-transform transform active:scale-90"
          >
            <FaTimes className="text-white text-2xl" />
          </button>

          <video
            ref={fullVideoRef}
            className="w-full h-auto max-w-6xl max-h-[90vh] rounded-lg shadow-lg"
            controls
            autoPlay
            onTimeUpdate={() => handleProgress(fullVideoRef, setProgress)}
          >
            <source src={src} type={`video/${fileExtension || "mp4"}`} />
          </video>
        </div>
      )}
    </>
  );
};

export default CustomVideoPlayer;

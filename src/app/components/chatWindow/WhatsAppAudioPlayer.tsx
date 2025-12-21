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

  // WAV / WaveSurfer
  useEffect(() => {
    if (fileExtension.toLowerCase() !== "wav" || !waveformRef.current) return;

    const wave = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#9CA3AF",
      progressColor: "#22C55E",
      cursorColor: "#FFFFFF",
      barWidth: 2,
      responsive: true,
      height: 45,
    });

    waveSurferRef.current = wave;
    let isUnmounted = false;

    const safeSetState = (fn: () => void) => {
      if (!isUnmounted) fn();
    };

    wave.load(src);

    wave.on("ready", () =>
      safeSetState(() => setDuration(formatTime(wave.getDuration())))
    );
    wave.on("audioprocess", () =>
      safeSetState(() => {
        setCurrentTime(formatTime(wave.getCurrentTime()));
        setProgress((wave.getCurrentTime() / wave.getDuration()) * 100);
      })
    );
    wave.on("finish", () =>
      safeSetState(() => {
        setIsPlaying(false);
        setProgress(0);
      })
    );

    return () => {
      isUnmounted = true;
      if (waveSurferRef.current) {
        try {
          waveSurferRef.current.empty(); // cancel pending audio decode
          waveSurferRef.current.destroy();
        } catch (err) {
          console.warn("WaveSurfer destroy skipped due to abort:", err);
        }
        waveSurferRef.current = null;
      }
    };
  }, [fileExtension, src]);

  // Standard audio
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

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) setDuration(formatTime(audio.duration));
    };

    const handlePlay = () => {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        (currentlyPlayingAudio as HTMLAudioElement).pause();
      }
      currentlyPlayingAudio = audio;
      setIsPlaying(true);
    };

    const handlePause = () => {
      if (currentlyPlayingAudio === audio) currentlyPlayingAudio = null;
      setIsPlaying(false);
    };

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
        if (
          currentlyPlayingAudio &&
          currentlyPlayingAudio !== waveSurferRef.current
        ) {
          (currentlyPlayingAudio as WaveSurfer).pause();
        }
        currentlyPlayingAudio = waveSurferRef.current;
        isPlaying
          ? waveSurferRef.current.pause()
          : waveSurferRef.current.play();
        setIsPlaying(!isPlaying);
      } catch (err) {
        console.warn("WaveSurfer play/pause error:", err);
      }
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
    const newTime = (e.clientX - rect.left) / rect.width;

    if (fileExtension.toLowerCase() === "wav") {
      waveSurferRef.current?.seekTo(newTime);
    } else {
      if (audioRef.current)
        audioRef.current.currentTime = newTime * audioRef.current.duration;
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(`downloaded-${fileName}`, "true");
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-lg w-full min-w-[208px] max-w-sm md:max-w-md ${
        isSender ? "bg-green-600" : "bg-gray-800"
      }`}
    >
      {fileExtension.toLowerCase() !== "wav" && (
        <audio
          ref={audioRef}
          src={src}
          type={`audio/${fileExtension}`}
          className="hidden"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="text-white p-2 rounded-full bg-green-500 md:p-3 hover:bg-green-400 transition"
        >
          {isPlaying ? (
            <FaPause className="text-lg md:text-xl" />
          ) : (
            <FaPlay className="text-lg md:text-xl" />
          )}
        </button>

        <span className="text-white text-sm md:text-base">{currentTime}</span>

        {fileExtension.toLowerCase() === "wav" ? (
          <div ref={waveformRef} className="flex-1" />
        ) : (
          <div
            className="relative flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-green-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full cursor-pointer"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        )}

        {fileExtension.toLowerCase() !== "wav" && (
          <span className="text-white text-sm md:text-base">{duration}</span>
        )}
      </div>

      {!isSender && !downloaded && fileExtension.toLowerCase() !== "wav" && (
        <a
          href={src}
          download={fileName}
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 text-white bg-green-500 py-1 px-3 rounded-md text-sm md:text-base md:py-2 md:px-4 hover:bg-green-400 transition"
        >
          <FaDownload />
          Download
        </a>
      )}
    </div>
  );
};

export default WhatsAppAudioPlayer;

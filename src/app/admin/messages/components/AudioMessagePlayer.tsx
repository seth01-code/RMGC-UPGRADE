"use client";

import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaExclamationCircle } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface AudioMessagePlayerProps {
  src: string;
  fileExtension: string;
  fileName: string;
  isSender: boolean;
}

/**
 * Keep track of the currently playing audio (HTMLAudioElement or WaveSurfer)
 */
let currentlyPlaying: HTMLAudioElement | WaveSurfer | null = null;

/**
 * Safely stop any audio type
 */
const stopPlayback = (
  player: HTMLAudioElement | WaveSurfer | null
) => {
  if (!player) return;

  if (player instanceof WaveSurfer) {
    player.stop();
  } else {
    player.pause();
    player.currentTime = 0;
  }
};

const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  src,
  fileExtension,
  fileName,
  isSender,
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

  /**
   * WAV → WaveSurfer
   */
  useEffect(() => {
    if (fileExtension !== "wav") return;

    try {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#9CA3AF",
        progressColor: "#22C55E",
        cursorColor: "#FFFFFF",
        barWidth: 2,
        height: 45,
      });

      waveSurferRef.current.load(src);

      waveSurferRef.current.on("ready", () => {
        setDuration(formatTime(waveSurferRef.current!.getDuration()));
        setLoaded(true);
      });

      waveSurferRef.current.on("audioprocess", () => {
        setCurrentTime(
          formatTime(waveSurferRef.current!.getCurrentTime())
        );
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
  }, [src, fileExtension]);

  /**
   * Non-WAV → native audio
   */
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
      if (currentlyPlaying && currentlyPlaying !== audio) {
        stopPlayback(currentlyPlaying);
      }
      currentlyPlaying = audio;
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
      currentlyPlaying = null;
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", () => setError(true));

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [fileExtension]);

  /**
   * Play / Pause handler
   */
  const togglePlay = () => {
    const activePlayer =
      fileExtension === "wav"
        ? waveSurferRef.current
        : audioRef.current;

    if (
      currentlyPlaying &&
      currentlyPlaying !== activePlayer
    ) {
      stopPlayback(currentlyPlaying);
    }

    if (fileExtension === "wav") {
      if (isPlaying) {
        waveSurferRef.current?.pause();
      } else {
        waveSurferRef.current?.play();
        currentlyPlaying = waveSurferRef.current;
      }
      setIsPlaying(!isPlaying);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setError(true));
      currentlyPlaying = audio;
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(`downloaded-${fileName}`, "true");
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className={`flex flex-col gap-3 p-3 rounded-lg w-full max-w-sm md:max-w-md ${
        isSender ? "bg-green-600" : "bg-gray-800"
      }`}
    >
      {error && (
        <div className="flex items-center gap-2 text-red-400">
          <FaExclamationCircle />
          <span className="text-sm">Failed to load audio.</span>
        </div>
      )}

      {!loaded && !error && <Skeleton height={50} />}

      {!error && loaded && (
        <>
          {fileExtension !== "wav" && (
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
              className="bg-white text-gray-800 rounded-full p-2 md:p-3 hover:bg-gray-200 transition"
            >
              {isPlaying ? (
                <FaPause className="text-lg md:text-xl" />
              ) : (
                <FaPlay className="text-lg md:text-xl" />
              )}
            </button>

            <span className="text-white text-sm">
              {currentTime}
            </span>

            {fileExtension === "wav" ? (
              <div ref={waveformRef} className="flex-1" />
            ) : (
              <div className="flex-1 h-1 bg-gray-600 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {fileExtension !== "wav" && (
              <span className="text-white text-sm">
                {duration}
              </span>
            )}

            {!downloaded && (
              <button
                onClick={handleDownload}
                className="text-white underline text-sm"
              >
                Download
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AudioMessagePlayer;

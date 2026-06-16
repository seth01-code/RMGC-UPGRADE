// ChatImage.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineX, HiOutlineZoomIn } from "react-icons/hi";
import { FaExclamationCircle } from "react-icons/fa";

interface ChatImageProps { media: string; }

const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "avif", "heic"];

const ChatImage: React.FC<ChatImageProps> = ({ media }) => {
  const [isFullView, setIsFullView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const ext = media.split(".").pop()?.toLowerCase() ?? "";
  if (!imageTypes.includes(ext)) return null;

  return (
    <>
      {/* ── Thumbnail ── */}
      <div
        onClick={() => !hasError && setIsFullView(true)}
        className="group relative rounded-2xl overflow-hidden cursor-pointer max-w-[260px]"
        style={{ minHeight: hasError ? "auto" : isLoaded ? "auto" : "140px", background: "#f5f5f5" }}
      >
        {/* Skeleton */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f0f0f0] via-[#f7f7f7] to-[#f0f0f0]" />
        )}

        {/* Error */}
        {hasError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-400 text-[12px]">
            <FaExclamationCircle className="text-[13px]" />
            Failed to load image
          </div>
        )}

        {/* Image */}
        {!hasError && (
          <>
            <img
              src={media}
              alt="Chat image"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                opacity: isLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                borderRadius: "16px",
              }}
            />
            {/* Hover overlay */}
            {isLoaded && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-200 rounded-2xl">
                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
                  <HiOutlineZoomIn className="text-[#111] text-[16px]" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Full view modal ── */}
      <AnimatePresence>
        {isFullView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
            style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}
            onClick={() => setIsFullView(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullView(false); }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-orange-500 border border-white/10 hover:border-orange-500 text-white flex items-center justify-center transition-all z-10"
            >
              <HiOutlineX className="text-[16px]" />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={media}
                alt="Full view"
                width={1200}
                height={900}
                className="rounded-2xl object-contain w-full h-auto max-h-[90vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatImage;
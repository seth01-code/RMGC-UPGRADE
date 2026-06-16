"use client";

import Image from "next/image";
import React, { useState } from "react";
import { FaTimes, FaExpand } from "react-icons/fa";

interface WhatsAppImageProps {
  message: { media: string };
}

const WhatsAppImage: React.FC<WhatsAppImageProps> = ({ message }) => {
  const [isFullView, setIsFullView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileExtension = message.media.split(".").pop()?.toLowerCase() || "";

  if (!imageTypes.includes(fileExtension)) return null;

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => setIsFullView(true)}
        className="relative rounded-xl overflow-hidden cursor-pointer group"
        style={{ maxWidth: "260px", minHeight: "140px", background: "#f0f0f0" }}
      >
        {/* Skeleton — shown until loaded */}
        {!isLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)", backgroundSize: "200% 100%" }}
          />
        )}

        {/* Image — always rendered, visibility controlled by opacity */}
        <img
          src={message.media}
          alt="Image"
          onLoad={() => setIsLoaded(true)}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease",
            borderRadius: "10px",
          }}
        />

        {/* Hover overlay */}
        {isLoaded && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 flex items-center justify-center transition-all duration-200">
            <div className="w-9 h-9 rounded-full bg-orange-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200">
              <FaExpand color="#fff" size={13} />
            </div>
          </div>
        )}
      </div>

      {/* Full view modal */}
      {isFullView && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
          onClick={() => setIsFullView(false)}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFullView(false); }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-orange-500 hover:border-orange-500 text-white flex items-center justify-center transition-all z-[10000]"
          >
            <FaTimes size={14} />
          </button>

          <div
            className="relative w-full max-w-5xl"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={message.media}
              alt="Full View"
              fill
              className="object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppImage;
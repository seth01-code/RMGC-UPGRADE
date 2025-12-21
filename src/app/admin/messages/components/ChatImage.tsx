"use client";

import React, { useState } from "react";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";

interface ChatImageProps {
  message: {
    media: string;
  };
}

const ChatImage: React.FC<ChatImageProps> = ({ message }) => {
  const [isFullView, setIsFullView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileExtension = message?.media?.split(".").pop()?.toLowerCase() || "";

  if (!imageTypes.includes(fileExtension)) return null;

  return (
    <>
      {/* Image Thumbnail */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md cursor-pointer rounded-lg overflow-hidden">
        {!isLoaded && !hasError && <Skeleton height={200} />}
        {hasError && (
          <div className="flex items-center justify-center w-full h-52 bg-gray-200 text-red-500 text-sm">
            <FaExclamationCircle className="mr-2" /> Failed to load image
          </div>
        )}
        {!hasError && (
          <Image
            src={message.media}
            alt="Chat Image"
            width={400}
            height={300}
            className="rounded-lg transition-transform hover:scale-105"
            onClick={() => setIsFullView(true)}
            onLoadingComplete={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            style={{ objectFit: "cover", width: "100%", height: "auto" }}
          />
        )}
      </div>

      {/* Full View Modal */}
      {isFullView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsFullView(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl z-50"
            onClick={() => setIsFullView(false)}
          >
            <FaTimes />
          </button>
          <div className="relative max-w-full max-h-[90vh]">
            {!isLoaded && !hasError && <Skeleton height={400} width={400} />}
            {hasError && (
              <div className="flex items-center justify-center w-96 h-96 bg-gray-200 text-red-500 text-sm">
                <FaExclamationCircle className="mr-2" /> Failed to load image
              </div>
            )}
            {!hasError && (
              <Image
                src={message.media}
                alt="Full View"
                width={800}
                height={600}
                className="rounded-lg shadow-lg transition-transform scale-100 hover:scale-105"
                style={{ objectFit: "contain", width: "100%", height: "auto" }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatImage;

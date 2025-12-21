"use client";

import Image from "next/image";
import React, { useState } from "react";

interface WhatsAppImageProps {
  message: {
    media: string;
  };
}

const WhatsAppImage: React.FC<WhatsAppImageProps> = ({ message }) => {
  const [isFullView, setIsFullView] = useState(false);

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileExtension = message.media.split(".").pop()?.toLowerCase() || "";

  if (!imageTypes.includes(fileExtension)) return null;

  return (
    <>
      {/* Image Thumbnail */}
      <Image
        src={message.media}
        alt="Image"
        width={320} // max-w-sm ≈ 320px
        height={240} // approximate height, adjust as needed
        className="rounded-lg cursor-pointer transition-transform duration-300 shadow-md"
        onClick={() => setIsFullView(true)}
      />

      {/* Full View Modal */}
      {isFullView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsFullView(false)}
        >
          <div className="relative w-full h-[90vh]">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white text-2xl z-50 hover:text-gray-300 transition"
              onClick={() => setIsFullView(false)}
            >
              &times;
            </button>

            <Image
              src={message.media}
              alt="Full View"
              fill
              className="object-contain rounded-lg shadow-xl transition-transform duration-300 scale-100 hover:scale-105"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
            />
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppImage;

"use client";

import React, { useEffect, useState } from "react";
import {
  FaDownload,
  FaFile,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from "react-icons/fa";

interface DocumentMessageProps {
  message: {
    media: string;
  };
  fileExtension: string;
  fileName: string;
  isSender: boolean;
}

const DocumentMessage: React.FC<DocumentMessageProps> = ({
  message,
  fileExtension,
  fileName,
  isSender,
}) => {
  const localStorageKey = `downloaded_${fileName}`;
  const [downloaded, setDownloaded] = useState(false);

  // Check if the file was downloaded before
  useEffect(() => {
    const isDownloaded = localStorage.getItem(localStorageKey) === "true";
    setDownloaded(isDownloaded);
  }, [localStorageKey]);

  // Get preview URL for document viewers
  const getFilePreviewURL = (fileUrl: string, ext: string) => {
    switch (ext.toLowerCase()) {
      case "doc":
      case "docx":
        return `https://docs.google.com/gview?url=${encodeURIComponent(
          fileUrl
        )}&embedded=true`;
      case "pdf":
        return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
          fileUrl
        )}`;
      case "xls":
      case "xlsx":
      case "ppt":
      case "pptx":
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
          fileUrl
        )}`;
      default:
        return fileUrl;
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(localStorageKey, "true");
    window.open(message.media, "_blank");
  };

  const handleFileOpen = () => {
    const previewURL = getFilePreviewURL(message.media, fileExtension);
    window.open(previewURL, "_blank");
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="text-red-500 text-3xl sm:text-2xl" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-700 text-3xl sm:text-2xl" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-500 text-3xl sm:text-2xl" />;
      case "ppt":
      case "pptx":
        return (
          <FaFilePowerpoint className="text-orange-500 text-3xl sm:text-2xl" />
        );
      default:
        return <FaFile className="text-gray-500 text-3xl sm:text-2xl" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 sm:gap-2 p-4 rounded-xl 
        ${isSender ? "bg-blue-500 text-white" : "bg-gray-600 text-white"} 
        w-full max-w-md sm:max-w-lg flex-wrap sm:flex-nowrap shadow-md hover:shadow-lg transition-shadow duration-300`}
    >
      {/* File Icon */}
      <div className="flex-shrink-0">{getFileIcon(fileExtension)}</div>

      {/* File Details */}
      <div className="flex-1 min-w-0">
        <span
          className={`block truncate cursor-pointer ${
            isSender ? "text-white" : "text-blue-200 hover:text-blue-100"
          } hover:underline`}
          onClick={handleFileOpen}
          title={fileName}
        >
          {fileName}
        </span>
      </div>

      {/* Download button */}
      {!isSender && !downloaded && (
        <button
          onClick={handleDownload}
          className="text-blue-200 hover:text-blue-400 flex-shrink-0 p-2 sm:p-1 transition"
        >
          <FaDownload className="text-2xl sm:text-xl" />
        </button>
      )}
    </div>
  );
};

export default DocumentMessage;

"use client";

import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaFile,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaExternalLinkAlt,
} from "react-icons/fa";

interface DocumentMessageProps {
  message: { media: string };
  fileExtension: string;
  fileName: string;
  isSender: boolean;
}

const getFilePreviewURL = (fileUrl: string, ext: string) => {
  switch (ext.toLowerCase()) {
    case "doc":
    case "docx":
      return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    case "pdf":
      return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(fileUrl)}`;
    case "xls":
    case "xlsx":
    case "ppt":
    case "pptx":
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;
    default:
      return fileUrl;
  }
};

const fileTypeConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  pdf:  { icon: <FaFilePdf />,       label: "PDF",       color: "#FF4D4D", bg: "#FF4D4D18" },
  doc:  { icon: <FaFileWord />,      label: "Word",      color: "#2B7CD3", bg: "#2B7CD318" },
  docx: { icon: <FaFileWord />,      label: "Word",      color: "#2B7CD3", bg: "#2B7CD318" },
  xls:  { icon: <FaFileExcel />,     label: "Excel",     color: "#1FA463", bg: "#1FA46318" },
  xlsx: { icon: <FaFileExcel />,     label: "Excel",     color: "#1FA463", bg: "#1FA46318" },
  ppt:  { icon: <FaFilePowerpoint />,label: "PowerPoint",color: "#D24726", bg: "#D2472618" },
  pptx: { icon: <FaFilePowerpoint />,label: "PowerPoint",color: "#D24726", bg: "#D2472618" },
};

const DocumentMessage: React.FC<DocumentMessageProps> = ({
  message,
  fileExtension,
  fileName,
  isSender,
}) => {
  const localStorageKey = `downloaded_${fileName}`;
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setDownloaded(localStorage.getItem(localStorageKey) === "true");
  }, [localStorageKey]);

  const handleDownload = () => {
    setDownloaded(true);
    localStorage.setItem(localStorageKey, "true");
    window.open(message.media, "_blank");
  };

  const handleFileOpen = () => {
    window.open(getFilePreviewURL(message.media, fileExtension), "_blank");
  };

  const ext = fileExtension.toLowerCase();
  const config = fileTypeConfig[ext] || { icon: <FaFile />, label: "File", color: "#9CA3AF", bg: "#9CA3AF18" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: isSender ? "rgba(255,255,255,0.1)" : "#242424",
        border: isSender ? "1px solid rgba(255,255,255,0.15)" : "1px solid #2A2A2A",
        maxWidth: "280px",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isSender
          ? "rgba(255,255,255,0.18)"
          : "#2A2A2A";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isSender
          ? "rgba(255,255,255,0.1)"
          : "#242424";
      }}
    >
      {/* File icon badge */}
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "10px",
          background: isSender ? "rgba(255,255,255,0.2)" : config.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: isSender ? "#FFFFFF" : config.color,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      {/* Name + type */}
      <div style={{ flex: 1, minWidth: 0 }} onClick={handleFileOpen}>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: isSender ? "#FFFFFF" : "#F3F4F6",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={fileName}
        >
          {fileName}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "11px",
            color: isSender ? "rgba(255,255,255,0.6)" : "#6B7280",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {config.label}
          <FaExternalLinkAlt size={9} />
        </p>
      </div>

      {/* Download */}
      {!isSender && !downloaded && (
        <button
          onClick={handleDownload}
          style={{
            background: "none",
            border: "none",
            color: "#FF6B1A",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FF6B1A18")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
          title="Download"
        >
          <FaDownload size={15} />
        </button>
      )}
    </div>
  );
};

export default DocumentMessage;
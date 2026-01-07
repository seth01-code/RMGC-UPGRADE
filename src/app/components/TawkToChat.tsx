"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  const pathname = usePathname();
  const restrictedRoutes = ["/chat", "/login", "/register"];

  useEffect(() => {
    if (restrictedRoutes.includes(pathname)) return;
    if (document.getElementById("tawkScript")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawkScript";
    script.src = "https://embed.tawk.to/67c2fa8bce30551910366794/1il8q5cs8";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    // 🔥 FORCE LEFT POSITION WITH CSS
    const style = document.createElement("style");
    style.id = "tawkLeftFix";
    style.innerHTML = `
      iframe[src*="tawk.to"] {
        left: 20px !important;
        right: auto !important;
      }

      .tawk-button,
      .tawk-min-container {
        left: 20px !important;
        right: auto !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById("tawkScript")?.remove();
      document.getElementById("tawkLeftFix")?.remove();
    };
  }, [pathname]);

  return null;
};

export default TawkToChat;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const RESTRICTED_ROUTES = ["/chat", "/login", "/register"];

const TawkToChat = () => {
  const pathname = usePathname();

  useEffect(() => {
    const isRestricted = RESTRICTED_ROUTES.includes(pathname);

    if (window.Tawk_API?.hideWidget) {
      isRestricted
        ? window.Tawk_API.hideWidget()
        : window.Tawk_API.showWidget();
    }

    if (document.getElementById("tawkScript") || isRestricted) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawkScript";
    script.src = "https://embed.tawk.to/67c2fa8bce30551910366794/1il8q5cs8";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.id = "tawkLeftFix";
    style.innerHTML = `
      iframe[src*="tawk.to"] { left: 20px !important; right: auto !important; }
      .tawk-button, .tawk-min-container { left: 20px !important; right: auto !important; }
    `;
    document.head.appendChild(style);
  }, [pathname]);

  return null;
};

export default TawkToChat;

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Tawk_API?: unknown;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  const pathname = usePathname();
  const restrictedRoutes = ["/chat", "/login", "/register"];

  useEffect(() => {
    if (restrictedRoutes.includes(pathname)) return;
    if (document.getElementById("tawkScript")) return;

    // Initialize Tawk globals
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawkScript";
    script.src = "https://embed.tawk.to/67c2fa8bce30551910366794/1il8q5cs8";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    script.onload = () => {
      const waitForTawk = () => {
        if (!window.Tawk_API) return setTimeout(waitForTawk, 300);

        try {
          // Force widget to the LEFT
          window.Tawk_API.setPosition("left");
        } catch (err) {
          console.warn("Tawk API init failed:", err);
        }
      };

      waitForTawk();
    };

    return () => {
      document.getElementById("tawkScript")?.remove();
    };
  }, [pathname]);

  return null; // No custom button anymore
};

export default TawkToChat;

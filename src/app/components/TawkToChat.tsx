"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

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

    // Load script safely
    const script = document.createElement("script");
    script.id = "tawkScript";
    script.src = "https://embed.tawk.to/67c2fa8bce30551910366794/1il8q5cs8";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    // Ensure no style conflicts
    const css = document.createElement("style");
    css.innerHTML = `
      #tawkchat-minified-wrapper, #tawkchat-container {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    css.id = "tawkCustomHide";
    document.head.appendChild(css);

    script.onload = () => {
      const waitForTawk = () => {
        if (!window.Tawk_API) return setTimeout(waitForTawk, 500);

        try {
          // Hide default launcher permanently (but without breaking Tawk internals)
          window.Tawk_API.hideWidget();

          // Prevent default launcher from ever showing again
          window.Tawk_API.onLoad = function () {
            window.Tawk_API.hideWidget();
          };

          window.Tawk_API.onChatHidden = function () {
            window.Tawk_API.hideWidget();
            document
              .getElementById("customTawkButton")
              ?.classList.remove("hidden");
          };

          window.Tawk_API.onChatMinimized = function () {
            window.Tawk_API.hideWidget();
            document
              .getElementById("customTawkButton")
              ?.classList.remove("hidden");
          };

          window.Tawk_API.onChatMaximized = function () {
            document
              .getElementById("customTawkButton")
              ?.classList.add("hidden");
          };
        } catch (err) {
          console.warn("Tawk API init failed:", err);
        }
      };

      waitForTawk();
    };

    return () => {
      document.getElementById("tawkScript")?.remove();
      document.getElementById("tawkCustomHide")?.remove();
    };
  }, [pathname]);

  // Custom launcher logic
  const handleOpenChat = () => {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      alert(
        "Chat service is still loading. Please try again in a few seconds."
      );
    }
  };

  return (
    <button
      id="customTawkButton"
      onClick={handleOpenChat}
      aria-label="Chat with us"
      className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
    </button>
  );
};

export default TawkToChat;

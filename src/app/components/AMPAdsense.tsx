"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const AMPAdsense = () => {
  const pathname = usePathname();

  // ✅ Pages where ads should appear
  const allowedRoutes = ["/", "/admin", "/seller", "/about-us", "/login"];

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return;

    if (!allowedRoutes.includes(pathname)) {
      return; // Don't load ads on disallowed pages
    }

    // ✅ Add AMP auto-ads script once if not already loaded
    if (!document.querySelector('script[custom-element="amp-auto-ads"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("custom-element", "amp-auto-ads");
      script.src = "https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js";
      document.head.appendChild(script);
    }

    // ✅ Create amp-auto-ads element
    const ampAutoAds = document.createElement("amp-auto-ads");
    ampAutoAds.setAttribute("type", "adsense");
    ampAutoAds.setAttribute("data-ad-client", "ca-pub-8713973295876975");

    // ✅ Custom styling and control (optional enhancement)
    ampAutoAds.setAttribute("data-ad-frequency-hint", "45s"); // show ads roughly every 45s
    ampAutoAds.setAttribute("data-ad-format", "fluid");
    ampAutoAds.setAttribute("data-full-width-responsive", "true");

    // Append at top of <body>
    document.body.prepend(ampAutoAds);

    // ✅ Cleanup when navigating away
    return () => {
      if (document.body.contains(ampAutoAds)) {
        document.body.removeChild(ampAutoAds);
      }
    };
  }, [pathname]);

  return null; // No visible UI
};

export default AMPAdsense;

"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Fonts
import {
  Geist,
  Geist_Mono,
  Inter,
  Merriweather,
  Fira_Code,
} from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
});
const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

// Client wrappers
import ClientProviders from "./components/clientProviders";
import LayoutWrapper from "./components/LayoutWrapper";
import GlobalPreloader from "./components/preloaders/GlobalPreloader";
import CookiesConsent from "./components/CookiesConsent";
import TawkToChat from "./components/TawkToChat";
import AMPAdsense from "./components/AMPAdsense";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  // Initial load delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically set document title
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "RMGC - Renewed Minds Global Consult",
      "/login": "Login - RMGC",
      "/register": "Register - RMGC",
      "/seller": "Seller Dashboard - RMGC",
      "/chat": "Chat - RMGC",
      "/organization/dashboard": "Organization - RMGC",
      "/organization/billing": "Billing & Subscription - RMGC",
      "/organization/settings": "Organization Settings - RMGC",
      "/organization/jobs/new": "Post a Job - RMGC",
      "/organization/jobs": "Job List - RMGC",
      "/organization/applicants": "List Of Applicants - RMGC",
      "/gigs": "Explore Gigs - RMGC",
      "/post-gig": "Post a Gig - RMGC",
      "/faqs": "FAQs - RMGC",
      "/contact": "Contact Us - RMGC",
      "/about": "About Us - RMGC",
      "/pay-org": "Organization Payment - RMGC",
      "/org-processing": "Processing Payment - RMGC",
      "/remote/dashboard": "Remote Worker Dashboard - RMGC",
      "/remote/jobs": "Remote Jobs - RMGC",
      "/remote/applications": "My Applications - RMGC",
      "/remote/profile": "My Profile - RMGC",
      "/remote/billing": "Billing & Subscription - RMGC",
      "/payment/remote-vip": "Remote Worker VIP Subscription - RMGC",
      "/payment/freelancers": "Freelancer Payment - RMGC",
      "/payment/freelancers/success": "Freelancer Payment Success - RMGC",
    };

    const dynamicRoutes: [RegExp, string][] = [
      [/^\/gigdetails\/.+$/, "Gig Details - RMGC"],
      [/^\/pay\/.+$/, "Payment - RMGC"],
      [/^\/seller\/profile-edit$/, "Edit Profile - RMGC"],
    ];

    let title = routeTitles[pathname] || "RMGC - Renewed Minds Global Consult";

    for (const [regex, dynamicTitle] of dynamicRoutes) {
      if (regex.test(pathname)) {
        title = dynamicTitle;
        break;
      }
    }

    document.title = title;
  }, [pathname]);

  // ✅ Send page_view event to GTM on every route change
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "page_view",
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  return (
    <html lang="en">
      {/* ✅ Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-K7DXXWKT');
        `}
      </Script>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${merriweather.variable} ${firaCode.variable} antialiased`}
      >
        {!isLoaded ? (
          <GlobalPreloader />
        ) : (
          <ClientProviders>
            <ToastContainer position="top-right" autoClose={3000} />
            <LayoutWrapper>{children}</LayoutWrapper>
            <CookiesConsent />
            <TawkToChat />
            {/* <AMPAdsense /> */}
          </ClientProviders>
        )}

        {/* ✅ GTM no-script fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K7DXXWKT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}

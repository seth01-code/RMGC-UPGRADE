/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
// import { Toaster } from "sonner";

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
  weight: ["400", "700"],
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

// ── Route → { title, description } map ──────────────────────────────────────
const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "RMGC — Renewed Minds Global Consult",
    description:
      "Connect with top freelancers, remote workers, and organizations worldwide on Renewed Minds Global Consult — Africa's trusted talent platform.",
  },
  "/login": {
    title: "Sign In — RMGC",
    description:
      "Sign in to your RMGC account to access freelance gigs, remote jobs, and your dashboard.",
  },
  "/register": {
    title: "Create Account — RMGC",
    description:
      "Join RMGC for free. Hire talent, find remote work, or offer your freelance services globally.",
  },
  "/seller": {
    title: "Seller Dashboard — RMGC",
    description:
      "Manage your gigs, orders, and earnings on your RMGC seller dashboard.",
  },
  "/chat": {
    title: "Messages — RMGC",
    description: "Chat with clients and freelancers on RMGC.",
  },
  "/organization/dashboard": {
    title: "Organization Dashboard — RMGC",
    description:
      "Manage your organization's jobs, applicants, and subscription on RMGC.",
  },
  "/organization/billing": {
    title: "Billing & Subscription — RMGC",
    description:
      "Manage your organization's billing and VIP subscription on RMGC.",
  },
  "/organization/settings": {
    title: "Organization Settings — RMGC",
    description: "Update your organization profile and settings on RMGC.",
  },
  "/organization/jobs/new": {
    title: "Post a Job — RMGC",
    description:
      "Post a new job listing and find the best remote talent on RMGC.",
  },
  "/organization/jobs": {
    title: "Job Listings — RMGC",
    description: "View and manage your organization's job listings on RMGC.",
  },
  "/organization/applicants": {
    title: "Applicants — RMGC",
    description: "Review and manage applicants for your job listings on RMGC.",
  },
  "/gigs": {
    title: "Explore Gigs — RMGC",
    description:
      "Browse hundreds of freelance gigs across design, development, marketing, and more on RMGC.",
  },
  "/freelancers": {
    title: "Freelancer Profiles — RMGC",
    description:
      "Browse verified freelancer profiles and hire top talent for your next project on RMGC.",
  },
  "/post-gig": {
    title: "Post a Gig — RMGC",
    description: "Create and publish a new freelance gig on RMGC.",
  },
  "/faqs": {
    title: "FAQs — RMGC",
    description:
      "Find answers to frequently asked questions about RMGC's platform, payments, and services.",
  },
  "/contact": {
    title: "Contact Us — RMGC",
    description:
      "Get in touch with the RMGC support team for help or inquiries.",
  },
  "/about": {
    title: "About Us — RMGC",
    description:
      "Learn more about Renewed Minds Global Consult — our mission, team, and vision.",
  },
  "/pay-org": {
    title: "Organization Payment — RMGC",
    description: "Complete your organization subscription payment on RMGC.",
  },
  "/org-processing": {
    title: "Processing Payment — RMGC",
    description: "Your payment is being processed. Please wait.",
  },
  "/remote/dashboard": {
    title: "Remote Worker Dashboard — RMGC",
    description:
      "Track your remote job applications and manage your RMGC remote worker profile.",
  },
  "/remote/jobs": {
    title: "Remote Jobs — RMGC",
    description: "Browse and apply for remote job opportunities on RMGC.",
  },
  "/remote/applications": {
    title: "My Applications — RMGC",
    description: "Track the status of your remote job applications on RMGC.",
  },
  "/remote/profile": {
    title: "My Profile — RMGC",
    description: "View and update your RMGC remote worker profile.",
  },
  "/remote/billing": {
    title: "Billing & Subscription — RMGC",
    description: "Manage your RMGC remote worker VIP subscription and billing.",
  },
  "/payment/remote-vip": {
    title: "Remote Worker VIP Subscription — RMGC",
    description:
      "Upgrade to VIP on RMGC for exclusive remote job access and priority placement.",
  },
  "/payment/freelancers": {
    title: "Freelancer Payment — RMGC",
    description: "Complete your freelancer subscription payment on RMGC.",
  },
  "/payment/freelancers/success": {
    title: "Payment Successful — RMGC",
    description:
      "Your freelancer payment was successful. Welcome to RMGC premium.",
  },
};

const DYNAMIC_ROUTES: [RegExp, { title: string; description: string }][] = [
  [
    /^\/gigdetails\/.+$/,
    {
      title: "Gig Details — RMGC",
      description:
        "View full details, pricing, and reviews for this freelance gig on RMGC.",
    },
  ],
  [
    /^\/pay\/.+$/,
    {
      title: "Payment — RMGC",
      description: "Securely complete your payment on RMGC.",
    },
  ],
  [
    /^\/seller\/profile-edit$/,
    {
      title: "Edit Profile — RMGC",
      description:
        "Update your RMGC freelancer profile, skills, and portfolio.",
    },
  ],
  [
    /^\/freelancer\/.+$/,
    {
      title: "Freelancer Profile — RMGC",
      description:
        "View this freelancer's verified portfolio, skills, and gigs on RMGC.",
    },
  ],
];

const DEFAULT_META = {
  title: "RMGC — Renewed Minds Global Consult",
  description:
    "Renewed Minds Global Consult — connecting freelancers, remote workers, and organizations across Africa and beyond.",
};

function getRouteMeta(pathname: string) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  for (const [regex, meta] of DYNAMIC_ROUTES) {
    if (regex.test(pathname)) return meta;
  }
  return DEFAULT_META;
}
// ────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // SEO — set title + meta description on every route change
  useEffect(() => {
    const { title, description } = getRouteMeta(pathname);

    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // Open Graph
    const setOG = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[property="${property}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setOG("og:title", title);
    setOG("og:description", description);
    setOG("og:type", "website");
    setOG("og:url", `https:www.//renewedmindsglobalconsult.com${pathname}`);
    setOG("og:image", "https:www.//renewedmindsglobalconsult.com/og-image.png");

    // Twitter card
    const setTwitter = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setTwitter("twitter:card", "summary_large_image");
    setTwitter("twitter:title", title);
    setTwitter("twitter:description", description);
    setTwitter(
      "twitter:image",
      "https:www.//renewedmindsglobalconsult.com/og-image.png",
    );

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https:www.//renewedmindsglobalconsult.com${pathname}`;
  }, [pathname]);

  // GTM page_view
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
      {/* Google Tag Manager */}
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

      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${merriweather.variable} ${firaCode.variable} antialiased`}
      >
        {!isLoaded ? (
          <GlobalPreloader />
        ) : (
          <ClientProviders>
            <LayoutWrapper>{children}</LayoutWrapper>
            <CookiesConsent />
            <TawkToChat />
          </ClientProviders>
        )}

        {/* Sonner toast portal */}
        {/* <Toaster position="top-right" richColors closeButton /> */}

        {/* GTM no-script fallback */}
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

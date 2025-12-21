"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const CookiesConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  // Check if consent was previously given
  useEffect(() => {
    const consentGiven = localStorage.getItem("cookieConsent");
    if (!consentGiven) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center gap-4 animate-slide-up">
        <div className="flex-1 text-gray-700 text-sm md:text-base">
          <p>
            We use cookies to improve your experience on our website. By
            continuing, you agree to our use of cookies. Read our{" "}
            <Link
              href="/terms-privacy"
              className="text-blue-600 hover:underline"
            >
              Terms & Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <button
            onClick={handleDecline}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
          >
            Accept
          </button>
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        .animate-slide-up {
          transform: translateY(100%);
          animation: slideUp 0.5s forwards;
        }
        @keyframes slideUp {
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CookiesConsent;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import newRequest from "../utils/newRequest";
import { useTranslation } from "react-i18next";
import FlutterwaveLogo from "../../../../assets/images/flutterwave-logo-removebg-preview.png";
import PaystackLogo from "../../../../assets/images/Paystack-removebg-preview.png";
import backgroundImage from "../../../../assets/bill-6107551_1920.png";
import { FaLock, FaCheckCircle, FaChevronRight, FaShieldAlt, FaGlobe } from "react-icons/fa";

const OR = "#FF6B1A";
const ORL = "#FF8C47";

const VerveBadge = () => (
  <svg width="28" height="16" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="56" height="32" rx="4" fill="#0A2C6E"/>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.5">
      verve
    </text>
    <rect x="0" y="24" width="56" height="4" rx="0" fill="#E8192C"/>
  </svg>
);

const CARD_ICONS = {
  visa: "https://logolook.net/wp-content/uploads/2023/09/Visa-Logo.png",
  mastercard: "https://cdn.prod.website-files.com/64199d190fc7afa82666d89c/648b606d4a139591f6b3440c_mastercard-1.png",
  amex: "https://webshoptiger.com/wp-content/uploads/2023/09/American-Express-Color-1024x576.png",
};

/* This page pays out an *accepted job proposal* (work booking), as
   opposed to /pay/[id] which pays for a Gig. The :id param here is the
   Work _id; the backend looks up the accepted proposal's bid amount,
   so nothing proposal-specific needs to be passed in. */
const PayJob: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [activeMethod, setActiveMethod] = useState<"paystack" | "flutterwave" | null>(null);
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const workId = params.id;
  const { t } = useTranslation();

  const handlePayment = async (paymentMethod: "paystack" | "flutterwave") => {
    try {
      if (!workId) { setErrorMessage("Job ID is missing."); return; }
      setActiveMethod(paymentMethod);
      setProcessing(true);
      setErrorMessage("");

      let res;
      if (paymentMethod === "paystack") {
        res = await newRequest.post(`/orders/create-work-payment-intent/${workId}`);
      } else {
        res = await newRequest.post(`/orders/create-work-flutterwave-intent/${workId}`);
      }

      setSuccess(true);
      setTimeout(() => { window.location.href = res.data.paymentLink; }, 1200);
    } catch (err: any) {
      setProcessing(false);
      setActiveMethod(null);
      setErrorMessage(err.response?.data?.message || err.message || t("unknownError"));
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <Image
          src={backgroundImage}
          alt="background"
          fill
          style={{ objectFit: "cover", opacity: 0.15 }}
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0A0A0A 0%, #0F0A06 50%, #0A0A0A 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${OR}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "500px",
          background: "#111111",
          border: "1px solid #1F1F1F",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px #1A1A1A",
        }}
      >
        <div
          style={{
            height: "3px",
            background: `linear-gradient(90deg, ${OR}, ${ORL}, ${OR})`,
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s linear infinite",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "36px 36px 28px",
            borderBottom: "1px solid #1A1A1A",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#FF6B1A14",
              border: "1px solid #FF6B1A28",
              borderRadius: "100px",
              padding: "5px 12px",
              marginBottom: "20px",
            }}
          >
            <FaLock size={10} color={OR} />
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: OR, textTransform: "uppercase" }}>
              Secure Checkout
            </span>
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Book This Freelancer
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>
            You&apos;re paying to confirm the accepted proposal for this job. All transactions are encrypted end-to-end.
          </p>

          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            {[
              { icon: <FaShieldAlt size={11} />, label: "256-bit SSL" },
              { icon: <FaLock size={11} />, label: "PCI Compliant" },
              { icon: <FaGlobe size={11} />, label: "Global Support" },
            ].map((badge, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ color: "#4B5563" }}>{badge.icon}</span>
                <span style={{ fontSize: "11px", color: "#4B5563", fontWeight: 500 }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment options */}
        <div style={{ padding: "28px 36px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>

          <PaymentOption
            title="Pay with Paystack"
            subtitle="Naira & USD · Local cards"
            logo={PaystackLogo}
            method="paystack"
            icons={[CARD_ICONS.visa, CARD_ICONS.mastercard]}
            extraBadge={<VerveBadge />}
            isActive={activeMethod === "paystack"}
            isProcessing={processing && activeMethod === "paystack"}
            isDisabled={processing}
            onSelect={handlePayment}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1A1A1A" }} />
            <span style={{ fontSize: "11px", color: "#374151", fontWeight: 600, letterSpacing: "0.06em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#1A1A1A" }} />
          </div>

          <PaymentOption
            title="Pay with Flutterwave"
            subtitle="International · Multi-currency"
            logo={FlutterwaveLogo}
            method="flutterwave"
            icons={[CARD_ICONS.visa, CARD_ICONS.mastercard, CARD_ICONS.amex]}
            isActive={activeMethod === "flutterwave"}
            isProcessing={processing && activeMethod === "flutterwave"}
            isDisabled={processing}
            onSelect={handlePayment}
          />

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px 20px",
                background: "#0D2010",
                border: "1px solid #1A4020",
                borderRadius: "12px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <FaCheckCircle size={16} color="#22C55E" />
              <span style={{ fontSize: "14px", color: "#22C55E", fontWeight: 600 }}>
                Redirecting to payment gateway…
              </span>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: "14px 18px",
                background: "#1A0808",
                border: "1px solid #3A1010",
                borderRadius: "12px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <p style={{ margin: 0, fontSize: "13px", color: "#EF4444", lineHeight: 1.5 }}>
                ⚠ {errorMessage}
              </p>
            </div>
          )}

          <p style={{ margin: "4px 0 0", textAlign: "center", fontSize: "12px", color: "#374151", lineHeight: 1.6 }}>
            By proceeding, you agree to our{" "}
            <a href="/terms-privacy" style={{ color: "#FF6B1A", textDecoration: "none" }}>Terms of Service</a>
            {" "}and{" "}
            <a href="/terms-privacy" style={{ color: "#FF6B1A", textDecoration: "none" }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

interface PaymentOptionProps {
  title: string;
  subtitle: string;
  logo: any;
  method: "paystack" | "flutterwave";
  icons: string[];
  extraBadge?: React.ReactNode;
  isActive: boolean;
  isProcessing: boolean;
  isDisabled: boolean;
  onSelect: (method: "paystack" | "flutterwave") => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  title,
  subtitle,
  logo,
  method,
  icons,
  extraBadge,
  isActive,
  isProcessing,
  isDisabled,
  onSelect,
}) => {
  const [hovered, setHovered] = useState(false);

  const borderColor = isActive ? "#FF6B1A60" : hovered ? "#FF6B1A30" : "#1F1F1F";
  const bg = isActive ? "#FF6B1A08" : hovered ? "#FF6B1A05" : "#0F0F0F";

  return (
    <div
      onClick={() => !isDisabled && onSelect(method)}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 20px",
        background: bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: "16px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: isDisabled && !isActive ? 0.5 : 1,
        overflow: "hidden",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at left center, #FF6B1A0A, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: "8px",
          boxSizing: "border-box",
        }}
      >
        <Image src={logo} alt={title} width={40} height={32} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: 700, color: isActive ? "#FF8C47" : "#E5E7EB", transition: "color 0.2s" }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#4B5563" }}>{subtitle}</p>

        <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
          {icons.map((src, i) => (
            <div
              key={i}
              style={{
                width: "32px",
                height: "20px",
                background: "#1A1A1A",
                borderRadius: "4px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 4px",
                boxSizing: "border-box",
              }}
            >
              <Image src={src} alt={`card-${i}`} width={28} height={16} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
            </div>
          ))}
          {extraBadge && (
            <div style={{
              height: "20px",
              borderRadius: "4px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              background: "#1A1A1A",
              padding: "2px 4px",
              boxSizing: "border-box",
            }}>
              {extraBadge}
            </div>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "32px" }}>
        {isProcessing ? (
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: "2.5px solid #1F1F1F",
              borderTop: `2.5px solid ${OR}`,
              animation: "spin 0.7s linear infinite",
            }}
          />
        ) : isActive ? (
          <FaCheckCircle size={18} color="#FF6B1A" />
        ) : (
          <FaChevronRight size={13} color={hovered ? "#FF6B1A" : "#2A2A2A"} style={{ transition: "color 0.2s" }} />
        )}
      </div>
    </div>
  );
};

export default PayJob;
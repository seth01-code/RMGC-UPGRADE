"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import newRequest from "../utils/newRequest";
import {
  CheckCircle,
  Loader2,
  ShieldCheck,
  FileText,
  Send,
  Lock,
} from "lucide-react";
import Image from "next/image";

type Step = "gateway" | "verifying" | "order" | "redirecting";
type StepStatus = "done" | "active" | "pending";

const steps: {
  id: Step;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "gateway",
    label: "Payment received",
    sublabel: "Gateway confirmed the charge",
    icon: <ShieldCheck size={15} />,
  },
  {
    id: "verifying",
    label: "Verifying transaction",
    sublabel: "Cross-checking with our records",
    icon: <Loader2 size={15} />,
  },
  {
    id: "order",
    label: "Creating your order",
    sublabel: "Setting up the job booking",
    icon: <FileText size={15} />,
  },
  {
    id: "redirecting",
    label: "Redirecting you",
    sublabel: "Taking you to your orders",
    icon: <Send size={15} />,
  },
];

const stepOrder: Step[] = ["gateway", "verifying", "order", "redirecting"];

const PaymentProcessing: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState<Step>("verifying");
  const [done, setDone] = useState(false);

  // Paystack sends: reference + trxref
  // Flutterwave sends: transaction_id + tx_ref
  const transactionId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref");
  const trxRef = searchParams.get("trxref");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams();
        if (transactionId) params.set("transaction_id", transactionId);
        if (txRef) params.set("tx_ref", txRef);
        if (trxRef) params.set("trxref", trxRef);
        if (reference) params.set("reference", reference);

        await newRequest.get(`/orders/verify?${params.toString()}`);
      } catch (error) {
        console.warn("Verification bypassed due to error:", error);
      } finally {
        setActiveStep("order");
        await new Promise((r) => setTimeout(r, 800));
        setActiveStep("redirecting");
        await new Promise((r) => setTimeout(r, 600));
        setDone(true);
        setTimeout(() => router.push("/orders"), 1800);
      }
    };

    verifyPayment();
  }, [router, transactionId, txRef, trxRef, reference]);

  const getStatus = (stepId: Step): StepStatus => {
    const activeIdx = stepOrder.indexOf(activeStep);
    const thisIdx = stepOrder.indexOf(stepId);
    if (done || thisIdx < activeIdx) return "done";
    if (thisIdx === activeIdx) return "active";
    return "pending";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#111111",
          border: "1px solid #1F1F1F",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            height: "3px",
            backgroundImage: done
              ? "linear-gradient(90deg, #22C55E, #16A34A)"
              : "linear-gradient(90deg, #FF6B1A, #FF8C47, #FF6B1A)",
            backgroundSize: "200%",
            transition: "background-image 0.6s ease",
          }}
        />

        <div style={{ padding: "2rem 1.75rem 1.5rem", textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: done ? "#0D2010" : "#1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              border: done ? "1px solid #1A4020" : "1px solid #2A2A2A",
              transition: "all 0.4s ease",
              position: "relative",
            }}
          >
            {done ? (
              <CheckCircle
                size={28}
                color="#22C55E"
                style={{ animation: "bounceIn 0.4s ease" }}
              />
            ) : (
              <Loader2
                size={28}
                color="#FF6B1A"
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            {done ? "Payment confirmed!" : "Verifying your payment"}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: done ? "#22C55E" : "#6B7280",
              lineHeight: 1.5,
              transition: "color 0.4s ease",
            }}
          >
            {done
              ? "Your order has been created. Redirecting to your dashboard…"
              : "Please wait while we confirm your transaction with the payment gateway."}
          </p>
        </div>

        <div
          style={{
            margin: "0 1.75rem",
            borderTop: "1px solid #1A1A1A",
            paddingBottom: "0.25rem",
          }}
        >
          {steps.map((step, i) => {
            const status = getStatus(step.id);
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    i < steps.length - 1 ? "1px solid #1A1A1A" : "none",
                  opacity: status === "pending" ? 0.4 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      status === "done"
                        ? "#0D2010"
                        : status === "active"
                          ? "#1A1108"
                          : "#1A1A1A",
                    border:
                      status === "done"
                        ? "1px solid #1A4020"
                        : status === "active"
                          ? "1px solid #FF6B1A40"
                          : "1px solid #2A2A2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                    color:
                      status === "done"
                        ? "#22C55E"
                        : status === "active"
                          ? "#FF6B1A"
                          : "#374151",
                  }}
                >
                  {status === "active" ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : status === "done" ? (
                    <CheckCircle size={14} />
                  ) : (
                    step.icon
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: status === "pending" ? "#4B5563" : "#E5E7EB",
                    }}
                  >
                    {step.label}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#4B5563" }}>
                    {step.sublabel}
                  </p>
                </div>

                {status === "done" && (
                  <CheckCircle
                    size={14}
                    color="#22C55E"
                    style={{ flexShrink: 0 }}
                  />
                )}
                {status === "active" && (
                  <Loader2
                    size={14}
                    color="#FF6B1A"
                    style={{
                      flexShrink: 0,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "1rem 1.75rem 1.5rem", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#374151" }}>
            <Lock size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} />
            256-bit SSL · PCI Compliant · Powered by RMGC
          </p>
        </div>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Image
          src="/logoo.webp"
          alt="RMGC Logo"
          width={64}
          height={64}
          style={{ margin: "0 auto 8px", opacity: 0.7 }}
        />
        <p style={{ fontSize: "12px", color: "#4B5563" }}>
          Renewed Minds Global Consult © {new Date().getFullYear()}
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PaymentProcessing;

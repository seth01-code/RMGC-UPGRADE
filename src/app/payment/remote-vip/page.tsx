"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Info } from "lucide-react";
import newRequest from "../../utils/newRequest";
import getSubscriptionRoute from "../../utils/getSubscriptionRouteTwo";

// FIXED PRICES
const FIXED_PRICES: Record<string, string> = {
  NGN: "₦12,000", // 10k base + 2k processing
  USD: "$30",
  GBP: "£25",
  EUR: "€25",
};

// Breakdown for NGN only
const NGN_BREAKDOWN = {
  base: "₦10,000",
  fee: "₦2,000",
};

const RemoteWorkerPaymentPage: React.FC = () => {
  const [country, setCountry] = useState<string>("Nigeria");
  const [currency, setCurrency] = useState<string>("NGN");
  const [priceDisplay, setPriceDisplay] = useState(FIXED_PRICES["NGN"]);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const data = await ipRes.json();
        setCountry(data?.country_name || "Nigeria");

        const detectedCurrency = data?.currency || "NGN";
        const supportedCurrencies = ["NGN", "USD", "GBP", "EUR"];

        if (supportedCurrencies.includes(detectedCurrency)) {
          setCurrency(detectedCurrency);
          setPriceDisplay(FIXED_PRICES[detectedCurrency]);
        } else {
          setCurrency("NGN");
          setPriceDisplay(FIXED_PRICES["NGN"]);
        }
      } catch (err) {
        console.error("🌍 Currency detection failed", err);
        setCurrency("NGN");
        setPriceDisplay(FIXED_PRICES["NGN"]);
      }
    };

    detectCurrency();
  }, []);

  const handleProceedPayment = async () => {
    try {
      const route = getSubscriptionRoute(currency);
      const res = await newRequest.post(route, { role: "remote_worker" });

      if (res.data.checkoutLink) {
        window.location.href = res.data.checkoutLink;
      } else {
        alert("Unable to initialize payment");
      }
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6 text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg"
      >
        {/* Header */}
        <div className="text-center border-b border-gray-800 py-6 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <h1 className="text-3xl font-extrabold text-orange-500 tracking-tight">
            Remote Worker VIP Plan
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Unlock full access to premium remote jobs and features.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center py-10 space-y-8 px-6">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2 className="text-5xl font-extrabold text-orange-400 drop-shadow-md">
              {priceDisplay}
            </h2>

            {currency === "NGN" ? (
              <p className="text-gray-400 mt-2 text-sm">
                Base fee: {NGN_BREAKDOWN.base} + Processing fee:{" "}
                {NGN_BREAKDOWN.fee} <br />
                Fixed price — includes VAT and yearly renewal.
              </p>
            ) : (
              <p className="text-gray-400 mt-2 text-sm">
                Fixed price — includes VAT and yearly renewal.
              </p>
            )}
          </motion.div>

          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <span>Secure recurring billing</span>
          </div>

          {/* Card Safety & Recommendations */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 mt-4 w-full">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-orange-400">
                Card Safety & Recommendations
              </h3>
            </div>

            <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <li>• Use a card that supports online recurring billing.</li>
              <li>• Ensure your card is enabled for international payments.</li>
              <li>
                • Make sure your card has sufficient balance for auto-renewal.
              </li>
              <li>
                • Flutterwave uses bank-grade security. RMGC never sees full
                card details.
              </li>
              <li>
                • You can cancel auto-renewal anytime, access continues until
                expiry.
              </li>
              <li>
                • Flutterwave may charge a small processing fee (separate from
                RMGC).
              </li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceedPayment}
            className="w-full mt-4 py-3 px-6 flex items-center justify-center bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Payment
          </motion.button>

          <p className="text-xs text-gray-600 mt-4 italic text-center">
            Detected location:{" "}
            <span className="text-orange-400">{country}</span>
          </p>
        </div>

        <div className="text-center py-4 border-t border-gray-800 text-xs text-gray-600">
          © {new Date().getFullYear()} RMGC. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default RemoteWorkerPaymentPage;

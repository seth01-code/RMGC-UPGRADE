"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Info } from "lucide-react";
import newRequest from "../../utils/newRequest";
import getSubscriptionRoute from "../../utils/getSubscriptionRouteTwo";

// FIXED PRICES (VAT INCLUDED)
const FIXED_PRICES: Record<string, string> = {
  NGN: "₦12,000",
  USD: "$30",
  GBP: "£25",
  EUR: "€25",
};

const RemoteWorkerPaymentPage: React.FC = () => {
  const [country, setCountry] = useState<string>("Nigeria");
  const [currencyCode, setCurrencyCode] = useState<string>("NGN");
  const [convertedPrice, setConvertedPrice] = useState<string>("₦12,000");

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const data = await ipRes.json();

        const detectedCurrency = data?.currency || "NGN";
        setCountry(data?.country_name || "Nigeria");

        // We only support these four currencies
        const supportedCurrencies = ["NGN", "USD", "GBP", "EUR"];

        if (supportedCurrencies.includes(detectedCurrency)) {
          setCurrencyCode(detectedCurrency);
          setConvertedPrice(FIXED_PRICES[detectedCurrency]);
        } else {
          // fallback to NGN
          setCurrencyCode("NGN");
          setConvertedPrice(FIXED_PRICES["NGN"]);
        }
      } catch (err) {
        console.error("🌍 Currency detection failed", err);
        setCurrencyCode("NGN");
        setConvertedPrice(FIXED_PRICES["NGN"]);
      }
    };

    detectCurrency();
  }, []);

  const handleProceedPayment = async () => {
    try {
      const route = getSubscriptionRoute(currencyCode); // Ensure this returns remote worker route
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
              {convertedPrice}
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Fixed price — includes VAT and yearly renewal.
            </p>
          </motion.div>

          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <span>Secure recurring billing</span>
          </div>

          {/* Card Safety & Recommendation Notice */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 mt-4 w-full">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-orange-400">
                Card Safety & Recommendations
              </h3>
            </div>

            <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <li>
                • Use a **card that supports online recurring billing** (most
                banks and fintech cards work with Flutterwave).
              </li>
              <li>
                • Make sure your card is **enabled for international payments**,
                especially if you're paying in USD, GBP, or EUR.
              </li>
              <li>
                • For auto-renewal, ensure your card has **sufficient balance**
                during the renewal period so your subscription doesn’t pause.
              </li>
              <li>
                • Flutterwave uses **bank-grade security**, and your full card
                details are never exposed to RMGC.
              </li>
              <li>
                • You can cancel auto-renewal anytime through your dashboard,
                and you’ll still keep access until your current plan expires.
              </li>
              <li>
                • Flutterwave may apply a small processing fee depending on your
                card issuer or currency. This fee is charged by Flutterwave, not
                RMGC.
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

"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import OrganizationPaymentForm from "../components/PaymentForm/OrganizationPaymentForm";

const OrgPayPage: React.FC = () => {
  const params = useSearchParams();
  const country = params.get("country") ?? "Nigeria";
  const basePrice = Number(params.get("price") ?? "50000");
  const currency = params.get("currency") ?? "₦";

  // Add 7.5% to the base price
  const totalPrice = basePrice + basePrice * 0.075;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-6xl grid md:grid-cols-2 gap-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-lg"
      >
        {/* 🧾 Left: Billing Summary */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-orange-500 border-b border-gray-800 pb-3">
            Billing Summary
          </h2>

          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-semibold text-orange-400">
                Organization Plan
              </span>
            </div>
            <div className="flex justify-between">
              <span>Detected Country:</span>
              <span>{country}</span>
            </div>
            <div className="flex justify-between">
              <span>Billing Cycle:</span>
              <span>Yearly</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-orange-400 border-t border-gray-800 pt-3">
              <span>Total:</span>
              <span>
                {currency}
                {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mt-6">
            <ShieldCheck className="w-5 h-5 text-orange-500 mr-2" />
            Your payment is protected with 256-bit encryption.
          </div>
        </div>

        {/* 💳 Right: Payment Form */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-orange-500 border-b border-gray-800 pb-3">
            Payment Details
          </h2>

          <OrganizationPaymentForm />
        </div>
      </motion.div>
    </div>
  );
};

export default OrgPayPage;

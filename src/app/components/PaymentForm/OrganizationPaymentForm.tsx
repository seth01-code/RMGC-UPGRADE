"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import newRequest from "../../utils/newRequest";
import { toast } from "react-toastify";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
import Image from "next/image";

const OrganizationPaymentForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [flwRef, setFlwRef] = useState<string | null>(null);
  const [step, setStep] = useState<"card" | "pin" | "otp">("card");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // ✅ Format card number as "1234 5678 9012 3456"
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "") // remove non-digits
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  // ✅ Format expiry date as "MM / YY"
  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, "") // remove non-digits
      .replace(/^(\d{2})(\d{1,2})?$/, (_match, m1, m2) =>
        m2 ? `${m1} / ${m2}` : m1
      )
      .trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === "cardNumber") formattedValue = formatCardNumber(value);
    if (name === "expiry") formattedValue = formatExpiry(value);

    setForm({ ...form, [name]: formattedValue });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [month, year] = form.expiry.replace(/\s/g, "").split("/");
      const res = await newRequest.post("/payments/organization/subscribe", {
        ...form,
        expiryMonth: month?.trim(),
        expiryYear: year?.trim(),
      });

      if (res.data.requiresPin) {
        setFlwRef(res.data.flwRef);
        setStep("pin");
      } else if (res.data.requiresOtp) {
        setFlwRef(res.data.flwRef);
        setStep("otp");
      } else {
        toast.success("Payment initiated, verifying...");
        router.push(`/org-processing?tx_ref=${res.data.tx_ref}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    try {
      const res = await newRequest.post("/payments/organization/submit-pin", {
        flwRef,
        pin,
      });
      if (res.data.requiresOtp) {
        toast.info("OTP sent to your phone/email");
        setStep("otp");
      }
    } catch {
      toast.error("PIN validation failed");
    }
  };

  const handleOtpSubmit = async () => {
    try {
      await newRequest.post("/payments/organization/validate-otp", {
        flwRef,
        otp,
      });
      toast.success("Subscription activated 🎉");
      router.push("/org-processing");
    } catch {
      toast.error("OTP validation failed ❌");
    }
  };

  return (
    <motion.div
      layout
      className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-lg text-gray-200"
    >
      <AnimatePresence mode="wait">
        {step === "card" && (
          <motion.form
            key="card"
            layout
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* 💳 Card Display */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-950 p-5 rounded-xl border border-gray-700 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  Organization Plan
                </span>
                <CreditCard className="text-orange-500 w-5 h-5" />
              </div>

              <div className="space-y-4">
                <input
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  onChange={handleChange}
                  value={form.cardNumber}
                  maxLength={19}
                  className="w-full bg-transparent border-b border-gray-600 text-xl tracking-widest placeholder-gray-500 outline-none focus:border-orange-500 transition-all duration-300"
                  required
                />
                <div className="flex justify-between">
                  <input
                    name="expiry"
                    placeholder="MM / YY"
                    onChange={handleChange}
                    value={form.expiry}
                    maxLength={7}
                    className="bg-transparent w-1/2 border-b border-gray-600 text-sm placeholder-gray-500 outline-none focus:border-orange-500 transition-all duration-300"
                    required
                  />
                  <input
                    name="cvv"
                    placeholder="CVV"
                    type="password"
                    onChange={handleChange}
                    value={form.cvv}
                    maxLength={4}
                    className="bg-transparent w-1/3 text-right border-b border-gray-600 text-sm placeholder-gray-500 outline-none focus:border-orange-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4 text-xs text-gray-400">
                <span>{form.fullName || "CARDHOLDER NAME"}</span>
                <Image
                  src="/cards/mastercard.svg"
                  alt="Card"
                  width={40}
                  height={24}
                  className="opacity-70"
                />
              </div>
            </div>

            {/* Name + Email */}
            <div>
              <label className="text-sm text-gray-400">Full Name</label>
              <input
                name="fullName"
                placeholder="John Doe"
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-lg outline-none border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Email</label>
              <input
                name="email"
                type="email"
                placeholder="example@email.com"
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-lg outline-none border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-lg text-white flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500"
              } transition-all duration-300`}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Pay ₦50,000 <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* 🔒 PIN Step */}
        {step === "pin" && (
          <motion.div
            key="pin"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5 text-center"
          >
            <Lock className="w-12 h-12 text-orange-500 mx-auto" />
            <h3 className="text-lg font-semibold">Enter Your Card PIN</h3>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 text-center text-lg tracking-widest outline-none focus:border-orange-500 transition-all"
              placeholder="****"
            />
            <button
              onClick={handlePinSubmit}
              className="btn-orange w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-semibold"
            >
              Submit PIN
            </button>
          </motion.div>
        )}

        {/* 🔐 OTP Step */}
        {step === "otp" && (
          <motion.div
            key="otp"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5 text-center"
          >
            <ShieldIcon />
            <h3 className="text-lg font-semibold text-orange-400">
              Enter OTP to Confirm Payment
            </h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 text-center text-lg tracking-widest outline-none focus:border-orange-500 transition-all"
              placeholder="Enter OTP"
            />
            <button
              onClick={handleOtpSubmit}
              className="w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-semibold text-white"
            >
              Validate OTP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ShieldIcon = () => (
  <div className="flex justify-center">
    <div className="p-3 bg-orange-600/20 rounded-full border border-orange-600/30">
      <Lock className="w-6 h-6 text-orange-500" />
    </div>
  </div>
);

export default OrganizationPaymentForm;

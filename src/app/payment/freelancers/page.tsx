"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import newRequest from '../../utils/newRequest';

const FreelancePaymentPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (e) setEmail(e);
  }, []);

  const handlePayNow = async () => {
    if (!email) return alert("Email is required");

    setLoading(true);
    try {
      const res = await newRequest.post("/flutterwave", { email });
      setPaymentLink(res.data.paymentLink);

      // Open Flutterwave payment page in a new tab
      window.open(res.data.paymentLink, "_blank");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Freelancer Registration Payment</h1>
        <p className="mb-4">
          Pay your one-time registration fee to join RMGC as a freelancer.
        </p>

        {/* Price removed */}

        <button
          onClick={handlePayNow}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default FreelancePaymentPage;

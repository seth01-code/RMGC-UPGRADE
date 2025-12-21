"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import newRequest from '../../../utils/newRequest';

const FreelancerPaymentSuccess = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tx_ref = params.get("tx_ref");
    const email = params.get("email");

    if (!tx_ref || !email) {
      alert("Invalid payment success URL");
      return;
    }

    const recordPayment = async () => {
      setLoading(true);
      try {
        await newRequest.post("/auth/freelancer-payment-success", {
          email,
          txRef: tx_ref,
          flwRef: tx_ref, // In test mode, just use same as txRef
          amount: 5000, // your base amount for test
          currency: "NGN",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to record payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    recordPayment();
  }, []);

  const completeRegistration = () => {
    router.push(`/verify-otp?email=${new URLSearchParams(window.location.search).get("email")}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="mb-4">
          Your payment has been recorded. Click the button below to complete your registration.
        </p>
        <button
          onClick={completeRegistration}
          disabled={loading || completed}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          {loading ? "Completing..." : "Complete Registration"}
        </button>
      </div>
    </div>
  );
};

export default FreelancerPaymentSuccess;

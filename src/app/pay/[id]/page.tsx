"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import newRequest from "../../utils/newRequest";
import { useTranslation } from "react-i18next";
import FlutterwaveLogo from "../../../assets/images/flutterwave-logo-removebg-preview.png";
import PaystackLogo from "../../../assets/images/Paystack-removebg-preview.png";
import backgroundImage from "../../../assets/bill-6107551_1920.png"; // matches [id] in your route file

interface PayProps {}

const Pay: React.FC<PayProps> = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  const params = useParams();
  const gigId = params.id;
  const router = useRouter();

  const { t } = useTranslation();

  const handlePayment = async (paymentMethod: "paystack" | "flutterwave") => {
    try {
      if (!gigId) {
        setErrorMessage(t("gigIdMissing"));
        return;
      }

      setProcessing(true);
      let res;
      if (paymentMethod === "paystack") {
        res = await newRequest.post(`/orders/create-payment-intent/${gigId}`);
      } else {
        res = await newRequest.post(
          `/orders/create-flutterwave-intent/${gigId}`
        );
      }

      setTimeout(() => {
        window.location.href = res.data.paymentLink;
      }, 1000);

      setProcessing(false);
    } catch (err: any) {
      setProcessing(false);
      setErrorMessage(
        err.response?.data?.message || err.message || t("unknownError")
      );
    }
  };

  const PaymentCard = ({
    title,
    logo,
    method,
    icons,
  }: {
    title: string;
    logo: any;
    method: "paystack" | "flutterwave";
    icons: string[];
  }) => (
    <div
      onClick={() => handlePayment(method)}
      className="cursor-pointer p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between bg-white/10 backdrop-blur-md shadow-lg hover:shadow-2xl hover:bg-white/20 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12">
          <Image src={logo} alt={title} fill className="object-contain" />
        </div>
        <span className="text-white font-medium text-sm sm:text-lg">
          {title}
        </span>
      </div>
      <div className="flex gap-2 mt-3 sm:mt-0">
        {icons.map((icon, i) => (
          <div key={i} className="relative w-6 h-6 sm:w-8 sm:h-8">
            <Image
              src={icon}
              alt={`card-${i}`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
      style={{ backgroundImage: `url(${backgroundImage.src})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-6 bg-white/5 backdrop-blur-xl shadow-gray-400 shadow-2xl rounded-3xl border border-white/10">
        {/* Header */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
          {t("selectPaymentMethod")}
        </h2>
        <p className="text-center text-gray-300 mt-2 text-sm sm:text-base">
          {t("securePayment")}
        </p>

        {/* Paystack */}
        <div className="mt-6">
          <p className="text-white text-sm sm:text-base font-medium mb-2">
            Pay with Paystack (Naira & USD only)
          </p>
          <PaymentCard
            title={t("payWithPaystack")}
            method="paystack"
            logo={PaystackLogo}
            icons={[
              "https://logolook.net/wp-content/uploads/2023/09/Visa-Logo.png",
              "https://cdn.prod.website-files.com/64199d190fc7afa82666d89c/648b606d4a139591f6b3440c_mastercard-1.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Verve_Image.png/1200px-Verve_Image.png",
            ]}
          />
        </div>

        {/* Flutterwave */}
        <div className="mt-6">
          <p className="text-white text-sm sm:text-base font-medium mb-2">
            Pay with Flutterwave (International)
          </p>
          <PaymentCard
            title={t("payWithFlutterwave")}
            method="flutterwave"
            logo={FlutterwaveLogo}
            icons={[
              "https://logolook.net/wp-content/uploads/2023/09/Visa-Logo.png",
              "https://cdn.prod.website-files.com/64199d190fc7afa82666d89c/648b606d4a139591f6b3440c_mastercard-1.png",
              "https://webshoptiger.com/wp-content/uploads/2023/09/American-Express-Color-1024x576.png",
            ]}
          />
        </div>

        {/* Loading Spinner */}
        {processing && (
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 p-3 text-red-500 text-sm bg-red-100 rounded-lg text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pay;

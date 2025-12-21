"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Tab = "terms" | "privacy";

const TermsPrivacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("terms");
  const [accepted, setAccepted] = useState<boolean>(false);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState<boolean>(true);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);


  useEffect(() => {
    // Enable checkbox after 60 seconds to ensure user has read content
    const timer = setTimeout(() => setIsCheckboxDisabled(false), 60000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = (): void => {
    if (!user) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    // ✅ If NOT subscribed → go to payment
    if (!user.vipSubscription?.active) {
      toast.success("Terms accepted. Please proceed to payment.");
      router.push("/pay-org");
      return;
    }

    // ✅ If already subscribed → go to dashboard
    toast.info("You already have an active subscription.");
    router.push("/organization/dashboard");
  };

  const handleCheckbox = (): void => {
    if (isCheckboxDisabled) {
      toast.error(
        "Please read the Terms of Service and Privacy Policy completely before proceeding."
      );
      return;
    }
    setAccepted(!accepted);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header */}
      <header className="bg-orange-100 py-16 text-center text-black/70">
        <h1 className="text-4xl font-extrabold tracking-wide">
          Terms of Service & Privacy Policy
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-700">
          Last updated: December 03, 2025
        </p>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-1/4 bg-white shadow-lg p-6 rounded-lg sticky top-10 h-fit">
          <h3 className="text-lg font-semibold mb-4">Jump to Section</h3>
          <ul className="space-y-3">
            <li>
              <button
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  activeTab === "terms"
                    ? "bg-orange-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("terms")}
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  activeTab === "privacy"
                    ? "bg-orange-100 font-semibold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("privacy")}
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </aside>

        {/* Content */}
        <main className="md:w-3/4 w-full space-y-10">
          {/* Desktop view: show tab content */}
          <div className="hidden md:block">
            {activeTab === "terms" ? <TermsOfService /> : <PrivacyPolicy />}
          </div>

          {/* Mobile view: show both sections stacked */}
          <div className="md:hidden space-y-6">
            <TermsOfService />
            <hr className="border-gray-300" />
            <PrivacyPolicy />
          </div>

          {/* Acceptance Checkbox */}
          <div className="bg-white shadow-lg p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mr-3 w-5 h-5 cursor-pointer accent-orange-600"
                checked={accepted}
                onChange={handleCheckbox}
              />
              <label htmlFor="acceptTerms" className="text-gray-700 text-lg">
                I have read and agree to the{" "}
                <span
                  className="text-orange-600 cursor-pointer underline"
                  onClick={() => setActiveTab("terms")}
                >
                  Terms of Service
                </span>{" "}
                and{" "}
                <span
                  className="text-orange-600 cursor-pointer underline"
                  onClick={() => setActiveTab("privacy")}
                >
                  Privacy Policy
                </span>
                .
              </label>
            </div>
            <button
              className={`mt-4 w-full py-3 text-white font-semibold rounded-md transition-colors ${
                accepted
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!accepted}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

// Terms of Service Component
const TermsOfService: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-700 mb-4">
      Terms and Conditions
    </h2>

    <Section title="Introduction">
      This website is operated by{" "}
      <strong>Renewed Minds Global Consult (RMGC)</strong>, located in Lagos,
      Nigeria. By accessing or using this website, you agree to be bound by
      these Terms and Conditions.
    </Section>

    <Section title="Use of the Site">
      You agree to use this website for lawful purposes only and in accordance
      with these Terms. You must not misuse the site or engage in any activity
      that could disrupt, damage, or impair the website’s operations.
    </Section>

    <Section title="Account Registration">
      To place an order for any listed service, users must create an account.
      You agree to provide accurate, current information and to keep your
      account credentials secure.
    </Section>

    <Section title="Services">
      We strive to ensure that all service information provided on this website
      is accurate; however, we do not guarantee its accuracy. Prices and
      availability of services are subject to change without prior notice.
    </Section>

    <Section title="Advertisement | Subscription Terms">
      Organisations are required to pay a non-refundable subscription fee of
      <strong> ₦50,000</strong> to post job updates on the platform. This
      subscription is renewable on a yearly basis.
    </Section>

    <Section title="Intellectual Property">
      All content on this website, including text, images, logos, graphics, and
      trademarks, are owned by RMGC or its licensors (including Service
      Providers) and are protected under applicable copyright and intellectual
      property laws.
    </Section>

    <Section title="Limitation of Liability">
      RMGC shall not be liable for any direct or indirect damages arising from
      the use or inability to use this website.
      <br />
      <br />
      RMGC shall also not be responsible for any transaction, job offer,
      interview, or communication between organisations and job seekers that
      occurs through the platform. The website serves solely as a medium to
      connect both parties. Users are strongly advised to conduct proper
      investigations before accepting job offers or entering into agreements.
    </Section>

    <Section title="Governing Law">
      These Terms and Conditions shall be governed by and construed in
      accordance with the laws of the Federal Republic of Nigeria.
    </Section>

    <Section title="Changes to Terms">
      RMGC reserves the right to update or modify these Terms at any time.
      Changes will be posted on this page along with an updated revision date.
    </Section>
  </div>
);

// Privacy Policy Component
const PrivacyPolicy: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-700 mb-4">Privacy Policy</h2>

    <Section title="Introduction">
      This Privacy Policy explains how{" "}
      <strong>Renewed Minds Global Consult (RMGC)</strong>
      collects, uses, and protects your personal information when you visit and
      use our website.
    </Section>

    <Section title="Information We Collect">
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Personal Information:</strong> When you register, make a
          purchase, or subscribe to newsletters, we may collect information such
          as your name, email address, phone number, and payment details.
        </li>
        <li>
          <strong>Usage Information:</strong> We collect non-personal
          information through cookies and tracking technologies to understand
          how users interact with the website.
        </li>
      </ul>
    </Section>

    <Section title="How We Use Your Information">
      <ul className="list-disc pl-5 space-y-2">
        <li>To process and fulfill orders.</li>
        <li>
          To communicate with you regarding orders, promotions, and important
          updates.
        </li>
        <li>To improve website functionality and overall user experience.</li>
      </ul>
    </Section>

    <Section title="Sharing Your Information">
      We may share your personal information with trusted third-party service
      providers (such as payment processors) solely for the purpose of
      fulfilling services. RMGC does not sell or rent your personal information
      to third parties.
    </Section>

    <Section title="Data Security">
      We implement industry-standard security measures to protect your personal
      information during transmission and storage. However, no online
      transaction is completely secure, and we cannot guarantee absolute
      security.
    </Section>

    <Section title="Cookies">
      Cookies are used to enhance user experience, analyze website usage, and
      provide personalized content. You may control cookie usage through your
      browser settings.
    </Section>

    <Section title="Your Rights">
      You have the right to access, update, or request deletion of your personal
      information by contacting us at{" "}
      <strong>support@renewedmindsglobalconsult.com</strong>. You may also opt
      out of marketing communications at any time.
    </Section>

    <Section title="Children’s Privacy">
      This website is not intended for children under the age of 13. RMGC does
      not knowingly collect personal information from minors.
    </Section>

    <Section title="Changes to Privacy Policy">
      This Privacy Policy may be updated periodically. Any changes will be
      posted on this page along with an updated revision date.
    </Section>
  </div>
);

// Reusable Section Component
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-4">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="text-gray-700 leading-relaxed">{children}</div>
  </div>
);

export default TermsPrivacy;

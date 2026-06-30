"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type Tab = "terms" | "privacy";

const UNLOCK_DURATION_MS = 60000;

const TermsPrivacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("terms");
  const [accepted, setAccepted] = useState<boolean>(false);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = useState<boolean>(true);
  const [readPct, setReadPct] = useState<number>(0);
  const [hasCurrentUser, setHasCurrentUser] = useState<boolean>(false);
  const router = useRouter();
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    setHasCurrentUser(!!currentUser);
  }, []);

  useEffect(() => {
    if (hasCurrentUser) return; // already signed in, no need to gate reading time
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / UNLOCK_DURATION_MS) * 100));
      setReadPct(pct);
      if (pct >= 100) {
        setIsCheckboxDisabled(false);
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [hasCurrentUser]);

  const handleContinue = (): void => {
    toast.success("Terms and Conditions accepted. You can now log in!");
    router.push("/login");
  };

  const handleBackToHomepage = (): void => {
    router.push("/");
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

  const jumpTo = (tab: Tab) => {
    setActiveTab(tab);
    docRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#111111] font-sans">
      

      {/* Hero */}
      <header className="relative text-center px-6 pt-20 pb-14 border-b border-[#E5E5E5] overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #F97316 0 28px, transparent 28px 40px)",
          }}
        />
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#F97316] mb-4">
          Renewed Minds Global Consult
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
          Terms of Service <em className="italic font-medium text-[#4B4B4B]">&amp;</em>
          <br />
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#4B4B4B]">
          Last updated: February 10, 2025 — please read in full before continuing.
        </p>
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-14">
        {/* Sidebar */}
        <aside className="hidden md:block sticky top-8 h-fit">
          <h3 className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#4B4B4B] mb-4">
            Jump to section
          </h3>
          <nav className="space-y-1">
            <button
              className={`w-full text-left flex items-baseline gap-3 pl-4 py-2.5 border-l-2 transition-colors text-[15px] ${
                activeTab === "terms"
                  ? "border-[#F97316] text-[#111111] font-semibold"
                  : "border-[#E5E5E5] text-[#4B4B4B] hover:text-[#111111]"
              }`}
              onClick={() => jumpTo("terms")}
            >
              <span className="font-mono text-[11px] text-[#FB923C]">01</span>
              Terms of Service
            </button>
            <button
              className={`w-full text-left flex items-baseline gap-3 pl-4 py-2.5 border-l-2 transition-colors text-[15px] ${
                activeTab === "privacy"
                  ? "border-[#F97316] text-[#111111] font-semibold"
                  : "border-[#E5E5E5] text-[#4B4B4B] hover:text-[#111111]"
              }`}
              onClick={() => jumpTo("privacy")}
            >
              <span className="font-mono text-[11px] text-[#FB923C]">02</span>
              Privacy Policy
            </button>
          </nav>

          {/* Reading seal */}
          <div className="flex items-center gap-3.5 mt-10">
            <div
              className="relative w-14 h-14 rounded-full shrink-0 flex items-center justify-center transition-[background] duration-150"
              style={{
                background: `conic-gradient(#F97316 ${readPct}%, #F5F5F5 0)`,
              }}
            >
              <div className="absolute inset-1.25 rounded-full bg-[#FFFFFF] border border-[#E5E5E5]" />
              <span className="relative z-10 font-mono text-xs">
                {readPct >= 100 ? "✓" : `${readPct}%`}
              </span>
            </div>
            <p className="text-xs text-[#4B4B4B] leading-snug">
              <b className="block text-[13px] text-[#111111]">Reading meter</b>
              Stay on the page to unlock acceptance.
            </p>
          </div>
        </aside>

        {/* Content */}
        <main ref={docRef}>
          {/* Desktop: tabbed */}
          <div className="hidden md:block bg-white border border-[#E5E5E5] rounded-sm px-14 py-12 shadow-sm">
            {activeTab === "terms" ? <TermsOfService /> : <PrivacyPolicy />}
          </div>

          {/* Mobile: stacked */}
          <div className="md:hidden space-y-8">
            <div className="bg-white border border-[#E5E5E5] rounded-sm px-6 py-8 shadow-sm">
              <TermsOfService />
            </div>
            <hr className="border-dashed border-[#E5E5E5]" />
            <div className="bg-white border border-[#E5E5E5] rounded-sm px-6 py-8 shadow-sm">
              <PrivacyPolicy />
            </div>
          </div>

          {/* Acceptance */}
          <div className="relative mt-10 bg-[#111111] text-[#FFFFFF] rounded-sm px-9 py-8 overflow-hidden">
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#F97316]" />

            {hasCurrentUser ? (
              <>
                <p className="text-[15px] leading-relaxed text-[#E5E5E5]">
                  You&rsquo;re already signed in. You can head back to the homepage
                  whenever you&rsquo;re ready.
                </p>
                <button
                  className="mt-6 w-full py-3.5 rounded-sm font-semibold text-[15px] bg-[#F97316] text-[#111111] hover:bg-[#FB923C] cursor-pointer transition-colors"
                  onClick={handleBackToHomepage}
                >
                  Back to homepage
                </button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="mt-0.5 w-5 h-5 cursor-pointer accent-[#F97316] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#FB923C] focus-visible:outline-offset-2"
                    checked={accepted}
                    disabled={isCheckboxDisabled}
                    onChange={handleCheckbox}
                    onClick={(e) => {
                      if (isCheckboxDisabled) {
                        e.preventDefault();
                        toast.error(
                          "Please read the Terms of Service and Privacy Policy completely before proceeding."
                        );
                      }
                    }}
                  />
                  <label htmlFor="acceptTerms" className="text-[15px] leading-relaxed text-[#E5E5E5]">
                    I have read and agree to the{" "}
                    <span
                      className="text-[#FB923C] underline cursor-pointer"
                      onClick={() => jumpTo("terms")}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      className="text-[#FB923C] underline cursor-pointer"
                      onClick={() => jumpTo("privacy")}
                    >
                      Privacy Policy
                    </span>
                    .
                  </label>
                </div>

                <p
                  className="font-mono text-[12.5px] mt-2.5 ml-8.5"
                  style={{ color: isCheckboxDisabled ? "#9CA3AF" : "#8FBF8A" }}
                >
                  {isCheckboxDisabled
                    ? "Locked — keep this page open to unlock"
                    : "Unlocked — you may now accept"}
                </p>

                <button
                  className={`mt-6 w-full py-3.5 rounded-sm font-semibold text-[15px] transition-colors ${
                    accepted
                      ? "bg-[#F97316] text-[#111111] hover:bg-[#FB923C] cursor-pointer"
                      : "bg-[#4B4B4B] text-[#8A8A8A] cursor-not-allowed"
                  }`}
                  disabled={!accepted}
                  onClick={handleContinue}
                >
                  Continue to log in
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Terms of Service
const TermsOfService: React.FC = () => (
  <div>
    <h2 className="font-serif text-3xl font-semibold italic mb-1">
      Terms Of Service for Clients
    </h2>
    <span className="block font-mono text-xs uppercase tracking-wider text-[#F97316] mb-8">
      For clients
    </span>
    <p className="text-[15px] leading-7 text-[#4B4B4B] mb-4">
      Welcome to <strong className="text-[#111111] font-semibold">Renewed Minds Global Consult (RMGC)</strong>. By using
      our website, you agree to comply with the following terms. Please read
      them carefully.
    </p>

    <Clause n="1" title="Use of Our Website">
      You agree to use the site for lawful purposes only and in accordance with
      these Terms. You must not misuse the site or engage in activities that
      could disrupt or damage the site&rsquo;s operations.
    </Clause>

    <Clause n="2" title="Account Registration">
      To access our services, you must create an account with accurate and
      complete information. You are responsible for maintaining the
      confidentiality of your login credentials.
    </Clause>

    <Clause n="3" title="Services">
      We strive to ensure that service information on the site is accurate, but
      we do not guarantee its accuracy. Prices and availability are subject to
      change without notice.
    </Clause>

    <Clause n="4" title="Communication Policy">
      External communication or correspondence with any Service Provider outside
      of RMGC&apos;s website is highly prohibited. We have provided a chat
      platform where each Client can converse effectively with the Service
      Provider. We use the chat platform to track correspondence and ensure that
      Service Providers meet up to their requirements from any client. If found
      that you breach this condition, your account will be deactivated and you
      will no longer have access to the use of RMGC website. We will also not be
      held liable for any loss incurred from the external correspondence.
    </Clause>

    <Clause n="5" title="Payments and Orders">
      All payments must be made through RMGC&rsquo;s secure payment gateway. We
      do not support direct transactions between users outside our platform.
    </Clause>

    <Clause n="6" title="Order Fulfilment">
      Fulfilment timeline of services should be clearly communicated between you
      and the Service Provider before payment checkout. We are not responsible
      for delays caused by Service Providers in fulfilment of orders.
    </Clause>

    <Clause n="7" title="Refunds">
      Our Refund policy states that when the Service Provider defaults in
      fulfilling your order within the agreed time, you will receive a complete
      refund of the payment made. However, if the order was fulfilled and you
      choose to request a refund, RMGC will investigate the cause of the
      request. If ascertained that the service was not delivered as expected, or
      short of standard, the Service Provider will be mandated to redo the
      service without extra cost to you. Upon investigation that there was no
      default or substandard service from the Service Provider, your request for
      a refund will be declined. You can only initiate a refund request within
      seven (7) working days after order fulfilment.
    </Clause>

    <Clause n="8" title="Intellectual Property">
      All content on the site, including text, images, logos, and trademarks,
      are owned by RMGC or its licensors (including Service Providers) and
      protected by copyright law.
    </Clause>

    <Clause n="9" title="Limitation of Liability">
      RMGC is not liable for any direct or indirect damages arising from the use
      of this platform.
    </Clause>

    <Clause n="10" title="Governing Law">
      These Terms will be governed by and construed in accordance with the laws
      of the Federal Republic of Nigeria.
    </Clause>

    <Clause n="11" title="Changes to Terms">
      We may update these Terms from time to time. Any changes will be posted on
      this page with an updated revision date.
    </Clause>

    <hr className="border-dashed border-[#E5E5E5] my-12" />

    <h2 className="font-serif text-3xl font-semibold italic mb-1">
      Terms Of Service &amp; Condition for Service Providers
    </h2>
    <span className="block font-mono text-xs uppercase tracking-wider text-[#F97316] mb-8">
      For service providers
    </span>
    <p className="text-[15px] leading-7 text-[#4B4B4B] mb-4">
      These{" "}
      <strong className="text-[#111111] font-semibold">
        Service Provider Terms and Conditions (&quot;Agreement&quot;)
      </strong>{" "}
      govern the use of{" "}
      <strong className="text-[#111111] font-semibold">[Renewed Minds Global Consult] (&quot;RMGC&quot;)</strong> by{" "}
      <strong className="text-[#111111] font-semibold">
        service providers (&quot;Service Providers&quot; or &quot;you&quot;)
      </strong>{" "}
      who wish to list and provide services on RMGC. By registering as a
      service provider on RMGC, you agree to comply with the terms and
      conditions outlined below.
    </p>

    <Clause n="1" title="Eligibility">
      To provide service on <strong className="text-[#111111] font-semibold">RMGC</strong>, you must be a legal entity or
      an individual over the age of <strong className="text-[#111111] font-semibold">18</strong> with the capacity to
      enter into a contract. Service Providers must submit accurate and
      complete registration information, including business details, contact
      information, and tax-related information as required.
    </Clause>

    <Clause n="2" title="Service Listings">
      Service Providers are responsible for listing their services accurately
      and ensuring that service descriptions, prices, and images are correct and
      up-to-date. Services listed must comply with all applicable laws,
      including but not limited to consumer protection, safety, and
      intellectual property laws. RMGC reserves the right to remove any service
      listings that violate its policies or applicable laws.
    </Clause>

    <Clause n="3" title="Fees and Payment">
      Service Providers will get free registration for this one year but will
      renew their registration for 2026, with{" "}
      <strong className="text-[#111111] font-semibold">5,000 Naira</strong>. New service providers registering fresh in
      2026 will pay a registration fee of 5,000 Naira before being able to list
      their services on RMGC. A total of{" "}
      <strong className="text-[#111111] font-semibold">10% (ten percent)</strong> will be deducted by RMGC from any
      payment made by a Client to the Service Provider which will cover for
      operational fees. Payment for services will be processed through RMGC
      payment gateway directly from the client and after the deduction of 10% of
      the amount received, the remaining sum will be disbursed to the Service
      Provider, on the condition that the Service Provider has fulfilled the
      order and request of the Client. This is to ensure trust and no breach of
      service.
    </Clause>

    <Clause n="4" title="Order Fulfillment">
      Service Providers are responsible for fulfilling service requests in a
      timely manner and as at when it is agreed between them and Client to do
      so. Service Providers must provide accurate information of services and
      reasonable fulfillment timeframe details to Clients before embarking on a
      service request. Service Providers are responsible for managing inventory
      and ensuring that services listed are available for request.
    </Clause>

    <Clause n="5" title="Customer Service">
      Service Providers are required to provide prompt and professional customer
      service in response to Client&apos;s inquiries, complaints, or issues.
      Service Providers must handle refunds and complaints in accordance with
      RMGC refund policy.
    </Clause>

    <Clause n="6" title="Means of Communication">
      All correspondence and communication will be done on the website through
      the chat medium between the (Service Provider and Client). Chats backlog
      will be cleared after a period of time, to ensure there is no exchange of
      contacts or communication outside of RMGC website. A breach of this rule
      would result in termination of the Service Provider account, if found.
    </Clause>

    <Clause n="7" title="Refund Policy">
      Service Providers must ensure that they deliver excellent services to
      clients to avoid unnecessary issues and complaints. In the event that any
      Client doesn&apos;t appreciate the service gotten from the Service
      Provider and requests a refund or for the service to be done again, RMGC
      will take steps to investigate if the Service Provider didn&apos;t deliver
      as expected, or fault is from client. If the Service Provider is the one
      in the wrong, the Service Provider will refund or redo the service
      requested to the client without any further payment made by the client or
      from RMGC. If the Client doesn&apos;t have valid grounds to seek a refund
      or a replacement of service, RMGC will intervene and remind the client of
      its terms and conditions, which they agreed to before signing up.
    </Clause>

    <Clause n="8" title="Compliance with Laws">
      Service Providers must comply with all applicable laws, including those
      related to consumer protection, taxes, and intellectual property rights.
      Service Providers are responsible for obtaining any necessary licenses or
      permits required for their business activities.
    </Clause>

    <Clause n="9" title="Termination of Service Provider Account">
      RMGC may suspend or terminate a Service Provider&apos;s account at its
      discretion, including for violations of these terms and conditions or any
      illegal activity. Service Providers may also terminate their accounts at
      any time by providing notice to RMGC.
    </Clause>

    <Clause n="10" title="Intellectual Property">
      Service Providers retain ownership of the intellectual property in their
      service listings, including images and descriptions, but grant RMGC a
      license to use, display, and promote those listings. Service Providers
      must ensure that their listings do not infringe on any third-party
      intellectual property rights.
    </Clause>

    <Clause n="11" title="Indemnification, Liability, Amendments &amp; Governing Law">
      Service Providers agree to indemnify and hold RMGC harmless from any
      claims, damages, or expenses arising from the Service Provider&apos;s
      actions, including violations of this Agreement, laws, or third-party
      rights. RMGC is not liable for any loss, damage, or injury arising from
      the use of RMGC, including the sale of services by Service Providers. RMGC
      may amend these terms and conditions from time to time. Service Providers
      will be notified of any material changes, and continued use of RMGC
      constitutes acceptance of the updated terms. This Agreement will be
      governed by and construed in accordance with the laws of the Federal
      Republic of Nigeria.
    </Clause>
  </div>
);

// Privacy Policy
const PrivacyPolicy: React.FC = () => (
  <div>
    <h2 className="font-serif text-3xl font-semibold italic mb-1">
      Our Privacy Policy
    </h2>
    <span className="block font-mono text-xs uppercase tracking-wider text-[#F97316] mb-8">
      How we handle your data
    </span>
    <p className="text-[15px] leading-7 text-[#4B4B4B] mb-4">
      Your privacy is important to us. This policy outlines how we collect, use,
      and protect your personal information.
    </p>

    <Clause n="1" title="Information We Collect">
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong className="text-[#111111] font-semibold">Personal information</strong> — when you make a purchase,
          register, or sign up for newsletters, we collect information such as
          your name, email address, phone number, and payment details.
        </li>
        <li>
          <strong className="text-[#111111] font-semibold">Usage information</strong> — we collect non-personal
          information through cookies and tracking technologies to understand
          how users interact with the website.
        </li>
      </ul>
    </Clause>

    <Clause n="2" title="How We Use Your Information">
      <ul className="list-disc pl-5 space-y-2">
        <li>To process payments and fulfill orders.</li>
        <li>To improve our website&rsquo;s functionality and customer experience.</li>
        <li>To communicate with you regarding updates and promotions.</li>
      </ul>
    </Clause>

    <Clause n="3" title="Data Security">
      We use industry-standard security measures to protect your personal
      information during transmission and storage. However, no online
      transaction is 100% secure, and we cannot guarantee the complete security
      of your information.
    </Clause>

    <Clause n="4" title="Cookies">
      We use cookies to enhance user experience, analyze site usage, and provide
      personalized content. You can adjust your browser settings to manage
      cookies.
    </Clause>

    <Clause n="5" title="Sharing Your Data">
      We may share your personal information with third-party{" "}
      <strong className="text-[#111111] font-semibold">service providers</strong> (e.g., payment processors) to fulfill
      orders. We do not sell or rent your personal information to third
      parties.
    </Clause>

    <Clause n="6" title="Your Rights">
      You have the right to access, update, or delete your personal information
      by contacting us at support@renewedmindsglobalconsult.com.
    </Clause>

    <Clause n="7" title="Children&rsquo;s Privacy">
      Our website is not intended for children under the age of 13. We do not
      knowingly collect personal information from minors.
    </Clause>

    <Clause n="8" title="Changes to Privacy Policy">
      We may update this Privacy Policy from time to time. Any changes will be
      posted on this page with an updated revision date.
    </Clause>
  </div>
);

// Shared clause wrapper — numbered, ledger-style
const Clause: React.FC<{ n: string; title: string; children: React.ReactNode }> = ({
  n,
  title,
  children,
}) => (
  <div className="my-7">
    <h3 className="flex items-baseline gap-3 text-base font-semibold mb-2">
      <span className="font-mono text-xs text-[#FB923C] min-w-5.5">{n}</span>
      {title}
    </h3>
    <div className="text-[15px] leading-7 text-[#4B4B4B]">{children}</div>
  </div>
);

export default TermsPrivacy;
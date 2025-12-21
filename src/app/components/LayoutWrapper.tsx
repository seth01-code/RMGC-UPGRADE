"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import Footer from "./footer";
import RoutePreloader from "./preloaders/RoutePreloader";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /**
   * Any route that STARTS with one of these
   * will hide Navbar & Footer
   */
  const hiddenRoutePrefixes = [
    "/chat",
    "/login",
    "/register",
    "/pay",
    "/seller",
    "/gigdetails",
    "/seller/profile-edit",
    "/payment-processing",
    "/pay-org",

    // Organization
    "/organization",

    // Payments
    "/payment/remote-vip",
    "/payment/freelancers",

    // Remote worker
    "/remote",

    // OTP
    "/verify-otp",

    // Admin (future-proof)
    "/admin",
  ];

  const hideComponents = hiddenRoutePrefixes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className="bg-gray-100 flex flex-col min-h-screen relative">
      <RoutePreloader>
        {(loading) => (
          <>
            {!hideComponents && !loading && <Navbar />}
            <main className="flex-1">{children}</main>
            {!hideComponents && !loading && <Footer />}
          </>
        )}
      </RoutePreloader>
    </div>
  );
}

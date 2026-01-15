"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import RoutePreloader from "./preloaders/RoutePreloader";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingUser, setCheckingUser] = useState(true);

  // Routes that hide Navbar & Footer
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
    "/organization",
    "/payment/remote-vip",
    "/payment/freelancers",
    "/remote",
    "/verify-otp",
    "/admin",
  ];

  const hideComponents = hiddenRoutePrefixes.some((route) =>
    pathname.startsWith(route)
  );

  /* ==========================
     MINIMAL ROLE REDIRECT LOGIC
  ========================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      setCheckingUser(false);
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      // Admin → block landing page
      if (user.isAdmin && pathname === "/") {
        router.replace("/admin");
      }

      // Remote worker → block landing page
      if (user.role === "remote_worker" && pathname === "/") {
        router.replace("/remote/dashboard");
      }

      // Organization → block landing page
      if (user.role === "organization" && pathname === "/") {
        router.replace("/organization/dashboard");
      }
    } catch (err) {
      console.error("Error parsing currentUser:", err);
    } finally {
      setCheckingUser(false);
    }
  }, [pathname, router]);

  if (checkingUser) return null;

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

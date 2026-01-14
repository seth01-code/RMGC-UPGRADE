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
  const [user, setUser] = useState<unknown>(null);

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

  /** ==========================
   * Check Authenticated User & Route Guard
   * ========================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      // No user, redirect all protected routes to login or home
      if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/remote") ||
        pathname.startsWith("/organization")
      ) {
        router.replace("/login");
      }
      setCheckingUser(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      /** ===== Route Guard Logic ===== */
      if (parsedUser.isAdmin) {
        // Admin can only access /admin
        if (!pathname.startsWith("/admin")) router.replace("/admin/dashboard");
      } else if (parsedUser.role === "remote_worker") {
        // Remote worker can only access /remote
        if (!pathname.startsWith("/remote")) router.replace("/remote/dashboard");
        // Block access to /organization or /admin
        if (pathname.startsWith("/organization") || pathname.startsWith("/admin"))
          router.replace("/remote/dashboard");
      } else if (parsedUser.role === "organization") {
        // Organization can only access /organization
        if (!pathname.startsWith("/organization"))
          router.replace("/organization/dashboard");
        // Block access to /remote or /admin
        if (pathname.startsWith("/remote") || pathname.startsWith("/admin"))
          router.replace("/organization/dashboard");
      } else if (parsedUser.isSeller || !parsedUser.role) {
        // Seller or client → can access only /
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/remote") ||
          pathname.startsWith("/organization")
        )
          router.replace("/");
      }
    } catch (err) {
      console.error("Error parsing currentUser:", err);
      router.replace("/login");
    } finally {
      setCheckingUser(false);
    }
  }, [pathname, router]);

  if (checkingUser) return null; // prevent UI flicker

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

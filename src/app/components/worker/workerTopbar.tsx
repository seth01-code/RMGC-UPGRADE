"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Crown, LogOut, Menu, X } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { useState, useEffect } from "react";
import newRequest from "../../utils/newRequest";

const links = [
  { href: "/remote/jobs", label: "Jobs" },
  { href: "/remote/applications", label: "Applications" },
  { href: "/remote/profile", label: "Profile" },
  { href: "/remote/billing", label: "Billing" },
];

export default function WorkerTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isVIP = user?.vipSubscription?.active;

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await newRequest.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return null; // prevent flicker while loading

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-6">
          <Link href="/remote/dashboard" className="font-extrabold text-xl text-orange-600">
            RMGC
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition ${
                  pathname.startsWith(l.href)
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {!isVIP && (
            <button
              onClick={() => router.push("/payment/remote-vip")}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold hover:bg-orange-200 transition"
            >
              <Crown className="w-4 h-4" /> Upgrade
            </button>
          )}

          {isVIP && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600">
              <MdVerified className="w-4 h-4" /> VIP
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur px-3 py-1 rounded-full">
            <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-300">
              <Image
                src={
                  user.img ||
                  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg"
                }
                alt="User"
                fill
                className="object-cover"
              />
            </div>

            <span className="text-sm truncate max-w-[100px] hidden sm:block">{user.username}</span>

            <button
              onClick={() => {
                localStorage.removeItem("currentUser");
                router.push("/login");
              }}
              className="p-1 rounded-md hover:bg-gray-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE NAV ================= */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <ul className="flex flex-col gap-2 p-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname.startsWith(l.href)
                      ? "bg-orange-100 text-orange-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}

            {!isVIP && (
              <li>
                <button
                  onClick={() => {
                    router.push("/payment/remote-vip");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-orange-100 text-orange-600 text-sm font-semibold w-full"
                >
                  <Crown className="w-4 h-4" /> Upgrade
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}

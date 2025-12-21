"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WorkerTopbar from "../components/worker/workerTopbar";
import WorkerFooter from "../components/worker/workerFooter";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
   const [user, setUser] = useState<any>(null);

 useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) {
    router.replace("/login");
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    // ✅ Role check
    if (parsedUser.role !== "remote_worker") {
      router.replace("/login");
      return;
    }

    setUser(parsedUser);
  } catch (error) {
    router.replace("/login");
  } finally {
    setLoading(false);
  }
}, [router]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerTopbar user={user} />
      <main className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {children}
      </main>
      <WorkerFooter />
    </div>
  );
}

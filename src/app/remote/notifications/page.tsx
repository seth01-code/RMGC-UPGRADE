"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  CheckCircle,
  Crown,
  Eye,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "job" | "application" | "vip" | "profile";
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "remote_worker") {
      router.replace("/login");
      return;
    }

    setUser(parsedUser);

    // 🔹 Mock notifications (replace with API later)
    setNotifications([
      {
        id: "1",
        title: "New Job Match",
        message: "A Frontend Developer job matches your profile.",
        type: "job",
        time: "2 hours ago",
        read: false,
      },
      {
        id: "2",
        title: "Application Viewed",
        message: "Tech Corp viewed your application.",
        type: "profile",
        time: "Yesterday",
        read: false,
      },
      {
        id: "3",
        title: "Application Accepted",
        message: "You were shortlisted for Backend Engineer.",
        type: "application",
        time: "2 days ago",
        read: true,
      },
      {
        id: "4",
        title: "VIP Job Alert",
        message: "High-paying job ($1,500/month) available.",
        type: "vip",
        time: "3 days ago",
        read: true,
      },
    ]);
  }, [router]);

  if (!user) return null;

  /* ---------------- ICON SELECTOR ---------------- */
  const iconMap = {
    job: <Briefcase className="w-5 h-5 text-blue-600" />,
    application: <CheckCircle className="w-5 h-5 text-green-600" />,
    vip: <Crown className="w-5 h-5 text-orange-600" />,
    profile: <Eye className="w-5 h-5 text-purple-600" />,
  };

  /* ---------------- MARK AS READ ---------------- */
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );

    // 🔹 Later:
    // PATCH /notifications/:id/read
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="w-7 h-7 text-orange-600" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <Bell className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            You have no notifications yet.
          </p>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-5 rounded-xl shadow cursor-pointer flex gap-4 ${
              n.read ? "bg-white" : "bg-orange-50 border border-orange-200"
            }`}
          >
            <div className="p-2 bg-gray-100 rounded-full">
              {iconMap[n.type]}
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">{n.title}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {n.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {n.time}
              </p>
            </div>

            {!n.read && (
              <span className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import newRequest from "../../utils/newRequest"; // make sure this points to your axios instance

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    organizationId: {
      name: string;
    };
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
  };
  coverLetter: string;
  cvUrl: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function WorkerApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [router]);

  /* ---------------- FETCH APPLICATIONS ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const res = await newRequest.get("/application/user");
        setApplications(res.data);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (!user || loading) return null;

  /* ---------------- STATUS BADGE ---------------- */
  const statusBadge = (status: Application["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" /> Pending
          </span>
        );
      case "accepted":
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" /> Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-500">
          Track jobs you have applied for and their status
        </p>
      </div>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <Briefcase className="w-10 h-10 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            You haven’t applied for any jobs yet.
          </p>
          <button
            onClick={() => router.push("/remote/jobs")}
            className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl"
          >
            Browse Jobs
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            onClick={() => router.push(`/remote/jobs/${app.jobId._id}`)}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-semibold">{app.jobId.title}</h2>
                <p className="text-gray-500">{app.jobId.organizationId.name}</p>
                <p className="mt-2 text-sm text-green-700 font-medium">
                  {app.jobId.salaryRange.currency} {app.jobId.salaryRange.min} –{" "}
                  {app.jobId.salaryRange.max}
                </p>
              </div>

              {statusBadge(app.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

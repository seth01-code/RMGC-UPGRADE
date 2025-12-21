"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Bookmark, Briefcase, UserCheck, Lock } from "lucide-react";
import newRequest from "../../utils/newRequest";

interface Job {
  id: string;
  title: string;
  organization: string;
  salary: string;
  minSalary: number;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
}

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>(
    []
  );
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [userApplications, setUserApplications] = useState<Application[]>([]);

  /* ---------------- FETCH USER DATA ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await newRequest.get("/users/me");
        const data = res.data;

        if (data.role !== "remote_worker") {
          router.replace("/login");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router]);

  /* ---------------- FETCH RECOMMENDED JOBS ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      try {
        const res = await newRequest.get("/jobs/");
        let jobs: Job[] = res.data.map((j: any) => ({
          id: j._id,
          title: j.title,
          organization: j.organizationId?.organization?.name || "Unknown",
          salary: `$${j.salaryRange?.min || 0} - $${j.salaryRange?.max || 0}`,
          minSalary: j.salaryRange?.min || 0,
        }));

        // VIP filter: hide high-paying jobs for free users
        const vipStatus = user.vipSubscription?.active;
        if (!vipStatus) {
          jobs = jobs.filter((j) => j.minSalary <= 250);
        }

        setRecommendedJobs(jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, [user]);

  /* ---------------- FETCH RECENT APPLICATIONS ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const res = await newRequest.get("/application/user");
        const apps: Application[] = res.data.map((a: any) => ({
          id: a._id,
          jobId: a.jobId?._id,
          jobTitle: a.jobId?.title || "Unknown",
          status: a.status,
        }));
        setRecentApplications(apps.slice(0, 3));
        setUserApplications(apps); // store all applications for lock checks
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, [user]);

  if (!user) return null;

  const isVIP = user.vipSubscription?.active;

  const stats = [
    {
      label: "Jobs Applied",
      value: recentApplications.length,
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      label: "Saved Jobs",
      value: savedJobsCount,
      icon: <Bookmark className="w-5 h-5" />,
    },
    {
      label: "Profile Completion",
      value: "100%",
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  const statusBadge = (status: Application["status"]) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "pending")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
      );
    if (status === "accepted")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Accepted</span>
      );
    return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
  };

  // Determine lock message for recommended jobs
  const getLockMessage = (job: Job) => {
    const salaryLock = job.minSalary > 250 && !isVIP;
    const app = userApplications.find((a) => a.jobId === job.id);
    const applicationLock =
      app && ["pending", "accepted", "rejected"].includes(app.status);

    if (applicationLock) return `Already Applied - ${app!.status}`;
    if (salaryLock) return "VIP Only";
    return null;
  };

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {user.firstName || user.username || "Worker"} 👋
        </h1>
        <p className="text-gray-600 mt-1 flex items-center gap-2">
          {isVIP ? (
            <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
              <Crown className="w-4 h-4" /> VIP Member
            </span>
          ) : (
            <>
              Free Tier
              <span
                onClick={() => router.push("/payment/remote-vip")}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-600 rounded-full cursor-pointer"
              >
                <Crown className="w-4 h-4" /> Upgrade
              </span>
            </>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-xl shadow flex gap-4"
          >
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              {s.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className="font-bold text-xl">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Jobs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recommended Jobs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {recommendedJobs.map((job) => {
            const lockMessage = getLockMessage(job);
            return (
              <div
                key={job.id}
                onClick={() => {
                  if (!lockMessage) router.push(`/remote/jobs/${job.id}`);
                }}
                className="relative bg-white p-5 rounded-xl shadow hover:shadow-lg cursor-pointer"
              >
                {/* Lock overlay */}
                {lockMessage && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl z-10 p-4 text-center">
                    <Lock className="w-8 h-8 text-orange-600" />
                    <p className="text-sm text-gray-700 font-medium">
                      {lockMessage}
                    </p>
                  </div>
                )}

                <h3 className="font-bold">{job.title}</h3>
                <p className="text-gray-500">{job.organization}</p>
                <p className="mt-2 font-medium text-green-700">{job.salary}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Applications
          </h2>
          <button
            onClick={() => router.push("/remote/applications")}
            className="text-orange-600 font-medium hover:underline"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col gap-2"
            >
              <p className="font-semibold text-gray-800 truncate">
                {app.jobTitle}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Status:</span>
                {statusBadge(app.status)}
              </div>
            </div>
          ))}
          {recentApplications.length === 0 && (
            <p className="col-span-full text-gray-500 text-center">
              No recent applications.
            </p>
          )}
        </div>
      </div>

      {/* VIP CTA */}
      {!isVIP && (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-orange-700">
              Access High-Paying Jobs
            </h3>
            <p className="text-orange-600 mt-1">
              Jobs above $250 are available only to VIP workers.
            </p>
          </div>
          <button
            onClick={() => router.push("/payment/remote-vip")}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Upgrade to VIP
          </button>
        </div>
      )}
    </div>
  );
}

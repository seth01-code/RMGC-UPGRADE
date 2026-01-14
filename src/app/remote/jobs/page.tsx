"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import newRequest from "../../utils/newRequest";

/* =======================
   Types
======================= */
interface Job {
  id: string;
  title: string;
  organization: string;
  salary: string; // "$100 - $250" or "₦70,000 - ₦200,000"
  remoteType: string;
  salaryMin: number;
  salaryMax: number;
  currency: "USD" | "NGN";
}

interface Application {
  jobId: string;
  status: "pending" | "accepted" | "rejected";
}

interface JobCardProps {
  job: Job;
  lockMessage?: string | null;
  onClick: () => void;
}

/* =======================
   Helper to format numbers
======================= */
const formatNumber = (num: number) => num.toLocaleString();

/* =======================
   Job Card Component
======================= */
function JobCard({ job, lockMessage, onClick }: JobCardProps) {
  return (
    <div
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden border border-gray-100"
      onClick={onClick}
    >
      {/* Lock Overlay */}
      {lockMessage && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl z-10 p-4 text-center">
          <Lock className="w-8 h-8 text-orange-600" />
          <p className="text-sm text-gray-700 font-medium">{lockMessage}</p>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {job.title}
          </h3>
          <span className="text-xs font-medium text-gray-500">
            {job.organization}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            {job.currency === "NGN"
              ? `₦${formatNumber(job.salaryMin)} - ₦${formatNumber(
                  job.salaryMax
                )}`
              : `$${formatNumber(job.salaryMin)} - $${formatNumber(
                  job.salaryMax
                )}`}
          </span>
          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            {job.remoteType}
          </span>
        </div>

        {!lockMessage && (
          <button className="mt-3 w-full sm:w-auto px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

/* =======================
   Worker Jobs Page
======================= */
export default function WorkerJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* =======================
     Fetch user, jobs, applications
  ======================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get latest user
        const userRes = await newRequest.get("/users/me");
        const currentUser = userRes.data;
        setUser(currentUser);

        // Get jobs
        const jobsRes = await newRequest.get("/jobs/");
        const fetchedJobs: Job[] = jobsRes.data.map((j: any) => {
          const currency = j.salaryRange?.currency || "USD";
          const min = j.salaryRange?.min || 0;
          const max = j.salaryRange?.max || 0;
          return {
            id: j._id,
            title: j.title,
            organization: j.organizationId?.organization?.name || "Unknown",
            salary:
              currency === "NGN"
                ? `₦${formatNumber(min)} - ₦${formatNumber(max)}`
                : `$${formatNumber(min)} - $${formatNumber(max)}`,
            salaryMin: min,
            salaryMax: max,
            currency,
            remoteType: j.type || "Remote",
          };
        });

        // VIP filter
        const vipStatus = currentUser.vipSubscription?.active;
        const visibleJobs = vipStatus
          ? fetchedJobs
          : fetchedJobs.filter((job) => {
              if (job.currency === "USD") return job.salaryMax <= 250;
              if (job.currency === "NGN") return job.salaryMax <= 200_000;
              return true;
            });

        setJobs(visibleJobs);
        setFilteredJobs(visibleJobs);

        // Get user applications
        const appsRes = await newRequest.get("/application/user");
        const appsData: Application[] = appsRes.data.map((a: any) => ({
          jobId: a.jobId._id,
          status: a.status,
        }));
        setUserApplications(appsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  /* =======================
     Search Filter
  ======================= */
  useEffect(() => {
    if (!jobs.length) return;

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.organization.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredJobs(filtered);
  }, [search, jobs]);

  /* =======================
     Lock Logic
  ======================= */
  const getLockMessage = (job: Job) => {
    if (!user) return null;

    const vipStatus = user.vipSubscription?.active;

    const salaryLock =
      (!vipStatus && job.currency === "USD" && job.salaryMax > 250) ||
      (!vipStatus && job.currency === "NGN" && job.salaryMax > 200_000);

    const application = userApplications.find((app) => app.jobId === job.id);

    if (application) return `Already Applied - Status: ${application.status}`;
    if (salaryLock) return "VIP Only";

    return null;
  };

  /* =======================
     Render
  ======================= */
  if (!user) return null;
  if (loading) return <p>Loading jobs...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job Listings</h1>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search jobs or companies..."
          className="border p-3 rounded-xl w-full sm:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            lockMessage={getLockMessage(job)}
            onClick={() => {
              if (!getLockMessage(job)) router.push(`/remote/jobs/${job.id}`);
            }}
          />
        ))}

        {filteredJobs.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No jobs found.
          </p>
        )}
      </div>
    </div>
  );
}

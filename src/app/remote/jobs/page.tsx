"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import newRequest from "../../utils/newRequest";

interface Job {
  id: string;
  title: string;
  organization: string;
  salary: string; // e.g. "$300/month"
  remoteType: string;
  salaryMin: number; // numeric salary for VIP check
}

interface Application {
  jobId: string;
  status: "pending" | "accepted" | "rejected";
}

interface JobCardProps {
  job: Job;
  lockMessage?: string;
  onClick: () => void;
}

function JobCard({ job, lockMessage, onClick }: JobCardProps) {
  return (
    <div
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden border border-gray-100"
      onClick={onClick}
    >
      {/* Lock overlay */}
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
            {job.salary}
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

export default function WorkerJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) return router.replace("/login");

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "remote_worker") return router.replace("/login");
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        // Fetch all jobs
        const jobsRes = await newRequest.get("/jobs/");
        const fetchedJobs: Job[] = jobsRes.data.map((j: any) => ({
          id: j._id,
          title: j.title,
          organization: j.organizationId?.organization?.name || "Unknown",
          salary: `$${j.salaryRange?.min || 0} - $${j.salaryRange?.max || 0}`,
          salaryMin: j.salaryRange?.min || 0,
          remoteType: j.type || "Remote",
        }));

        // Filter based on VIP
        const vipStatus = parsedUser.vipSubscription?.active;
        const visibleJobs = vipStatus
          ? fetchedJobs
          : fetchedJobs.filter((j) => j.salaryMin <= 250);
        setJobs(visibleJobs);
        setFilteredJobs(visibleJobs);

        // Fetch user's applications
        const appsRes = await newRequest.get("/application/user");
        const appsData: Application[] = appsRes.data.map((a: any) => ({
          jobId: a.jobId._id,
          status: a.status,
        }));
        setUserApplications(appsData);
      } catch (err) {
        console.error("Error fetching jobs or applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Filter jobs whenever search changes
  useEffect(() => {
    if (!jobs.length) return;

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.organization.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [search, jobs]);

  const getLockMessage = (job: Job) => {
    if (!user) return null;
    const vipStatus = user.vipSubscription?.active;

    // Locked for salary
    const salaryLock = job.salaryMin > 250 && !vipStatus;

    // Locked if user already applied
    const application = userApplications.find((app) => app.jobId === job.id);
    const applicationLock =
      application &&
      ["pending", "accepted", "rejected"].includes(application.status);

    if (applicationLock)
      return `Already Applied - Status: ${application!.status}`;
    if (salaryLock) return "VIP Only";

    return null;
  };

  if (!user) return null;
  if (loading) return <p>Loading jobs...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job Listings</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
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

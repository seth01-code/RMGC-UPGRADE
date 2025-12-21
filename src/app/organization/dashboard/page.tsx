"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import newRequest from "../../utils/newRequest";
import { format } from "date-fns";
import Topbar from "./components/Topbar";

// Icons
import {
  Briefcase,
  Users,
  CheckCircle,
  Settings,
  CreditCard,
  FileText,
  PlusCircle,
  X,
  MapPin,
} from "lucide-react";
import OrganizationFooter from "./components/footer";

// ---------------- Components ----------------
const StatCard = ({ label, value, Icon }: any) => {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [value, count]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 flex items-center gap-4"
    >
      <div className="bg-orange-50 rounded-lg p-3">
        <Icon className="w-6 h-6 text-orange-500" />
      </div>
      <div>
        <div className="text-2xl font-semibold text-gray-800">{display}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
};

const JobCard = ({ job, onClick }: any) => {
  const { min, max, currency } = job.salaryRange || {
    min: 0,
    max: 0,
    currency: "USD",
  };
  const deadline = job.deadline
    ? format(new Date(job.deadline), "MMM dd, yyyy")
    : "N/A";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer w-full"
      onClick={() => onClick(job)}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
        {/* Left side: Job info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {job.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {job.type.charAt(0).toUpperCase() + job.type.slice(1)} •{" "}
            {job.location}
          </p>
        </div>

        {/* Right side: Salary & Status */}
        <div className="flex flex-col md:items-end items-start gap-1 mt-2 md:mt-0 min-w-[120px]">
          <p className="text-xs text-gray-400 font-medium">Salary</p>
          <div className="text-sm font-bold text-orange-500 truncate">
            {currency} {min} - {max}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 md:mt-0 ${
              job.status.toLowerCase() === "active"
                ? "bg-green-50 text-green-600"
                : "bg-gray-50 text-gray-600"
            }`}
          >
            {job.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
// Sample applicants (normally fetched from API)
const sampleApplicants = [
  {
    id: "app1",
    name: "John Doe",
    email: "john@example.com",
    resume: "https://example.com/resume/john.pdf",
    status: "Pending Review",
    appliedAt: "2025-11-29T10:30:00Z",
  },
  {
    id: "app2",
    name: "Jane Smith",
    email: "jane@example.com",
    resume: "https://example.com/resume/jane.pdf",
    status: "Reviewed",
    appliedAt: "2025-11-28T14:15:00Z",
  },
  {
    id: "app3",
    name: "Mark Taylor",
    email: "mark@example.com",
    resume: "https://example.com/resume/mark.pdf",
    status: "Pending Review",
    appliedAt: "2025-11-30T09:00:00Z",
  },
];

const ApplicantCard = ({ applicant }: any) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex justify-between items-center gap-4">
      <div>
        <div className="text-sm font-semibold text-gray-800">
          {applicant.name}
        </div>
        <div className="text-xs text-gray-500">{applicant.email}</div>
        <div className="text-xs text-gray-400 mt-1">
          Applied: {format(new Date(applicant.appliedAt), "MMM dd, yyyy")}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href={applicant.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          View Resume
        </a>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            applicant.status === "Reviewed"
              ? "bg-green-50 text-green-600"
              : "bg-yellow-50 text-yellow-600"
          }`}
        >
          {applicant.status}
        </span>
      </div>
    </div>
  );
};

// ---------------- Main Dashboard ----------------
export default function OrganizationDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await newRequest.get("/users/me");
        const org = userRes.data.organization;
        setUser(userRes.data);

        const jobsRes = await newRequest.get("/jobs/organization");
        const jobsWithApplicants = await Promise.all(
          jobsRes.data.map(async (job: any) => {
            const appsRes = await newRequest.get(`/application/job/${job._id}`);
            return { ...job, applicants: appsRes.data };
          })
        );
        setJobs(jobsWithApplicants);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseJob = async (jobId: string) => {
    try {
      // Send PUT request to backend to update status
      const { data: updatedJob } = await newRequest.put(`/jobs/${jobId}`, {
        status: "Closed",
      });

      // Update local state
      setJobs((prev) =>
        prev.map((job) => (job._id === jobId ? updatedJob : job))
      );

      // If modal is open for this job, update selectedJob too
      if (selectedJob?._id === jobId) {
        setSelectedJob(updatedJob);
      }
    } catch (err) {
      console.error("Failed to close job", err);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      const { data: updatedJob } = await newRequest.put(`/jobs/${jobId}`, {
        status: "Active",
      });

      // Update local state
      setJobs((prev) =>
        prev.map((job) => (job._id === jobId ? updatedJob : job))
      );

      if (selectedJob?._id === jobId) {
        setSelectedJob(updatedJob);
      }
    } catch (err) {
      console.error("Failed to run job", err);
    }
  };

  const org = user?.organization || {};
  const verified = user?.vipSubscription?.active === true;

  const stats = useMemo(() => {
    return {
      activeJobs: jobs.filter((j) => j.status.toLowerCase() === "active")
        .length,
      applicants: jobs.reduce(
        (sum, job) => sum + (job.applicants?.length || 0),
        0
      ),
      pending: 0,
    };
  }, [jobs]);

  const recentApplicants = useMemo(() => {
    return jobs
      .flatMap((job) =>
        (job.applicants || []).map((app: any) => ({
          ...app,
          jobId: job,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  }, [jobs]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-10 bg-gradient-to-br from-orange-50 via-white to-orange-100 animate-pulse">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
          {/* Sidebar Skeleton */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 space-y-4 border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-300/40 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-gray-300/40 rounded" />
                  <div className="w-20 h-3 bg-gray-300/40 rounded" />
                </div>
              </div>

              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full h-10 bg-gray-300/40 rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Dashboard Skeleton */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Topbar skeleton */}
            <div className="w-full h-14 bg-white/60 border border-orange-100 rounded-2xl" />

            {/* Profile Card Skeleton */}
            <div className="bg-white/60 border border-orange-100 shadow rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-300/40 rounded-xl" />
                <div className="space-y-3">
                  <div className="w-40 h-5 bg-gray-300/40 rounded" />
                  <div className="w-32 h-4 bg-gray-300/40 rounded" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-28 h-10 bg-gray-300/40 rounded-lg" />
                <div className="w-28 h-10 bg-gray-300/40 rounded-lg" />
              </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 border border-orange-100 rounded-2xl p-6"
                >
                  <div className="w-12 h-12 bg-gray-300/40 rounded-lg mb-4" />
                  <div className="w-20 h-6 bg-gray-300/40 rounded mb-2" />
                  <div className="w-16 h-4 bg-gray-300/40 rounded" />
                </div>
              ))}
            </div>

            {/* Recent Jobs Skeleton */}
            <div className="bg-white/60 border border-orange-100 rounded-2xl p-4 space-y-4">
              <div className="w-40 h-5 bg-gray-300/40 rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-300/40 rounded-xl border border-gray-200"
                  />
                ))}
              </div>
            </div>

            {/* Recent Applicants Skeleton */}
            <div className="bg-white/60 border border-orange-100 rounded-2xl p-4 space-y-4">
              <div className="w-48 h-5 bg-gray-300/40 rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-300/40 rounded-xl border border-gray-200"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="bg-white/70 backdrop-blur-md border border-red-200 shadow-lg rounded-3xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 flex items-center justify-center bg-red-100 border border-red-200 rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Couldn’t Load Your Account
          </h2>

          <p className="text-gray-700 mb-6">
            We had trouble retrieving your profile. Please refresh the page or
            try again in a moment.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Recent Jobs (sorted by createdAt descending)
  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <>
      {/* ================= TOPBAR (OUTSIDE GRID) ================= */}
      <Topbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("currentUser");
          setUser(null);
          window.location.href = "/login";
        }}
        // onSidebarToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* ================= PAGE CONTENT ================= */}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-16 p-4 md:p-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
          {/* ================= SIDEBAR ================= */}
          <div className="col-span-12 lg:col-span-3">
            <aside
              className={`w-full lg:w-auto
          ${sidebarOpen ? "block" : "hidden lg:block"}
          bg-white/90 backdrop-blur-md
          border-r border-orange-50
          rounded-2xl
          p-4
          flex flex-col gap-4
          relative z-30`}
            >
              {/* Sidebar Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-orange-50 relative">
                  <Image
                    src={org.logo}
                    alt="logo"
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    {org.name}
                    {verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{org.industry}</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex flex-col gap-1">
                <Link
                  href="/organization/jobs"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
                >
                  <Briefcase className="w-4 h-4 text-orange-500" />
                  Jobs
                </Link>

                <Link
                  href="/organization/applicants"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
                >
                  <Users className="w-4 h-4 text-orange-500" />
                  Applicants
                </Link>

                <Link
                  href="/organization/billing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
                >
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  Billing
                </Link>

                <Link
                  href="/organization/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
                >
                  <Settings className="w-4 h-4 text-orange-500" />
                  Settings
                </Link>
              </nav>

              <div className="text-xs text-gray-400 mt-4">
                Verified:
                <span className="ml-1 text-green-600 font-semibold">
                  {verified ? "Yes" : "No"}
                </span>
              </div>
            </aside>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <main className="col-span-12 lg:col-span-9 space-y-6 relative z-40">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative rounded-xl overflow-hidden border-4 border-orange-100">
                  <Image
                    src={org.logo}
                    alt={org.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {org.name}
                    {verified && (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    )}
                  </h1>
                  <p className="text-sm text-gray-500">{org.industry}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/organization/jobs/new"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Job
                </Link>

                <Link
                  href="/organization/settings"
                  className="inline-flex items-center gap-2 bg-gray-200 border border-gray-100 px-4 py-2 rounded-lg text-sm"
                >
                  <FileText className="w-4 h-4 text-gray-600" />
                  Edit Profile
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Active Jobs"
                value={stats.activeJobs}
                Icon={Briefcase}
              />
              <StatCard
                label="Total Applicants"
                value={stats.applicants}
                Icon={Users}
              />
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Recent Jobs</div>
                <Link
                  href="/organization/jobs"
                  className="text-sm text-orange-500"
                >
                  View all
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  No jobs posted yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentJobs.map((job) => (
                    <JobCard key={job._id} job={job} onClick={setSelectedJob} />
                  ))}
                </div>
              )}
            </div>
            {/* Recent Applicants */}
            <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Applicants
                </h2>

                <Link
                  href="/organization/applicants"
                  className="text-sm text-orange-600 hover:underline font-medium"
                >
                  View all →
                </Link>
              </div>

              {recentApplicants.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm">
                  No applicants yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentApplicants.map((app) => (
                    <div
                      key={app._id}
                      className="group border border-gray-100 rounded-xl p-4 bg-white transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      {/* Top row */}
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-orange-100">
                          <Image
                            src={app.applicantId?.img || "/avatar.png"}
                            alt={app.applicantId?.username || "Applicant"}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>

                        {/* Name + job */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {app.applicantId?.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Applied for{" "}
                            <span className="font-medium">
                              {app.jobId?.title}
                            </span>
                          </p>
                        </div>

                        {/* Status */}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
                            app.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : app.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>

                        {app.cvUrl && (
                          <a
                            href={app.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 font-medium hover:underline"
                          >
                            View CV
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ================= MODAL ================= */}
        <AnimatePresence>
          {selectedJob && (
            <>
              <motion.div
                className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)}
              />

              <motion.div
                className="fixed inset-0 z-100 flex items-center justify-center px-4"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
              >
                <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh] shadow-lg">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedJob(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-full flex mb-4">
                    {selectedJob.status === "Active" ? (
                      <button
                        onClick={() => handleCloseJob(selectedJob._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Stop Running Job
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRunJob(selectedJob._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        Run Job
                      </button>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-4">
                    {selectedJob.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedJob.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4 text-sm">
                    <div className="bg-gray-100 px-2 py-1 rounded-full">
                      <Briefcase className="w-3 h-3 inline-block mr-1" />{" "}
                      {selectedJob.type}
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded-full">
                      <MapPin className="w-3 h-3 inline-block mr-1" />{" "}
                      {selectedJob.location}
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {selectedJob.experienceLevel}
                    </div>
                    <div className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                      {selectedJob.industry}
                    </div>
                    <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                      Salary: {selectedJob.salaryRange.currency}{" "}
                      {selectedJob.salaryRange.min} -{" "}
                      {selectedJob.salaryRange.max}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Requirements:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {selectedJob.requirements.map(
                        (req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Responsibilities:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {selectedJob.responsibilities.map(
                        (res: string, idx: number) => (
                          <li key={idx}>{res}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Benefits:</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {selectedJob.benefits.map((ben: string, idx: number) => (
                        <li key={idx}>{ben}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm text-gray-500">
                    Application Deadline:{" "}
                    {new Date(selectedJob.deadline).toLocaleDateString("en-US")}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <OrganizationFooter />
    </>
  );
}

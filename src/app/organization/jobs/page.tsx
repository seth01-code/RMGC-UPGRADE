"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Filter, Briefcase, MapPin, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import newRequest from "../../utils/newRequest";
import OrganizationNavbar from "../dashboard/components/navbar";
import OrganizationFooter from "../dashboard/components/footer";

function JobCard({ job, onClick }: any) {
  const deadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(job)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> {job.type}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {job.location}
          </p>
        </div>

        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between mt-4 gap-2 text-xs">
        <div className="text-gray-500">
          <span className="font-medium">Salary:</span>{" "}
          {job.salaryRange?.currency} {job.salaryRange?.min} -{" "}
          {job.salaryRange?.max}
        </div>

        <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {job.experienceLevel || "N/A"}
        </div>

        <div className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
          {job.industry || "N/A"}
        </div>

        <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
          Deadline: {deadline}
        </div>

        <div className="text-gray-500">
          <span className="font-medium">Applicants:</span>{" "}
          {job.applicants?.length || 0}
        </div>
      </div>
    </motion.div>
  );
}

export default function OrganizationJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    newRequest
      .get("/jobs/organization")
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(query.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>

          {/* Text */}
          <p className="text-gray-700 font-medium text-lg">
            Loading available jobs…
          </p>

          {/* Subtext shimmer */}
          <div className="mt-2 h-3 w-40 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <OrganizationNavbar />
      <div className="p-6 space-y-6 relative">
        {/* Page Content */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
            <Link
              href="/organization/jobs/new"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
            >
              <PlusCircle className="w-5 h-5" /> Post New Job
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-orange-100 p-4 flex items-center gap-4 mt-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
            />
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No jobs found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} onClick={setSelectedJob} />
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedJob && (
            <>
              {/* Backdrop with blur */}
              <motion.div
                className="fixed h-full inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)} // click outside to close
              />

              {/* Modal */}
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
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

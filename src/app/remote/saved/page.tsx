"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkX, Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  organization: string;
  salary: string;
  remoteType: string;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  /* ---------------- AUTH (LOCALSTORAGE) ---------------- */
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

    // 🔹 Mock saved jobs (replace with API later)
    setSavedJobs([
      {
        id: "1",
        title: "Frontend Developer",
        organization: "Tech Corp",
        salary: "$200/month",
        remoteType: "Remote",
      },
      {
        id: "2",
        title: "Backend Engineer",
        organization: "API Solutions",
        salary: "$1,200/month",
        remoteType: "Remote",
      },
    ]);
  }, [router]);

  if (!user) return null;

  /* ---------------- REMOVE SAVED JOB ---------------- */
  const removeSavedJob = (jobId: string) => {
    setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));

    // 🔹 Later:
    // DELETE /saved-jobs/:jobId
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Saved Jobs</h1>
        <p className="text-gray-500">
          Jobs you bookmarked to apply later
        </p>
      </div>

      {/* Empty State */}
      {savedJobs.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">
            You haven’t saved any jobs yet.
          </p>
          <button
            onClick={() => router.push("/remote/jobs")}
            className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl"
          >
            Browse Jobs
          </button>
        </div>
      )}

      {/* Saved Jobs List */}
      <div className="space-y-4">
        {savedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center gap-4"
          >
            <div
              onClick={() => router.push(`/remote/jobs/${job.id}`)}
              className="cursor-pointer"
            >
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-gray-500">{job.organization}</p>
              <p className="mt-1 font-medium text-green-700">
                {job.salary}
              </p>
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                {job.remoteType}
              </span>
            </div>

            <button
              onClick={() => removeSavedJob(job.id)}
              className="text-red-600 hover:bg-red-50 p-3 rounded-full"
              title="Remove saved job"
            >
              <BookmarkX className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

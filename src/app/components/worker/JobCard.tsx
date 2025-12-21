"use client";

import { Lock } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    organization: string;
    salary: string; // e.g. "$300/month"
    remoteType: string;
  };
  lockMessage?: string; // custom lock reason (VIP, already applied, etc.)
  onClick: () => void;
}

export default function JobCard({ job, lockMessage, onClick }: JobCardProps) {
  const isLocked = Boolean(lockMessage);

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden border border-gray-100`}
      onClick={onClick}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl z-10 p-4 text-center">
          <Lock className="w-8 h-8 text-orange-600" />
          <p className="text-sm text-gray-700 font-medium">{lockMessage}</p>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* Title & organization */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {job.title}
          </h3>
          <span className="text-xs font-medium text-gray-500">
            {job.organization}
          </span>
        </div>

        {/* Salary & type badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
            {job.salary}
          </span>
          <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            {job.remoteType}
          </span>
        </div>

        {/* Apply button */}
        {!isLocked && (
          <button className="mt-3 w-full sm:w-auto px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

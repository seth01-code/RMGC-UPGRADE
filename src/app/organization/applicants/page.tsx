"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import newRequest from "../../utils/newRequest";
import OrganizationNavbar from "../dashboard/components/navbar";
import OrganizationFooter from "../dashboard/components/footer";

// ==================== Applicant Modal ====================
function ApplicantModal({ applicant, onClose }: any) {
  if (!applicant) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold"
            onClick={onClose}
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-orange-100 flex-shrink-0">
              <Image
                src={applicant.applicantId?.img || "/avatar.png"}
                alt={applicant.applicantId?.username || "Applicant"}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-900 truncate">
                {applicant.applicantId?.username || applicant.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                Applied for{" "}
                <span className="font-medium">
                  {applicant.appliedJob || applicant.jobId?.title}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Applied on {new Date(applicant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          {applicant.coverLetter && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Cover Letter
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 text-sm leading-relaxed break-words">
                {applicant.coverLetter}
              </div>
            </div>
          )}

          {/* CV */}
          {applicant.cvUrl && (
            <a
              href={applicant.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium hover:bg-orange-200 transition w-full text-center sm:w-auto"
            >
              View CV
            </a>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==================== Applicant Card ====================
function ApplicantCard({ applicant, onStatusChange, onOpenModal }: any) {
  const handleStatusUpdate = async (status: string) => {
    try {
      await newRequest.put(`/application/${applicant._id}/status`, { status });
      onStatusChange(applicant._id, status);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-all flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 border-b border-gray-100">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-orange-100 flex-shrink-0">
          <Image
            src={applicant.applicantId?.img || "/avatar.png"}
            alt={applicant.applicantId?.username || "Applicant"}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {applicant.applicantId?.username || applicant.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            Applied for{" "}
            <span className="font-medium">
              {applicant.appliedJob || applicant.jobId?.title}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Applied on {new Date(applicant.createdAt).toLocaleDateString()}
          </p>
        </div>
        {applicant.cvUrl && (
          <a
            href={applicant.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 font-medium text-sm hover:underline whitespace-nowrap mt-2 sm:mt-0"
          >
            View CV
          </a>
        )}
      </div>

      {/* Cover Letter Availability */}
      {applicant.coverLetter && (
        <div className="p-4 border-b border-gray-100">
          <button
            className="text-blue-600 font-medium hover:underline w-full text-left"
            onClick={() => onOpenModal(applicant)}
          >
            Cover Letter Available - Click to Read
          </button>
        </div>
      )}

      {/* Status Buttons */}
      <div className="flex flex-wrap gap-2 p-4">
        {["pending", "accepted", "rejected"].map((status) => {
          const isActive = applicant.status === status;
          const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            accepted: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
          };
          return (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status)}
              className={`flex-1 sm:flex-auto py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105 ${
                isActive
                  ? `${colors[status]} ring-2 ring-orange-300`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ==================== Organization Applicants Page ====================
export default function OrganizationApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const jobsRes = await newRequest.get("/jobs/organization");
        const jobs = jobsRes.data;
        const allApplicants: any[] = [];

        await Promise.all(
          jobs.map(async (job: any) => {
            const resApp = await newRequest.get(`/application/job/${job._id}`);
            resApp.data.forEach((app: any) =>
              allApplicants.push({ ...app, appliedJob: job.title })
            );
          })
        );

        allApplicants.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setApplicants(allApplicants);
      } catch (err) {
        console.error("Failed to fetch applicants", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    setApplicants((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status } : app))
    );
  };

  const openModal = (applicant: any) => setSelectedApplicant(applicant);
  const closeModal = () => setSelectedApplicant(null);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading applicants...
      </div>
    );

  if (applicants.length === 0)
    return (
      <>
        <OrganizationNavbar />
        <div className="min-h-screen flex items-center justify-center text-gray-500 px-4">
          No applicants yet.
        </div>
        <OrganizationFooter />
      </>
    );

  return (
    <>
      <OrganizationNavbar />
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center md:text-left">
          Applicants
        </h1>
        <p className="text-gray-600 text-center md:text-left">
          Review all applicants who have applied for your jobs. Click on "Cover
          Letter Available" to read the full details.
        </p>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {applicants.map((applicant) => (
            <ApplicantCard
              key={applicant._id}
              applicant={applicant}
              onStatusChange={handleStatusChange}
              onOpenModal={openModal}
            />
          ))}
        </div>
      </div>

      <ApplicantModal applicant={selectedApplicant} onClose={closeModal} />
      <OrganizationFooter />
    </>
  );
}

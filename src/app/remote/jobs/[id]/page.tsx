"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Lock,
  CheckCircle,
  UploadCloud,
  Briefcase,
  Calendar,
  Building2,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import newRequest from "../../../utils/newRequest";
import upload from "../../../utils/upload";

/* ================= TYPES ================= */
interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  experienceLevel: string;
  industry: string;
  type: string;
  status: string;
  deadline: string;

  salaryRange: {
    min: number;
    max: number;
    currency: "USD" | "NGN";
  };
}

/* ================= COMPONENT ================= */
export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [cvUrl, setCvUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ================= HELPER ================= */
  const formatNumber = (num: number) => num.toLocaleString();

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await newRequest.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.replace("/login");
      }
    };

    fetchUser();
  }, [router]);

  /* ================= FETCH JOB ================= */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await newRequest.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch {
        toast.error("Failed to load job");
        router.replace("/remote/jobs");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJob();
  }, [jobId, router]);

  if (loading || !job || !user) return null;

  /* ================= VIP LOGIC ================= */
  const isVIP = user.vipSubscription?.active;
  const isLocked =
    (job.salaryRange.currency === "USD" &&
      job.salaryRange.max > 250 &&
      !isVIP) ||
    (job.salaryRange.currency === "NGN" &&
      job.salaryRange.max > 200_000 &&
      !isVIP);

  /* ================= CV UPLOAD ================= */
  const handleCvUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const res = await upload(file, (p) => setUploadProgress(p));

    if (res?.url) {
      setCvUrl(res.url);
      toast.success("CV uploaded successfully");
    } else {
      toast.error("CV upload failed");
    }

    setUploading(false);
  };

  /* ================= APPLY ================= */
  const handleApply = async () => {
    if (isLocked || submitting || !cvUrl) return;

    try {
      setSubmitting(true);

      await newRequest.post(`/application/${job._id}`, {
        cvUrl,
        coverLetter,
      });

      toast.success("Application submitted successfully");
      router.push("/remote/applications");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= SALARY DISPLAY ================= */
  const displaySalary = () => {
    const { min, max, currency } = job.salaryRange;
    const formattedMin = formatNumber(min);
    const formattedMax = formatNumber(max);

    return currency === "NGN"
      ? `₦${formattedMin} - ₦${formattedMax}`
      : `$${formattedMin} - $${formattedMax}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ================= HEADER ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-3xl font-bold">{job.title}</h1>

        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
            {job.location}
          </span>

          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {job.type}
          </span>

          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {displaySalary()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Experience: {job.experienceLevel}
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Industry: {job.industry}
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Status: {job.status}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">Job Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
      </div>

      {/* ================= RESPONSIBILITIES ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-3">Responsibilities</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {job.responsibilities.map((item, i) => (
            <li key={i}>{item.trim()}</li>
          ))}
        </ul>
      </div>

      {/* ================= REQUIREMENTS ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-3">Requirements</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {job.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      {/* ================= BENEFITS ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold text-lg mb-3">Benefits</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {job.benefits.map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>
      </div>

      {/* ================= APPLY ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {isLocked ? (
          <div className="flex flex-col items-center text-center gap-4">
            <Lock className="w-8 h-8 text-orange-600" />
            <p className="font-medium">
              Jobs above{" "}
              <strong>
                {job.salaryRange.currency === "NGN" ? "₦200,000" : "$250"}
              </strong>{" "}
              are for VIP workers only.
            </p>
            <button
              onClick={() => router.push("/payment/remote-vip")}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl"
            >
              Upgrade to VIP
            </button>
          </div>
        ) : (
          <>
            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload CV (PDF)
              </label>

              <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50">
                <UploadCloud className="w-5 h-5 text-gray-600" />
                <span className="text-sm">
                  {cvUrl ? "CV uploaded successfully" : "Choose PDF file"}
                </span>

                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) =>
                    e.target.files && handleCvUpload(e.target.files[0])
                  }
                />
              </label>

              {uploading && (
                <div className="mt-2 text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Letter (optional)
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <button
              onClick={handleApply}
              disabled={!cvUrl || submitting}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {submitting ? "Submitting..." : "Apply for this Job"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import newRequest from "../../../utils/newRequest";
import { useRouter } from "next/navigation";
import OrganizationNavbar from "../../dashboard/components/navbar";
import OrganizationFooter from "../../dashboard/components/footer";

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    type: "remote",
    location: "Remote",
    salaryRange: { min: 0, max: 0, currency: "USD" },
    description: "",
    deadline: "",
    industry: "",
    experienceLevel: "",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    field?: string,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (field && typeof index === "number") {
      const updatedArray = [...form[field]];
      updatedArray[index] = value;
      setForm({ ...form, [field]: updatedArray });
      return;
    }

    if (name === "minSalary") {
      setForm({
        ...form,
        salaryRange: { ...form.salaryRange, min: Number(value) },
      });
      return;
    }

    if (name === "maxSalary") {
      setForm({
        ...form,
        salaryRange: { ...form.salaryRange, max: Number(value) },
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await newRequest.post("/jobs", form);
      router.push("/organization/jobs");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const renderArrayInput = (
    label: string,
    field: "requirements" | "responsibilities" | "benefits"
  ) => (
    <div className="col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-600">{label}s</label>
      {form[field].map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleChange(e, field, i)}
            placeholder={`Enter ${label.toLowerCase()} ${i + 1}`}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
          <button
            type="button"
            onClick={() => {
              const updatedArray = [...form[field]];
              updatedArray.splice(i, 1);
              setForm({ ...form, [field]: updatedArray });
            }}
            className="text-red-500 px-2 rounded hover:bg-red-100"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setForm({ ...form, [field]: [...form[field], ""] })}
        className="text-orange-500 mt-1 px-2 rounded hover:bg-orange-50"
      >
        + Add {label}
      </button>
    </div>
  );

  return (
    <>
      <OrganizationNavbar />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <PlusCircle className="w-7 h-7 text-orange-500" /> Post New Job
        </h1>

        {error && (
          <div className="text-red-600 bg-red-100 border border-red-300 p-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Job Title */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-600">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter job title"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Job Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Industry
            </label>
            <input
              type="text"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              placeholder="Enter industry"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={form.experienceLevel}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="">Select experience level</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              readOnly
              className="border border-gray-300 rounded-lg px-4 py-2 w-full bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          {/* Salary Range */}
          <div className="flex gap-2 col-span-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">
                Minimum Salary (USD)
              </label>
              <input
                type="number"
                name="minSalary"
                value={form.salaryRange.min}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">
                Maximum Salary (USD)
              </label>
              <input
                type="number"
                name="maxSalary"
                value={form.salaryRange.max}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-600">
              Job Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter job description"
              className="border border-gray-300 rounded-lg px-4 py-3 h-36 w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
            />
          </div>

          {/* Requirements / Responsibilities / Benefits */}
          {renderArrayInput("Requirement", "requirements")}
          {renderArrayInput("Responsibility", "responsibilities")}
          {renderArrayInput("Benefit", "benefits")}

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md w-full"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
      <OrganizationFooter />
    </>
  );
}

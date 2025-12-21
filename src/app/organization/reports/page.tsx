"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// ---------------- Mock Data ----------------
const data = [
  { job: "Frontend Developer", applicants: 12 },
  { job: "Backend Engineer", applicants: 7 },
  { job: "Customer Support", applicants: 4 },
];

export default function OrganizationReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Applicants per Job</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="job" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="applicants" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

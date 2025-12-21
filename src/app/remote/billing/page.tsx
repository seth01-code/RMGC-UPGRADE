"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, XCircle, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import newRequest from "../../utils/newRequest";

export default function WorkerBillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    newRequest
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setError("Unable to load billing data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full" />
      </div>
    );

  if (error || !user)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 text-red-600 rounded-xl px-6 py-4 shadow-sm max-w-sm text-center">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );

  const vip = user.vipSubscription;

  const startDate = vip?.startDate
    ? new Date(vip.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const endDate = vip?.endDate
    ? new Date(vip.endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const lastCharge = vip?.lastCharge;
  const invoices = vip?.invoices || [];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center md:text-left">
        Billing & Subscription
      </h1>

      {/* Active Subscription Card */}
      <div className="bg-white rounded-xl border border-orange-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
          <CreditCard className="w-8 h-8 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">VIP Subscription</h2>
            <p className="text-sm text-gray-500">
              {vip?.active
                ? `Active until ${endDate}`
                : "No active subscription"}
            </p>
            <p className="text-xs text-gray-400">
              Amount: {vip?.currency} {vip?.amount?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Start Date: {startDate}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-2 font-semibold ${
            vip?.active ? "text-green-600" : "text-red-600"
          }`}
        >
          {vip?.active ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {vip?.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Last Payment */}
      {lastCharge && (
        <div className="bg-white rounded-xl border border-orange-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Last Payment</h2>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-2 sm:gap-0"
          >
            <div>
              <p className="font-medium text-gray-800">
                Transaction ID: {vip.transactionId}
              </p>
              <p className="text-xs text-gray-500">
                Charged on: {new Date(lastCharge.chargedAt).toLocaleString()}
              </p>
            </div>

            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="font-semibold text-gray-800">
                {lastCharge.currency} {lastCharge.amount.toLocaleString()}
              </span>
              <p
                className={`font-semibold ${
                  lastCharge.status === "successful"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {lastCharge.status.toUpperCase()}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-orange-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-orange-500" /> Invoice History
        </h2>

        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv: any, i: number) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-3 gap-2 sm:gap-0"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Ref: {inv.invoiceId || inv.txRef}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(inv.chargedAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-left sm:text-right mt-1 sm:mt-0">
                  <span className="font-semibold text-gray-800">
                    {inv.currency} {inv.amount.toLocaleString()}
                  </span>
                  <p
                    className={`font-semibold ${
                      inv.status === "successful"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {inv.status.toUpperCase()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

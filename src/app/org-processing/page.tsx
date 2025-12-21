// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { toast } from "react-toastify";
// import newRequest from "../utils/newRequest";
// import { Loader2, CheckCircle, XCircle } from "lucide-react";

// const OrganizationProcessing = () => {
//   const [status, setStatus] = useState<"checking" | "success" | "failed">(
//     "checking"
//   );
//   const params = useSearchParams();
//   const tx_ref = params.get("tx_ref");
//   const transaction_id = params.get("transaction_id"); // <-- Capture it too

//   useEffect(() => {
//     const verifyPayment = async () => {
//       try {
//         const res = await newRequest.post("/payments/organization/verify", {
//           tx_ref,
//           transaction_id,
//         });
//         toast.success("Payment verified successfully 🎉");
//         setStatus("success");
//       } catch {
//         toast.error("Payment verification failed ❌");
//         setStatus("failed");
//       }
//     };

//     if (tx_ref || transaction_id) verifyPayment();
//   }, [tx_ref, transaction_id]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-200">
//       {status === "checking" && (
//         <div className="text-center space-y-4">
//           <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
//           <p>Verifying your payment, please wait...</p>
//         </div>
//       )}

//       {status === "success" && (
//         <div className="text-center space-y-4">
//           <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
//           <h2 className="text-2xl font-semibold">Payment Successful ✅</h2>
//           <p className="text-gray-400">
//             You can now post jobs and access your dashboard.
//           </p>
//         </div>
//       )}

//       {status === "failed" && (
//         <div className="text-center space-y-4">
//           <XCircle className="w-14 h-14 text-red-500 mx-auto" />
//           <h2 className="text-2xl font-semibold">Verification Failed ❌</h2>
//           <p className="text-gray-400">
//             We couldn’t verify your payment. Please try again.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrganizationProcessing;

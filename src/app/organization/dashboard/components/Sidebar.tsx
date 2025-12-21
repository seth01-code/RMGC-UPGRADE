// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircle,
//   Briefcase,
//   Users,
//   CreditCard,
//   Settings,
//   X,
// } from "lucide-react";

// interface SidebarProps {
//   org: { name: string; logo: string; industry: string };
//   verified: boolean;
//   sidebarOpen: boolean;
//   setSidebarOpen: (val: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   org,
//   verified,
//   sidebarOpen,
//   setSidebarOpen,
// }) => {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 1024);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <AnimatePresence>
//       {(sidebarOpen || !isMobile) && (
//         <>
//           {/* Backdrop for mobile */}
//           {isMobile && sidebarOpen && (
//             <motion.div
//               className="fixed inset-0 z-40 bg-black/40"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setSidebarOpen(false)}
//             />
//           )}

//           {/* Sidebar */}
//           <motion.aside
//             className="fixed z-50 top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-md border-r border-orange-50 rounded-2xl p-4 flex flex-col gap-4 lg:static lg:w-auto lg:block"
//             initial={{ x: isMobile && !sidebarOpen ? -300 : 0 }}
//             animate={{ x: 0 }}
//             exit={{ x: -300 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           >
//             {/* Close button for mobile */}
//             {isMobile && (
//               <div className="flex justify-end mb-4">
//                 <button onClick={() => setSidebarOpen(false)}>
//                   <X className="w-6 h-6 text-gray-600" />
//                 </button>
//               </div>
//             )}

//             {/* Sidebar content */}
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-md overflow-hidden bg-orange-50">
//                 <Image
//                   src={org.logo}
//                   alt="logo"
//                   width={36}
//                   height={36}
//                   className="object-cover"
//                 />
//               </div>
//               <div>
//                 <div className="text-sm font-semibold text-gray-800 flex items-center gap-1">
//                   {org.name}
//                   {verified && (
//                     <CheckCircle className="w-4 h-4 text-green-500" />
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400">{org.industry}</div>
//               </div>
//             </div>

//             <nav className="flex-1 flex flex-col gap-1">
//               <Link
//                 href="/organization/jobs"
//                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
//               >
//                 <Briefcase className="w-4 h-4 text-orange-500" /> Jobs
//               </Link>
//               <Link
//                 href="/organization/applicants"
//                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
//               >
//                 <Users className="w-4 h-4 text-orange-500" /> Applicants
//               </Link>
//               <Link
//                 href="/organization/billing"
//                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
//               >
//                 <CreditCard className="w-4 h-4 text-orange-500" /> Billing
//               </Link>
//               <Link
//                 href="/organization/settings"
//                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 text-sm font-medium"
//               >
//                 <Settings className="w-4 h-4 text-orange-500" /> Settings
//               </Link>
//             </nav>

//             <div className="text-xs text-gray-400 mt-4">
//               Verified:{" "}
//               <span className="ml-1 text-green-600 font-semibold">
//                 {verified ? "Yes" : "No"}
//               </span>
//             </div>
//           </motion.aside>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Sidebar;

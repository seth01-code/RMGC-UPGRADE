// components/RoutePreloader.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type RoutePreloaderProps = {
  children?: (loading: boolean) => ReactNode;
};

const RoutePreloader = ({ children }: RoutePreloaderProps) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setPrevPath(pathname);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex space-x-3 mb-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-6 h-6 bg-orange-500 rounded-full shadow-md"
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="text-xl font-bold text-black mb-4"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Loading...
            </motion.div>

            <div className="absolute bottom-12 w-32 h-1 bg-orange-500 rounded-full animate-pulse-fast shadow-sm"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {children?.(loading)}
    </>
  );
};

export default RoutePreloader;

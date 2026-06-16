// components/RoutePreloader.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const OR = "#FF6B1A";
const ORL = "#FF8C47";

type RoutePreloaderProps = {
  children?: (loading: boolean) => ReactNode;
};

const RoutePreloader = ({ children }: RoutePreloaderProps) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true);
      setProgress(0);

      // Simulate progress
      const steps = [20, 50, 75, 90];
      const timers: NodeJS.Timeout[] = steps.map((val, i) =>
        setTimeout(() => setProgress(val), i * 120)
      );

      const done = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setPrevPath(pathname);
          setProgress(0);
        }, 300);
      }, 600);

      return () => {
        timers.forEach(clearTimeout);
        clearTimeout(done);
      };
    }
  }, [pathname, prevPath]);

  return (
    <>
      {/* Top progress bar — always mounted, visible when loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="progress-bar"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              zIndex: 99999,
              background: "#1A1A1A",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${OR}, ${ORL})`,
                borderRadius: "0 2px 2px 0",
                boxShadow: `0 0 10px ${OR}80`,
                transformOrigin: "left",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
            {/* Glow tip */}
            <motion.div
              style={{
                position: "absolute",
                top: "-1px",
                height: "5px",
                width: "60px",
                background: `linear-gradient(90deg, transparent, ${ORL})`,
                borderRadius: "2px",
                filter: "blur(3px)",
              }}
              animate={{ left: `calc(${progress}% - 60px)` }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full overlay for longer transitions */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="route-overlay"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(6px)",
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Spinner */}
            <div style={{ position: "relative", width: "56px", height: "56px", marginBottom: "28px" }}>
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: `${i * 8}px`,
                    borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: i === 0 ? OR : ORL,
                    borderRightColor: i === 0 ? `${OR}30` : "transparent",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9 + i * 0.3,
                    ease: "linear",
                    direction: i % 2 === 0 ? "normal" : "reverse",
                  } as any}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: OR,
                  boxShadow: `0 0 8px ${OR}`,
                }}
              />
            </div>

            {/* Label */}
            <motion.p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: OR,
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            >
              Loading…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {children?.(loading)}
    </>
  );
};

export default RoutePreloader;
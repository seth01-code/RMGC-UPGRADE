"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const useIsLargeScreen = () => {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLarge(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isLarge;
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const isLargeScreen = useIsLargeScreen();
  const [collapsed, setCollapsed] = useState(false);

  // Mirror the sidebar's collapse toggle by listening to a custom DOM event
  // dispatched from the navbar when collapsed state changes.
  useEffect(() => {
    const handler = (e: Event) => {
      setCollapsed((e as CustomEvent<{ collapsed: boolean }>).detail.collapsed);
    };
    window.addEventListener("sidebar-collapse-change", handler);
    return () => window.removeEventListener("sidebar-collapse-change", handler);
  }, []);

  const marginLeft = isLargeScreen ? (collapsed ? 120 : 120) : 0;

  return (
    <motion.main
      animate={{ marginLeft }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 min-w-0 pt-14 lg:pt-0"
    >
      {children}
    </motion.main>
  );
}
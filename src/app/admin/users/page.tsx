"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import {
  MdVerified,
  MdOutlineStorefront,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiX,
} from "react-icons/fi";
import {
  LuBuilding2,
  LuUser,
  LuUsers,
  LuShieldAlert,
  LuCalendar,
  LuMail,
  LuPhone,
  LuMapPin,
  LuBriefcase,
  LuCrown,
  LuCircleCheck,
  LuCircleX,
} from "react-icons/lu";
import newRequest from "../../utils/newRequest";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────

interface VipSubscription {
  active: boolean;
  endDate?: string;
  gateway?: string;
  amount?: number;
  currency?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  img?: string;
  isSeller: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  suspended?: boolean;
  suspendReason?: string | null;
  suspendedAt?: string | null;
  role?: string | null;
  tier?: string | null;
  country?: string;
  countryOfResidence?: string;
  phone?: string;
  bio?: string;
  services?: string[];
  yearsOfExperience?: string;
  createdAt: string;
  vipSubscription?: VipSubscription;
  organization?: { name?: string; industry?: string };
}

interface Stats {
  total: number;
  sellers: number;
  buyers: number;
  remoteWorkers: number;
  organizations: number;
  admins: number;
  suspended: number;
  verified: number;
}

interface PaginatedResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

// ─── Constants ────────────────────────────────────────────────

const FALLBACK_AVATAR =
  "https://miamistonesource.com/wp-content/uploads/2018/05/no-avatar-25359d55aa3c93ab3466622fd2ce712d1.jpg";

const ROLE_FILTERS = [
  { value: "all", label: "All" },
  { value: "buyer", label: "Clients" },
  { value: "seller", label: "Freelancers" },
  { value: "remote_worker", label: "Remote workers" },
  { value: "organization", label: "Organizations" },
  { value: "admin", label: "Admins" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
] as const;

const LIMIT = 15;

// ─── Helpers ──────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getUserType = (u: User) => {
  if (u.isAdmin)
    return {
      label: "Admin",
      color: "bg-purple-50 text-purple-600 border-purple-100",
    };
  if (u.role === "organization")
    return {
      label: "Organization",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    };
  if (u.role === "remote_worker")
    return {
      label: "Remote worker",
      color: "bg-teal-50 text-teal-600 border-teal-100",
    };
  if (u.isSeller)
    return {
      label: "Freelancer",
      color: "bg-orange-50 text-orange-600 border-orange-100",
    };
  return { label: "Client", color: "bg-gray-50 text-gray-500 border-gray-200" };
};

// ─── StatCard ─────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon,
  index,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.06 }}
    className="bg-white border border-[#f0f0f0] hover:border-orange-200 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-[18px] shrink-0">
        {icon}
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30 group-hover:bg-orange-500 transition-colors" />
    </div>
    <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#bbb] uppercase mb-1 truncate">
      {label}
    </p>
    <p className="text-xl sm:text-2xl font-extrabold text-[#111] tabular-nums">
      {value}
    </p>
  </motion.div>
);

// ─── SkeletonRow ──────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-4 px-5 py-4 border-b border-[#f7f7f7]">
    <div className="w-9 h-9 rounded-xl bg-[#f0f0f0] shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-[#f0f0f0] rounded-full w-1/3" />
      <div className="h-2.5 bg-[#f5f5f5] rounded-full w-1/2" />
    </div>
    <div className="h-5 w-20 bg-[#f5f5f5] rounded-lg hidden md:block" />
    <div className="h-5 w-16 bg-[#f5f5f5] rounded-lg hidden md:block" />
    <div className="h-5 w-8 bg-[#f5f5f5] rounded-lg hidden md:block" />
    <div className="h-5 w-16 bg-[#f5f5f5] rounded-lg hidden md:block" />
    <div className="h-7 w-7 bg-[#f5f5f5] rounded-lg" />
  </div>
);

// ─── UserDrawer ───────────────────────────────────────────────

const UserDrawer = ({
  user,
  onClose,
  onSuspend,
  onVerify,
}: {
  user: User;
  onClose: () => void;
  onSuspend: (id: string, reason?: string) => Promise<void>;
  onVerify: (id: string) => Promise<void>;
}) => {
  const [suspendReason, setSuspendReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [loading, setLoading] = useState<"suspend" | "verify" | null>(null);
  const type = getUserType(user);

  const handleSuspend = async () => {
    // First click when not yet suspended → show reason input
    if (!user.suspended && !showReasonInput) {
      setShowReasonInput(true);
      return;
    }
    // Second click (confirm) or unsuspend
    setLoading("suspend");
    await onSuspend(user._id, suspendReason.trim() || undefined);
    setLoading(null);
    setShowReasonInput(false);
    setSuspendReason("");
  };

  const handleVerify = async () => {
    setLoading("verify");
    await onVerify(user._id);
    setLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-px w-5 bg-orange-500" />
            <span className="text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              User detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#f0f0f0] hover:border-orange-200 flex items-center justify-center text-[#aaa] hover:text-orange-500 transition-all"
          >
            <FiX className="text-[14px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          {/* Avatar + name block */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#f0f0f0] shrink-0">
              <Image
                src={user.img || FALLBACK_AVATAR}
                alt={user.username}
                fill
                className="object-cover"
                unoptimized
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)
                }
              />
              {user.suspended && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <LuShieldAlert className="text-white text-[20px]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[17px] font-extrabold text-[#111] truncate">
                  {user.username}
                </h2>
                {user.isVerified && (
                  <MdVerified className="text-orange-500 text-[14px] shrink-0" />
                )}
              </div>
              <p className="text-[12px] text-[#aaa] truncate mt-0.5">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${type.color}`}
                >
                  {type.label}
                </span>
                {user.suspended && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-red-50 text-red-600 border-red-100">
                    Suspended
                  </span>
                )}
                {user.tier === "vip" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1">
                    <LuCrown className="text-[9px]" /> VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-0">
            {[
              { icon: <LuMail />, label: "Email", value: user.email },
              { icon: <LuPhone />, label: "Phone", value: user.phone || "—" },
              {
                icon: <LuMapPin />,
                label: "Country",
                value: user.countryOfResidence || user.country || "—",
              },
              {
                icon: <LuBriefcase />,
                label: "Experience",
                value: user.yearsOfExperience
                  ? `${user.yearsOfExperience} yr`
                  : "—",
              },
              {
                icon: <LuCalendar />,
                label: "Joined",
                value: formatDate(user.createdAt),
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 py-2.5 border-b border-[#f7f7f7] last:border-0"
              >
                <span className="text-[#ccc] text-[14px] shrink-0">{icon}</span>
                <span className="text-[11.5px] text-[#aaa] w-20 shrink-0">
                  {label}
                </span>
                <span className="text-[12.5px] font-semibold text-[#333] truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Services */}
          {user.services && user.services.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase mb-2">
                Services
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.services.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10.5px] font-semibold bg-orange-50 border border-orange-100 text-orange-600 px-2 py-0.5 rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organization info */}
          {user.role === "organization" && user.organization?.name && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.14em] text-blue-400 uppercase mb-1.5">
                Organization
              </p>
              <p className="text-[13px] font-bold text-blue-700">
                {user.organization.name}
              </p>
              {user.organization.industry && (
                <p className="text-[11px] text-blue-500 mt-0.5">
                  {user.organization.industry}
                </p>
              )}
            </div>
          )}

          {/* VIP subscription */}
          {user.vipSubscription?.active && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.14em] text-amber-500 uppercase mb-1.5 flex items-center gap-1">
                <LuCrown className="text-[10px]" /> VIP subscription
              </p>
              <p className="text-[12px] text-amber-700 font-semibold">
                Active via {user.vipSubscription.gateway}
              </p>
              {user.vipSubscription.endDate && (
                <p className="text-[11px] text-amber-500 mt-0.5">
                  Expires {formatDate(user.vipSubscription.endDate)}
                </p>
              )}
            </div>
          )}

          {/* Suspension info */}
          {user.suspended && (user.suspendReason || user.suspendedAt) && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.14em] text-red-400 uppercase mb-1">
                Suspension reason
              </p>
              {user.suspendReason && (
                <p className="text-[12.5px] text-red-600">
                  {user.suspendReason}
                </p>
              )}
              {user.suspendedAt && (
                <p className="text-[10px] text-red-300 mt-1">
                  Suspended on {formatDate(user.suspendedAt)}
                </p>
              )}
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase mb-1.5">
                Bio
              </p>
              <p className="text-[12.5px] text-[#555] leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions — hidden for admins */}
        {!user.isAdmin && (
          <div className="shrink-0 px-6 py-5 border-t border-[#f0f0f0] space-y-3">
            {/* Reason textarea — shown after first click when suspending */}
            {showReasonInput && !user.suspended && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Reason for suspension (optional)..."
                  rows={3}
                  className="w-full text-[12.5px] border border-[#ebebeb] focus:border-orange-300 rounded-xl px-3 py-2.5 outline-none resize-none placeholder-[#ccc] text-[#333] transition"
                />
                <button
                  onClick={() => {
                    setShowReasonInput(false);
                    setSuspendReason("");
                  }}
                  className="text-[11px] text-[#aaa] hover:text-orange-500 self-start transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Suspend / Unsuspend */}
            <button
              onClick={handleSuspend}
              disabled={loading === "suspend"}
              className={`w-full flex items-center justify-center gap-2 text-[12.5px] font-bold py-3 rounded-xl transition-all disabled:opacity-50 ${
                user.suspended
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100"
              }`}
            >
              {loading === "suspend" ? (
                "Processing..."
              ) : user.suspended ? (
                <>
                  <LuCircleCheck className="text-[14px]" /> Lift suspension
                </>
              ) : showReasonInput ? (
                <>
                  <LuShieldAlert className="text-[14px]" /> Confirm suspension
                </>
              ) : (
                <>
                  <LuShieldAlert className="text-[14px]" /> Suspend user
                </>
              )}
            </button>

            {/* Manually verify */}
            {!user.isVerified && (
              <button
                onClick={handleVerify}
                disabled={loading === "verify"}
                className="w-full flex items-center justify-center gap-2 text-[12.5px] font-bold py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50"
              >
                {loading === "verify" ? (
                  "Verifying..."
                ) : (
                  <>
                    <MdVerified className="text-[14px]" /> Manually verify
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // ── Debounce search input ──
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Reset page when filters change ──
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, sort]);

  // ── Fetch stats ──
  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    newRequest
      .get("/users/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Failed to load stats."))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
        sort,
      });
      const res = await newRequest.get<PaginatedResponse>(
        `/users/admin/all?${params}`,
      );
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, statusFilter, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Suspend / unsuspend ──
  const handleSuspend = async (id: string, reason?: string) => {
    try {
      const res = await newRequest.patch(`/users/admin/${id}/suspend`, {
        reason,
      });
      const { suspended } = res.data;
      toast.success(suspended ? "User suspended." : "Suspension lifted.");

      const patch = (u: User): User =>
        u._id === id
          ? {
              ...u,
              suspended,
              suspendReason: reason ?? null,
              suspendedAt: suspended ? new Date().toISOString() : null,
            }
          : u;

      setUsers((prev) => prev.map(patch));
      setSelectedUser((prev) => (prev?._id === id ? patch(prev) : prev));
      fetchStats();
    } catch {
      toast.error("Failed to update suspension.");
    }
  };

  // ── Verify ──
  const handleVerify = async (id: string) => {
    try {
      await newRequest.patch(`/users/admin/${id}/verify`);
      toast.success("User verified.");

      const patch = (u: User): User =>
        u._id === id ? { ...u, isVerified: true } : u;

      setUsers((prev) => prev.map(patch));
      setSelectedUser((prev) => (prev?._id === id ? patch(prev) : prev));
      fetchStats();
    } catch {
      toast.error("Failed to verify user.");
    }
  };

  // ── Stat card data (depends on corrected stats shape) ──
  const statCards = [
    {
      label: "Total users",
      value: stats?.total ?? 0,
      icon: <HiOutlineUsers />,
    },
    { label: "Clients", value: stats?.buyers ?? 0, icon: <LuUser /> },
    {
      label: "Freelancers",
      value: stats?.sellers ?? 0,
      icon: <MdOutlineStorefront />,
    },
    {
      label: "Remote workers",
      value: stats?.remoteWorkers ?? 0,
      icon: <LuUsers />,
    },
    {
      label: "Organizations",
      value: stats?.organizations ?? 0,
      icon: <LuBuilding2 />,
    },
    {
      label: "Admins",
      value: stats?.admins ?? 0,
      icon: <MdOutlineAdminPanelSettings />,
    },
    {
      label: "Verified",
      value: stats?.verified ?? 0,
      icon: <HiOutlineCheckCircle />,
    },
    {
      label: "Suspended",
      value: stats?.suspended ?? 0,
      icon: <HiOutlineBan />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="px-5 md:px-8 py-7 max-w-[1400px]">
        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-orange-500" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-orange-500 uppercase">
              Admin
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#111] leading-tight">
            User Management
          </h1>
          <p className="text-[13px] text-[#aaa] mt-1.5">
            View, filter, suspend, and verify every account on the platform.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {statsLoading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-white border border-[#f0f0f0] rounded-2xl animate-pulse"
                  />
                ))
            : statCards.map((s, i) => (
                <StatCard key={s.label} {...s} index={i} />
              ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-[#f0f0f0] rounded-2xl px-5 py-4 mb-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-0 border border-[#ebebeb] focus-within:border-orange-300 rounded-xl px-3.5 py-2.5 transition-colors">
              <HiOutlineSearch className="text-[#ccc] text-[15px] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 bg-transparent outline-none text-[13px] text-[#333] placeholder-[#ccc]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[#ccc] hover:text-orange-500 transition-colors shrink-0"
                >
                  <FiX className="text-[13px]" />
                </button>
              )}
            </div>

            {/* Status + sort selects */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[12px] font-semibold text-[#555] border border-[#ebebeb] rounded-xl px-3 py-2 outline-none focus:border-orange-300 transition bg-white"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-[12px] font-semibold text-[#555] border border-[#ebebeb] rounded-xl px-3 py-2 outline-none focus:border-orange-300 transition bg-white"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  roleFilter === f.value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-[#888] border-[#ebebeb] hover:border-orange-200 hover:text-orange-500"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden mb-5">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_130px_110px_70px_80px_44px] gap-4 px-5 py-3 border-b border-[#f5f5f5] bg-[#fafafa]">
            {["User", "Email", "Type", "Status", "Verified", "Joined", ""].map(
              (h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold tracking-[0.14em] text-[#bbb] uppercase"
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <SkeletonRow key={i} />)
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <HiOutlineUsers className="text-[32px] text-[#e5e5e5] mb-3" />
              <p className="text-[13px] text-[#ccc]">No users found.</p>
            </div>
          ) : (
            <AnimatePresence>
              {users.map((user, i) => {
                const type = getUserType(user);
                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.02 }}
                    onClick={() => setSelectedUser(user)}
                    className={`grid grid-cols-1 md:grid-cols-[2fr_1.5fr_130px_110px_70px_80px_44px] gap-4 items-center px-5 py-3.5 border-b border-[#f7f7f7] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer ${
                      user.suspended ? "opacity-60" : ""
                    }`}
                  >
                    {/* User */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#f0f0f0] shrink-0">
                        <Image
                          src={user.img || FALLBACK_AVATAR}
                          alt={user.username}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                              FALLBACK_AVATAR)
                          }
                        />
                        {user.suspended && (
                          <div className="absolute inset-0 bg-red-400/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[13px] font-bold text-[#111] truncate">
                            {user.username}
                          </p>
                          {user.isVerified && (
                            <MdVerified className="text-orange-500 text-[11px] shrink-0" />
                          )}
                        </div>
                        {user.tier === "vip" && (
                          <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                            <LuCrown className="text-[8px]" /> VIP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <p className="text-[12px] text-[#777] truncate hidden md:block">
                      {user.email}
                    </p>

                    {/* Type */}
                    <span
                      className={`hidden md:inline-flex text-[10px] font-bold px-2 py-1 rounded-lg border w-fit ${type.color}`}
                    >
                      {type.label}
                    </span>

                    {/* Status */}
                    <span
                      className={`hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border w-fit ${
                        user.suspended
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.suspended ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      {user.suspended ? "Suspended" : "Active"}
                    </span>

                    {/* Verified */}
                    <div className="hidden md:flex justify-center">
                      {user.isVerified ? (
                        <LuCircleCheck className="text-green-500 text-[15px]" />
                      ) : (
                        <LuCircleX className="text-[#ddd] text-[15px]" />
                      )}
                    </div>

                    {/* Joined */}
                    <p className="hidden md:block text-[11px] text-[#aaa]">
                      {formatDate(user.createdAt)}
                    </p>

                    {/* Kebab menu */}
                    <div
                      className="relative hidden md:flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setMenuOpenId(
                            menuOpenId === user._id ? null : user._id,
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-[#f0f0f0] hover:border-orange-200 flex items-center justify-center text-[#ccc] hover:text-orange-500 transition-all"
                      >
                        <FiMoreVertical className="text-[13px]" />
                      </button>

                      <AnimatePresence>
                        {menuOpenId === user._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-9 z-20 bg-white border border-[#f0f0f0] rounded-xl shadow-lg py-1 min-w-[160px]"
                          >
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setSelectedUser(user);
                              }}
                              className="w-full text-left text-[12px] font-semibold text-[#555] hover:bg-[#fafafa] px-4 py-2.5 transition-colors"
                            >
                              View details
                            </button>

                            {!user.isAdmin && (
                              <>
                                <button
                                  onClick={async () => {
                                    setMenuOpenId(null);
                                    if (user.suspended) {
                                      await handleSuspend(user._id);
                                    } else {
                                      // Open drawer so admin can enter reason
                                      setSelectedUser(user);
                                    }
                                  }}
                                  className={`w-full text-left text-[12px] font-semibold px-4 py-2.5 transition-colors ${
                                    user.suspended
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-red-500 hover:bg-red-50"
                                  }`}
                                >
                                  {user.suspended
                                    ? "Lift suspension"
                                    : "Suspend user"}
                                </button>

                                {!user.isVerified && (
                                  <button
                                    onClick={async () => {
                                      setMenuOpenId(null);
                                      await handleVerify(user._id);
                                    }}
                                    className="w-full text-left text-[12px] font-semibold text-orange-500 hover:bg-orange-50 px-4 py-2.5 transition-colors"
                                  >
                                    Verify user
                                  </button>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[12px] text-[#aaa]">
              Showing{" "}
              <span className="font-semibold text-[#555]">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
              </span>{" "}
              of <span className="font-semibold text-[#555]">{total}</span>{" "}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#888] hover:text-orange-500 border border-[#ebebeb] hover:border-orange-200 px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft /> Prev
              </button>
              <span className="text-[12px] font-semibold text-[#555] px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#888] hover:text-orange-500 border border-[#ebebeb] hover:border-orange-200 px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <AnimatePresence>
        {selectedUser && (
          <UserDrawer
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSuspend={handleSuspend}
            onVerify={handleVerify}
          />
        )}
      </AnimatePresence>

      {/* Dismiss kebab menu on outside click */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
}

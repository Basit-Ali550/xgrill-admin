"use client";
import { useState, useEffect, useCallback } from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DatePicker, ConfigProvider, theme, Select } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdTune,
  MdShoppingCart,
  MdSwapVert,
  MdCancel,
  MdFilterList,
  MdRefresh,
  MdExpandMore,
  MdExpandLess,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import {
  GiGrainBundle,
} from "react-icons/gi";
import {
  Package,
  ClipboardList,
  Shield,
  Activity,
  User,
} from "lucide-react";

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;

// --- Config Maps ---
const ACTION_CONFIG = {
  CREATE: { label: "Created", icon: MdAdd, color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  UPDATE: { label: "Updated", icon: MdEdit, color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  DELETE: { label: "Deleted", icon: MdDelete, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  ADJUST: { label: "Adjusted", icon: MdTune, color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  PLACE_ORDER: { label: "Placed Order", icon: MdShoppingCart, color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  UPDATE_STATUS: { label: "Status Changed", icon: MdSwapVert, color: "#06b6d4", bg: "rgba(6,182,212,0.15)" },
  CANCEL: { label: "Cancelled", icon: MdCancel, color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const ENTITY_CONFIG = {
  INGREDIENT: { label: "Ingredient", icon: GiGrainBundle, color: "#f59e0b" },
  INVENTORY: { label: "Inventory", icon: Package, color: "#3b82f6" },
  ORDER: { label: "Order", icon: ClipboardList, color: "#8b5cf6" },
  PRODUCT: { label: "Product", icon: Package, color: "#10b981" },
  DEAL: { label: "Deal", icon: ClipboardList, color: "#ec4899" },
};

// --- Components ---

function ActivityIcon({ action }) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.UPDATE;
  const Icon = config.icon;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg"
      style={{ background: config.bg, boxShadow: `0 0 12px ${config.bg}` }}
    >
      <Icon size={18} style={{ color: config.color }} />
    </div>
  );
}

function DetailRow({ label, value, color }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 min-w-[80px]">{label}:</span>
      <span className={`font-medium ${color || "text-gray-300"}`}>
        {typeof value === "number" ? value.toLocaleString() : String(value)}
      </span>
    </div>
  );
}

function DetailsPanel({ details, action }) {
  if (!details || Object.keys(details).length === 0) return null;

  // Adjust action: show old/new stock
  if (action === "ADJUST") {
    return (
      <div className="mt-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700/40 flex flex-wrap items-center gap-x-6 gap-y-2">
        <DetailRow label="Old Stock" value={details.oldStock} />
        <DetailRow label="New Stock" value={details.newStock} />
        <DetailRow label="Change" value={details.adjustment > 0 ? `+${details.adjustment}` : details.adjustment} color={details.adjustment > 0 ? "text-green-400" : "text-red-400"} />
        {details.reason && <DetailRow label="Reason" value={details.reason} />}
      </div>
    );
  }

  // Update action: show before/after
  if (action === "UPDATE" && details.before && details.after) {
    const keys = [...new Set([...Object.keys(details.before), ...Object.keys(details.after)])];
    const changes = keys.filter(k => JSON.stringify(details.before[k]) !== JSON.stringify(details.after[k]));

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700/40">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Changes</p>
        <div className="space-y-1">
          {changes.map((key) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 min-w-[80px] capitalize">{key}:</span>
              <span className="text-red-400/70 line-through">{String(details.before[key] ?? "—")}</span>
              <span className="text-gray-600">→</span>
              <span className="text-green-400 font-medium">{String(details.after[key] ?? "—")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Delete action: show deleted item
  if (action === "DELETE" && details.deleted) {
    return (
      <div className="mt-2 p-3 bg-red-500/5 rounded-lg border border-red-500/20 space-y-1">
        {Object.entries(details.deleted).map(([key, value]) => (
          <DetailRow key={key} label={key} value={value} color="text-red-400" />
        ))}
      </div>
    );
  }

  // Order actions: show order details
  if (action === "PLACE_ORDER") {
    return (
      <div className="mt-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700/40 space-y-1">
        <DetailRow label="Total" value={`Rs. ${details.totalAmount?.toLocaleString()}`} color="text-green-400" />
        <DetailRow label="Items" value={details.itemCount} />
        {details.customerName && <DetailRow label="Customer" value={details.customerName} />}
      </div>
    );
  }

  if (action === "UPDATE_STATUS" || action === "CANCEL") {
    return (
      <div className="mt-2 p-3 bg-gray-900/60 rounded-lg border border-gray-700/40 space-y-1">
        {details.oldStatus && details.newStatus && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 min-w-[80px]">Status:</span>
            <span className="text-orange-400">{details.oldStatus}</span>
            <span className="text-gray-600">→</span>
            <span className="text-green-400 font-medium">{details.newStatus}</span>
          </div>
        )}
        {details.previousStatus && <DetailRow label="Was" value={details.previousStatus} color="text-orange-400" />}
        {details.totalAmount && <DetailRow label="Amount" value={`Rs. ${details.totalAmount?.toLocaleString()}`} />}
      </div>
    );
  }

  // CREATE action: show created item
  if (action === "CREATE") {
    return (
      <div className="mt-2 p-3 bg-green-500/5 rounded-lg border border-green-500/20 space-y-1">
        {Object.entries(details).map(([key, value]) => (
          <DetailRow key={key} label={key} value={value} color="text-green-400" />
        ))}
      </div>
    );
  }

  return null;
}

function LogEntry({ log }) {
  const [expanded, setExpanded] = useState(false);
  const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
  const entityConfig = ENTITY_CONFIG[log.entity] || ENTITY_CONFIG.INVENTORY;
  const EntityIcon = entityConfig.icon;
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  return (
    <div className="group relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline Line */}
      <div className="absolute left-[18px] top-[36px] bottom-0 w-px bg-gray-700/50 group-last:hidden" />

      {/* Icon */}
      <ActivityIcon action={log.action} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* User + Action */}
            <p className="text-sm text-gray-200">
              <span className="font-semibold text-white">{log.user?.name || "System"}</span>
              {" "}
              <span style={{ color: actionConfig.color }}>{actionConfig.label.toLowerCase()}</span>
              {" "}
              <span className="inline-flex items-center gap-1 text-gray-400">
                <EntityIcon size={14} style={{ color: entityConfig.color }} />
                {entityConfig.label.toLowerCase()}
              </span>
              {" "}
              <span className="font-medium text-white">{log.entityName}</span>
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500" title={dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}>
                {dayjs(log.createdAt).fromNow()}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: actionConfig.bg, color: actionConfig.color }}>
                {log.action}
              </span>
              <span className="text-xs text-gray-600">
                {dayjs(log.createdAt).format("DD MMM YYYY, h:mm A")}
              </span>
            </div>
          </div>

          {/* Expand Button */}
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors cursor-pointer shrink-0"
              title={expanded ? "Collapse details" : "View details"}
            >
              {expanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
            </button>
          )}
        </div>

        {/* Details */}
        {expanded && hasDetails && <DetailsPanel details={log.details} action={log.action} />}
      </div>
    </div>
  );
}

// --- Helper to group logs by date ---
function groupByDate(logs) {
  const groups = {};
  for (const log of logs) {
    const key = dayjs(log.createdAt).format("YYYY-MM-DD");
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  }
  return groups;
}

function DateLabel({ dateStr }) {
  const d = dayjs(dateStr);
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  let label = d.format("dddd, D MMMM YYYY");
  if (dateStr === today) label = "Today";
  else if (dateStr === yesterday) label = "Yesterday";

  return (
    <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
      <div className="h-px flex-1 bg-gray-700/50" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-gray-700/50" />
    </div>
  );
}

// --- Main Page ---
export default function ActivityLogPage() {
  const { logs, pagination, loading, error, fetchLogs } = useActivityLog();
  const { user } = useAuth();

  // Filters
  const [filters, setFilters] = useState({
    userId: "",
    entity: "",
    action: "",
    startDate: "",
    endDate: "",
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Fetch staff list for user filter
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const result = await api.get("/api/v1/users");
        if (result.success) {
          setStaffList(result.data.filter((u) => u.role === "ADMIN" || u.role === "RECEPTIONIST"));
        }
      } catch {
        // silently fail
      }
    };
    fetchStaff();
  }, []);

  // Fetch logs on filter change
  useEffect(() => {
    fetchLogs(filters);
  }, [filters, fetchLogs]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ userId: "", entity: "", action: "", startDate: "", endDate: "", page: 1 });
  };

  const hasActiveFilters = filters.userId || filters.entity || filters.action || filters.startDate || filters.endDate;
  const grouped = groupByDate(logs);

  // Count stats
  const todayCount = logs.filter((l) => dayjs(l.createdAt).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")).length;

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white m-0">Activity Log</h2>
            <p className="text-sm text-gray-400 m-0">Track every action on your business</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <Activity size={14} className="text-purple-400" />
            <span className="text-sm text-gray-300">
              <strong className="text-white">{pagination.total}</strong> total
            </span>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer
              ${showFilters || hasActiveFilters
                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
          >
            <MdFilterList size={18} />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchLogs(filters)}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-lg border border-gray-700/50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <MdRefresh size={18} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Filter */}
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: "#8b5cf6", colorBgContainer: "#1f2937", colorBorder: "#374151" } }}>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">User</label>
                <Select
                  allowClear
                  placeholder="All Users"
                  value={filters.userId || undefined}
                  onChange={(v) => updateFilter("userId", v || "")}
                  className="w-full"
                  options={staffList.map((s) => ({
                    value: s.id,
                    label: (
                      <span className="flex items-center gap-2">
                        <User size={14} />
                        {s.name}
                        <span className="text-xs text-gray-500">({s.role})</span>
                      </span>
                    ),
                  }))}
                />
              </div>

              {/* Entity Filter */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                <Select
                  allowClear
                  placeholder="All Types"
                  value={filters.entity || undefined}
                  onChange={(v) => updateFilter("entity", v || "")}
                  className="w-full"
                  options={Object.entries(ENTITY_CONFIG).map(([key, cfg]) => ({
                    value: key,
                    label: (
                      <span className="flex items-center gap-2">
                        <cfg.icon size={14} style={{ color: cfg.color }} />
                        {cfg.label}
                      </span>
                    ),
                  }))}
                />
              </div>

              {/* Action Filter */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Action</label>
                <Select
                  allowClear
                  placeholder="All Actions"
                  value={filters.action || undefined}
                  onChange={(v) => updateFilter("action", v || "")}
                  className="w-full"
                  options={Object.entries(ACTION_CONFIG).map(([key, cfg]) => ({
                    value: key,
                    label: (
                      <span className="flex items-center gap-2" style={{ color: cfg.color }}>
                        <cfg.icon size={14} />
                        {cfg.label}
                      </span>
                    ),
                  }))}
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Date Range</label>
                <RangePicker
                  value={[
                    filters.startDate ? dayjs(filters.startDate) : null,
                    filters.endDate ? dayjs(filters.endDate) : null,
                  ]}
                  onChange={(dates) => {
                    if (dates) {
                      setFilters((prev) => ({
                        ...prev,
                        startDate: dates[0]?.format("YYYY-MM-DD") || "",
                        endDate: dates[1]?.format("YYYY-MM-DD") || "",
                        page: 1,
                      }));
                    } else {
                      setFilters((prev) => ({ ...prev, startDate: "", endDate: "", page: 1 }));
                    }
                  }}
                  allowClear
                  format="YYYY-MM-DD"
                  placeholder={["Start", "End"]}
                  className="w-full"
                />
              </div>
            </ConfigProvider>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <MdCancel size={16} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timeline Content */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/40 p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading activity...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Failed to load activity logs</p>
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => fetchLogs(filters)}
              className="mt-3 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/30 rounded-full flex items-center justify-center">
              <Activity size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400 mb-1">No Activity Found</h3>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? "No logs match your current filters. Try adjusting them."
                : "Activity will appear here as actions are performed."}
            </p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([dateStr, dateLogs]) => (
              <div key={dateStr}>
                <DateLabel dateStr={dateStr} />
                <div className="space-y-0">
                  {dateLogs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-700/40 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronLeft size={20} />
              </button>
              <button
                onClick={() => setFilters((p) => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

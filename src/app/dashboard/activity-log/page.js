"use client";
import React, { useState, useEffect } from "react";
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
  Wallet,
  ShoppingBag,
  UserCircle2,
  TrendingUp,
  TrendingDown,
  Hash,
  FileText,
  ArrowRight,
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

// Inline stat — icon + label + value, designed to live in a horizontal strip.
function InlineStat({ icon: Icon, label, value, accent = "text-white", iconColor }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-2 min-w-0">
      {Icon && (
        <div
          className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center bg-gray-800/80 ring-1 ring-gray-700/50"
          style={iconColor ? { color: iconColor } : undefined}
        >
          <Icon size={13} />
        </div>
      )}
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
          {label}
        </span>
        <span className={`text-sm font-semibold tabular-nums truncate ${accent}`}>
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </span>
      </div>
    </div>
  );
}

// Inline before → after change
function InlineChange({ icon: Icon, label, before, after, iconColor }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {Icon && (
        <div
          className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center bg-gray-800/80 ring-1 ring-gray-700/50"
          style={iconColor ? { color: iconColor } : undefined}
        >
          <Icon size={13} />
        </div>
      )}
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 truncate">
          {label}
        </span>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-red-400/80 line-through truncate">
            {String(before ?? "—")}
          </span>
          <ArrowRight size={11} className="text-gray-600 shrink-0" />
          <span className="text-emerald-400 font-semibold truncate">
            {String(after ?? "—")}
          </span>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-8 w-px bg-gray-700/50 shrink-0" aria-hidden="true" />
  );
}

// Wraps stats with vertical dividers between them.
function Strip({ children }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map((child, idx) => (
        <React.Fragment key={idx}>
          {child}
          {idx < items.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  );
}

function DetailsPanel({ details, action }) {
  if (!details || Object.keys(details).length === 0) return null;

  // Adjust action
  if (action === "ADJUST") {
    const change = details.adjustment;
    return (
      <Strip>
        <InlineStat
          icon={TrendingDown}
          iconColor="#9ca3af"
          label="Old Stock"
          value={details.oldStock}
          accent="text-gray-300"
        />
        <InlineStat
          icon={TrendingUp}
          iconColor="#fff"
          label="New Stock"
          value={details.newStock}
          accent="text-white"
        />
        <InlineStat
          icon={change > 0 ? TrendingUp : TrendingDown}
          iconColor={change > 0 ? "#34d399" : "#f87171"}
          label="Change"
          value={change > 0 ? `+${change}` : change}
          accent={change > 0 ? "text-emerald-400" : "text-red-400"}
        />
        {details.reason && (
          <InlineStat
            icon={FileText}
            iconColor="#fbbf24"
            label="Reason"
            value={details.reason}
            accent="text-amber-300"
          />
        )}
      </Strip>
    );
  }

  // Update action
  if (action === "UPDATE" && details.before && details.after) {
    const keys = [...new Set([...Object.keys(details.before), ...Object.keys(details.after)])];
    const changes = keys.filter(
      (k) => JSON.stringify(details.before[k]) !== JSON.stringify(details.after[k]),
    );
    if (changes.length === 0) return null;

    return (
      <Strip>
        {changes.map((key) => (
          <InlineChange
            key={key}
            icon={ArrowRight}
            iconColor="#a78bfa"
            label={key}
            before={details.before[key]}
            after={details.after[key]}
          />
        ))}
      </Strip>
    );
  }

  // Delete
  if (action === "DELETE" && details.deleted) {
    return (
      <Strip>
        {Object.entries(details.deleted).map(([k, v]) => (
          <InlineStat
            key={k}
            icon={Hash}
            iconColor="#f87171"
            label={k}
            value={v}
            accent="text-red-300"
          />
        ))}
      </Strip>
    );
  }

  // Order placed
  if (action === "PLACE_ORDER") {
    return (
      <Strip>
        <InlineStat
          icon={Wallet}
          iconColor="#34d399"
          label="Total"
          value={`Rs. ${details.totalAmount?.toLocaleString()}`}
          accent="text-emerald-400"
        />
        <InlineStat
          icon={ShoppingBag}
          iconColor="#60a5fa"
          label="Items"
          value={details.itemCount}
          accent="text-blue-300"
        />
        {details.customerName && (
          <InlineStat
            icon={UserCircle2}
            iconColor="#c084fc"
            label="Customer"
            value={details.customerName}
            accent="text-purple-300"
          />
        )}
      </Strip>
    );
  }

  // Status change / cancel
  if (action === "UPDATE_STATUS" || action === "CANCEL") {
    return (
      <Strip>
        {details.oldStatus && details.newStatus && (
          <InlineChange
            icon={ArrowRight}
            iconColor="#22d3ee"
            label="Status"
            before={details.oldStatus}
            after={details.newStatus}
          />
        )}
        {details.previousStatus && !details.oldStatus && (
          <InlineStat
            icon={Hash}
            iconColor="#fbbf24"
            label="Was"
            value={details.previousStatus}
            accent="text-amber-400"
          />
        )}
        {details.totalAmount && (
          <InlineStat
            icon={Wallet}
            iconColor="#34d399"
            label="Amount"
            value={`Rs. ${details.totalAmount?.toLocaleString()}`}
            accent="text-emerald-400"
          />
        )}
      </Strip>
    );
  }

  // Create
  if (action === "CREATE") {
    return (
      <Strip>
        {Object.entries(details).map(([k, v]) => (
          <InlineStat
            key={k}
            icon={Hash}
            iconColor="#34d399"
            label={k}
            value={v}
            accent="text-emerald-300"
          />
        ))}
      </Strip>
    );
  }

  return null;
}

function LogRow({ log, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
  const entityConfig = ENTITY_CONFIG[log.entity] || ENTITY_CONFIG.INVENTORY;
  const ActionIcon = actionConfig.icon;
  const EntityIcon = entityConfig.icon;
  const hasDetails = log.details && Object.keys(log.details).length > 0;
  const userName = log.user?.name || "System";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <tr
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={`group transition-colors ${
          hasDetails ? "cursor-pointer" : ""
        } ${expanded ? "bg-gray-800/40" : "hover:bg-gray-800/30"} ${
          isLast || expanded ? "" : "border-b border-gray-700/30"
        }`}
      >
        {/* TIME */}
        <td className="px-4 py-3 align-top whitespace-nowrap">
          <div className="flex flex-col">
            <span
              className="text-sm font-medium text-gray-200"
              title={dayjs(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
            >
              {dayjs(log.createdAt).fromNow()}
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              {dayjs(log.createdAt).format("h:mm A")}
            </span>
          </div>
        </td>

        {/* USER */}
        <td className="px-4 py-3 align-top whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500/30 to-indigo-500/30 ring-1 ring-purple-400/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
              {initials || <User size={14} />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">
                {userName}
              </span>
              {log.user?.role && (
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {log.user.role}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* ACTION */}
        <td className="px-4 py-3 align-top">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1"
            style={{
              background: actionConfig.bg,
              color: actionConfig.color,
              borderColor: actionConfig.color + "40",
            }}
          >
            <ActionIcon size={12} />
            {actionConfig.label}
          </span>
        </td>

        {/* ENTITY */}
        <td className="px-4 py-3 align-top">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-7 w-7 rounded-lg border-none flex items-center justify-center shrink-0 "
              style={{
                background: entityConfig.color + "15",
                borderColor: entityConfig.color + "30",
              }}
            >
              <EntityIcon size={14} style={{ color: entityConfig.color }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {log.entityName}
              </span>
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: entityConfig.color }}
              >
                {entityConfig.label}
              </span>
            </div>
          </div>
        </td>

        {/* TIMESTAMP */}
        <td className="px-4 py-3 align-top whitespace-nowrap text-right hidden md:table-cell">
          <span className="text-xs text-gray-500 font-mono">
            {dayjs(log.createdAt).format("DD MMM, h:mm A")}
          </span>
        </td>

        {/* EXPAND */}
        <td className="px-4 py-3 align-top text-right w-12">
          {hasDetails ? (
            <div
              className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-all ${
                expanded
                  ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30"
                  : "text-gray-500 group-hover:bg-gray-700/50 group-hover:text-white"
              }`}
            >
              {expanded ? (
                <MdExpandLess size={18} />
              ) : (
                <MdExpandMore size={18} />
              )}
            </div>
          ) : (
            <span className="text-gray-700">—</span>
          )}
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && hasDetails && (
        <tr className={isLast ? "" : "border-b border-gray-700/30"}>
          <td colSpan={6} className="px-4 pb-4 bg-gray-800/40">
            <div
              className="rounded-xl bg-gray-900/50 ring-1 ring-gray-700/40 px-4 py-3 border-l-2"
              style={{ borderLeftColor: actionConfig.color }}
            >
              <DetailsPanel details={log.details} action={log.action} />
            </div>
          </td>
        </tr>
      )}
    </>
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

function getDateLabel(dateStr) {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return dayjs(dateStr).format("dddd, D MMMM YYYY");
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

      {/* Table Content */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/40 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading activity...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
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
          <div className="text-center py-20">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/60 border-b border-gray-700/50 sticky top-0 z-10 backdrop-blur">
                <tr className="text-left">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    When
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold  uppercase tracking-widest text-gray-500">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right hidden md:table-cell">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([dateStr, dateLogs], groupIdx, arr) => (
                  <React.Fragment key={dateStr}>
                    <tr className="bg-gray-900/40">
                      <td
                        colSpan={6}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-purple-300/80 border-y border-gray-700/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-purple-400" />
                          {getDateLabel(dateStr)}
                          <span className="text-gray-600 font-normal">·</span>
                          <span className="text-gray-500 font-medium normal-case tracking-normal">
                            {dateLogs.length} {dateLogs.length === 1 ? "entry" : "entries"}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {dateLogs.map((log, idx) => (
                      <LogRow
                        key={log.id}
                        log={log}
                        isLast={
                          idx === dateLogs.length - 1 &&
                          groupIdx === arr.length - 1
                        }
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700/40 flex items-center justify-between bg-gray-900/30">
            <p className="text-sm text-gray-500">
              Page <span className="text-white font-semibold">{pagination.page}</span> of {pagination.totalPages}
              <span className="text-gray-700 mx-2">·</span>
              <span className="text-white font-semibold">{pagination.total}</span> total entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                onClick={() => setFilters((p) => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

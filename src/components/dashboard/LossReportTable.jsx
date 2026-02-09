"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, AlertTriangle, ArrowDown } from "lucide-react";
import dayjs from "dayjs";

export default function LossReportTable({ startDate, endDate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const start = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "";
        const end = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

        const res = await api.get(
          `/api/v1/inventory/logs?isLoss=true&startDate=${start}&endDate=${end}`,
        );
        if (res.success) {
          setLogs(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch loss logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
        <Loader2 className="animate-spin text-orange-500 w-6 h-6" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 text-gray-400">
        <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
        <p>No loss records found for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <ArrowDown className="text-red-500" size={20} />
          Loss & Wastage Report
        </h3>
        <span className="text-xs text-gray-500">
          Showing recent {logs.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Reason</th>
              <th className="p-4 font-medium text-right">Qty</th>
              <th className="p-4 font-medium text-right">Value (Loss)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-700/30 transition-colors"
              >
                <td className="p-4 text-gray-300 text-sm whitespace-nowrap">
                  {dayjs(log.createdAt).format("DD MMM, YY - hh:mm A")}
                </td>
                <td className="p-4 text-white font-medium">
                  {log.itemName || "Unknown Item"}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      log.type === "PRODUCT"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {log.type}
                  </span>
                </td>
                <td className="p-4 text-gray-300 text-sm">{log.reason}</td>
                <td className="p-4 text-gray-300 text-sm text-right">
                  {Math.abs(log.change)}
                </td>
                <td className="p-4 text-red-400 font-bold text-sm text-right">
                  Rs. {Math.abs(Math.round(log.totalValue)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

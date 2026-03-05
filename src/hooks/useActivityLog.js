"use client";
import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export function useActivityLog() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.userId) params.set("userId", filters.userId);
      if (filters.entity) params.set("entity", filters.entity);
      if (filters.action) params.set("action", filters.action);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.page) params.set("page", filters.page);
      if (filters.limit) params.set("limit", filters.limit);

      const query = params.toString();
      const result = await api.get(`/api/v1/activity-logs${query ? `?${query}` : ""}`);

      if (result.success) {
        setLogs(result.data.logs);
        setPagination(result.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, pagination, loading, error, fetchLogs };
}

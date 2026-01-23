"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useApi(endpoint, options = {}) {
  const { immediate = true, requireAuth = false } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.get(endpoint);
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "Request failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}

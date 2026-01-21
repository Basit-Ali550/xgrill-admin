"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getDealsAction,
  createDealAction,
  deleteDealAction,
} from "@/app/actions/deals";

export function useDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDealsAction();
      if (result.success) {
        setDeals(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const createDeal = async (dealData) => {
    const result = await createDealAction(dealData);
    if (result.success) {
      setDeals((prev) => [result.data, ...prev]);
    }
    return result;
  };

  const deleteDeal = async (id) => {
    const result = await deleteDealAction(id);
    if (result.success) {
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
    }
    return result;
  };

  return {
    deals,
    loading,
    error,
    createDeal,
    deleteDeal,
    refetch: fetchDeals,
  };
}

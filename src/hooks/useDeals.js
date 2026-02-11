import {
  getDealsAction,
  createDealAction,
  deleteDealAction,
  updateDealAction,
} from "@/app/actions/deals";
import { useState, useCallback, useEffect } from "react";

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

  const updateDeal = async (id, dealData) => {
    const result = await updateDealAction(id, dealData);
    if (result.success) {
      setDeals((prev) => prev.map((deal) => (deal.id === id ? result.data : deal)));
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
    updateDeal,
    deleteDeal,
    refetch: fetchDeals,
  };
}

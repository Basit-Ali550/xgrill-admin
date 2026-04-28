"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, SlidersHorizontal, RefreshCw, Search } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { getIngredientsAction, deleteIngredientAction } from "@/app/actions/ingredients";
import AddIngredientModal from "@/components/ingredients/AddIngredientModal";
import AdjustStockModal from "@/components/ingredients/AdjustStockModal";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/select";
import { RECIPE_UNITS, SORT_OPTIONS, DATE_FILTER_OPTIONS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function IngredientsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters & Sorting
  const [filterUnit, setFilterUnit] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, yesterday, week, month, year
  const [sortConfig, setSortConfig] = useState("createdAt:desc");

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchIngredients = useCallback(async () => {
    const [sortField, sortOrder] = sortConfig.split(":");
    
    // Calculate Date Range based on filter
    let startDate, endDate;
    const now = new Date();
    
    if (dateFilter === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = startDate;
    } else if (dateFilter === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      startDate = yest.toISOString().split('T')[0];
      endDate = startDate;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }

    const params = {
      unit: filterUnit === "all" ? undefined : filterUnit,
      startDate,
      endDate,
      sort: sortField,
      order: sortOrder,
    };

    const res = await getIngredientsAction(params);
    if (res?.success) {
      setIngredients(res.data);
    }
  }, [filterUnit, dateFilter, sortConfig]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIngredients();
      setLoading(false);
    };
    loadData();
  }, [fetchIngredients]);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteIngredientAction(deleteId);
      toast.success("Ingredient deleted successfully");
      fetchIngredients();
      setDeleteId(null);
    } catch (error) {
       toast.error("Failed to delete ingredient");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (ingredient) => {
      setEditingIngredient(ingredient);
      setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsAddModalOpen(false);
      setEditingIngredient(null);
      fetchIngredients();
  };

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return ingredients;
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ingredients, searchQuery]);

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-white">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
          <div className="text-center">Unit</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-gray-400">{row.getValue("unit")}</div>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
          <div className="text-center">Available Stock</div>
      ),
      cell: ({ row }) => {
        const stock = parseFloat(row.getValue("stock"));
        const threshold = row.original.lowStockThreshold;
        const isLowStock = stock <= threshold;
        return (
          <div className="text-center">
            <span
              className={`text-lg font-bold ${
                isLowStock ? "text-red-400" : "text-green-400"
              }`}
            >
              {stock.toFixed(3)}
            </span>
          </div>
        );
      },
    },
    ...(isAdmin ? [{
      accessorKey: "costPerUnit",
      header: ({ column }) => (
          <div className="text-center">Purchase Price (per unit)</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-gray-400">Rs. {parseFloat(row.getValue("costPerUnit") || 0).toFixed(3)}</div>
      ),
    }] : []),
    {
      accessorKey: "lowStockThreshold",
      header: ({ column }) => (
          <div className="text-center">Low Stock Alert</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-gray-500">{parseFloat(row.getValue("lowStockThreshold") || 0).toFixed(3)}</div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => (
          <div className="text-center">Stock Status</div>
      ),
      cell: ({ row }) => {
        const stock = row.original.stock;
        const threshold = row.original.lowStockThreshold;
        const isLowStock = stock <= threshold;
        return (
          <div className="text-center">
            <Badge variant={isLowStock ? "destructive" : "success"}>
              {isLowStock ? "Low Stock" : "In Stock"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-xs text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <div className="text-xs text-gray-400">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "lastAdjustmentReason",
      header: "Last Adjustment",
      cell: ({ row }) => {
        const reason = row.original.lastAdjustmentReason;
        const date = row.original.lastAdjustmentDate;
        if (!reason && !date) return <div className="text-xs text-gray-600">-</div>;
        
        return (
          <div className="flex flex-col">
            <span className="text-xs text-orange-300 font-medium truncate max-w-[150px]" title={reason}>
              {reason || 'Unknown'}
            </span>
            <span className="text-[10px] text-gray-500">
              {date ? new Date(date).toLocaleString() : ''}
            </span>
          </div>
        );
      },
    },
    ...(isAdmin ? [{
      id: "actions",
      header: ({ column }) => (
          <div className="text-right pr-2">Actions</div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-1.5 pr-1">
            <Tooltip content="Adjust Stock">
              <button
                type="button"
                onClick={() => setAdjustingIngredient(item)}
                aria-label="Adjust Stock"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 hover:bg-orange-500 hover:text-white hover:ring-orange-400 transition-all cursor-pointer"
              >
                <SlidersHorizontal size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Edit Material">
              <button
                type="button"
                onClick={() => handleEdit(item)}
                aria-label="Edit Material"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 hover:bg-blue-500 hover:text-white hover:ring-blue-400 transition-all cursor-pointer"
              >
                <Pencil size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Delete Material">
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete Material"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500 hover:text-white hover:ring-red-400 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </Tooltip>
          </div>
        );
      },
    }] : []),
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
         <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search raw materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
            >
              <Plus size={18} className="mr-2" />
              Add Raw Material
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0">
            <CardTitle className="flex items-center gap-2">
              Raw Materials Stock <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200">{ingredients.length}</Badge>
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="w-32">
                <Select 
                  value={filterUnit} 
                  onChange={(e) => setFilterUnit(e.target.value)} 
                  options={[
                    { label: "All Units", value: "all" },
                    ...RECIPE_UNITS.filter(u => u.value !== "").map(u => ({ label: u.label, value: u.value }))
                  ]}
                  placeholder="Unit"
                  className="bg-gray-900 border-gray-700 text-white h-9"
                />
              </div>

              <div className="w-40">
                <Select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  options={DATE_FILTER_OPTIONS}
                  placeholder="Date"
                  className="bg-gray-900 border-gray-700 text-white h-9"
                />
              </div>

              <div className="w-40">
                <Select 
                  value={sortConfig} 
                  onChange={(e) => setSortConfig(e.target.value)} 
                  options={SORT_OPTIONS}
                  className="bg-gray-900 border-gray-700 text-white h-9"
                />
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterUnit("all");
                  setDateFilter("all");
                  setSortConfig("createdAt:desc");
                }}
                title="Reset"
                className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <DataTable columns={columns} data={filteredIngredients} isLoading={loading} />
          </CardContent>
      </Card>

      <AddIngredientModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal}
        ingredientToEdit={editingIngredient}
      />
      
      <AdjustStockModal
        isOpen={!!adjustingIngredient}
        onClose={() => setAdjustingIngredient(null)}
        ingredient={adjustingIngredient}
        onSuccess={fetchIngredients}
      />

      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Ingredient"
        description="Are you sure you want to delete this ingredient? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
}

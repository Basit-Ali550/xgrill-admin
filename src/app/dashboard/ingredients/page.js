"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit, RefreshCw, Search } from "lucide-react";
import { getIngredientsAction, deleteIngredientAction } from "@/app/actions/ingredients";
import AddIngredientModal from "@/components/ingredients/AddIngredientModal";
import AdjustStockModal from "@/components/ingredients/AdjustStockModal";
import { DataTable } from "@/components/ui/data-table";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");


  const fetchIngredients = async () => {
    const res = await getIngredientsAction();
    if (res?.success) {
      setIngredients(res.data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIngredients();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      await deleteIngredientAction(id);
      fetchIngredients();
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
          <div className="text-center">Current Stock</div>
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
              {stock}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "costPerUnit",
      header: ({ column }) => (
          <div className="text-center">Cost/Unit</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-gray-400">Rs. {row.getValue("costPerUnit")}</div>
      ),
    },
    {
      accessorKey: "lowStockThreshold",
      header: ({ column }) => (
          <div className="text-center">Threshold</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-gray-500">{row.getValue("lowStockThreshold")}</div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => (
          <div className="text-center">Status</div>
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
      id: "actions",
      header: ({ column }) => (
          <div className="text-right">Actions</div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdjustingIngredient(item)}
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
              title="Adjust Stock"
            >
              <RefreshCw size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(item)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(item.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
         <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700"
            />
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
          >
            <Plus size={18} className="mr-2" />
            Add New Ingredient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🥦</span> Raw Ingredients Stock
            </CardTitle>
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
    </>
  );
}

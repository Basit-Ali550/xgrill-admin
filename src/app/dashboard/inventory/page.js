"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { ArrowUpDown, RefreshCw, Trash2, Edit, Search } from "lucide-react";
import AdjustInventoryModal from "@/components/inventory/AdjustInventoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function InventoryPage() {
  const { inventory, loading, adjustInventory, deleteInventoryItem } = useInventory();
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInventoryItem(deleteId);
      setDeleteId(null);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter((item) =>
      item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const columns = useMemo(() => [
    {
      accessorKey: "product.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0 hover:bg-transparent"
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            {item.product?.image && (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <span className="text-white font-medium">
              {item.product?.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "product.category",
      header: "Category",
      cell: ({ row }) => row.original.product?.category || "N/A",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <div className="text-center">
             <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent"
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isLowStock = item.quantity <= item.lowStockThreshold;
        return (
          <div className={`text-center text-2xl font-bold ${isLowStock ? "text-red-400" : "text-green-400"}`}>
            {item.quantity}
          </div>
        );
      },
    },
    {
      accessorKey: "lowStockThreshold",
      header: () => <div className="text-center">Threshold</div>,
      cell: ({ row }) => <div className="text-center text-gray-500">{row.original.lowStockThreshold}</div>,
    },
    {
      id: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const item = row.original;
        const isLowStock = item.quantity <= item.lowStockThreshold;
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
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdjustingItem(item)}
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
              title="Adjust Stock"
            >
              <RefreshCw size={16} />
            </Button>
            {/* Edit functionality to be implemented fully if needed, for now placeholder like Ingredients */}
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
               <Link href={`/dashboard/inventory/edit/${item.id}`}><Edit size={16} /></Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(item.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ], []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
         <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700"
            />
          </div>
          <div className="flex gap-4">
             <Link href="/dashboard/inventory/add">
               <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                 Add Inventory
               </Button>
             </Link>
          </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📦</span> Stock Levels
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={filteredInventory || []} 
            isLoading={loading} 
          />
        </CardContent>
      </Card>

      <AdjustInventoryModal
        isOpen={!!adjustingItem}
        onClose={() => setAdjustingItem(null)}
        item={adjustingItem}
        onAdjust={adjustInventory}
        onSuccess={() => setAdjustingItem(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />
    </>
  );
}

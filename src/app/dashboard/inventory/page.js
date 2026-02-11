"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { ArrowUpDown, RefreshCw, Trash2, Edit, Search, Package, Sparkles } from "lucide-react";
import AdjustInventoryModal from "@/components/inventory/AdjustInventoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function InventoryPage() {
  const { inventory, loading, adjustInventory, deleteInventoryItem } = useInventory();
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | sale | supply

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInventoryItem(deleteId);
      setDeleteId(null);
    }
  };

  const filteredInventory = useMemo(() => {
    let items = inventory;
    
    // First, filter out inactive products
    items = items.filter((item) => item.product?.isActive !== false);
    
    if (filterType === 'sale') {
      items = items.filter((item) => !item.product?.isServiceSupply);
    } else if (filterType === 'supply') {
      items = items.filter((item) => item.product?.isServiceSupply);
    }
    
    if (searchQuery) {
      items = items.filter((item) =>
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return items;
  }, [inventory, searchQuery, filterType]);

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
      accessorKey: "product.unitType",
      header: "Unit Type",
      cell: ({ row }) => (
        <span className="text-gray-300 text-nowrap">{row.original.product?.unitType || "N/A"}</span>
      ),
    },
    {
      accessorKey: "product.basePrice",
      header: "Base Price",
      cell: ({ row }) => {
        const price = row.original.product?.basePrice;
        const isSupply = row.original.product?.isServiceSupply;
        return (
          <span className="text-green-400 text-nowrap font-semibold">
            {isSupply ? "N/A" : `Rs ${price?.toFixed(3) || "0.000"}`}
          </span>
        );
      },
    },
    {
      accessorKey: "product.purchasePrice",
      header: "Purch. Price",
      cell: ({ row }) => {
        const price = row.original.product?.purchasePrice;
        return (
          <span className="text-orange-400 text-nowrap font-semibold">
             Rs {price?.toFixed(3) || "0.000"}
          </span>
        );
      },
    },
    {
      accessorKey: "product.createdAt",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.original.product?.createdAt;
        return (
          <div className="text-xs text-nowrap text-gray-400">
            {date ? new Date(date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated Date",
      cell: ({ row }) => {
        const date = row.original.updatedAt;
        return (
          <div className="text-xs text-nowrap text-gray-400">
            {date ? new Date(date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : "N/A"}
          </div>
        );
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const isSupply = row.original.product?.isServiceSupply;
        return (
          <Badge 
            variant={isSupply ? "secondary" : "default"}
            className={isSupply ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"}
          >
            {isSupply ? (
              <><Sparkles size={12} className="mr-1" /> Supply</>
            ) : (
              <><Package size={12} className="mr-1" /> Sale</>
            )}
          </Badge>
        );
      },
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
            {item.quantity.toFixed(3)}
          </div>
        );
      },
    },
    {
      accessorKey: "lowStockThreshold",
      header: () => <div className="text-center">Threshold</div>,
      cell: ({ row }) => <div className="text-center text-gray-500">{parseFloat(row.original.lowStockThreshold || 0).toFixed(3)}</div>,
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
          
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg mx-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('sale')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                filterType === 'sale'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package size={14} /> Sale Items
            </button>
            <button
              onClick={() => setFilterType('supply')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                filterType === 'supply'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Supplies
            </button>
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

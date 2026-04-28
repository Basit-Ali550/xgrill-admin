"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { ArrowUpDown, RefreshCw, Trash2, Pencil, SlidersHorizontal, Search, Package, Sparkles } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import AdjustInventoryModal from "@/components/inventory/AdjustInventoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  INVENTORY_CATEGORIES,
  SERVICE_SUPPLY_CATEGORIES,
  UNIT_TYPES,
  SERVICE_SUPPLY_UNITS,
  SORT_OPTIONS,
  DATE_FILTER_OPTIONS
} from "@/constants";

export default function InventoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { inventory, loading, adjustInventory, deleteInventoryItem } = useInventory();
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | sale | supply

  // New Filters & Sorting
  const [filterUnit, setFilterUnit] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState("createdAt:desc");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInventoryItem(deleteId);
      setDeleteId(null);
    }
  };

  const combinedUnits = useMemo(() => {
    const units = [...UNIT_TYPES, ...SERVICE_SUPPLY_UNITS]
      .filter(u => u.value !== "")
      .filter((u, index, self) => index === self.findIndex(t => t.value === u.value));
    return [{ label: "All Units", value: "all" }, ...units];
  }, []);

  const combinedCategories = useMemo(() => {
    const cats = [...INVENTORY_CATEGORIES, ...SERVICE_SUPPLY_CATEGORIES]
      .filter(c => c.value !== "")
      .filter((c, index, self) => index === self.findIndex(t => t.value === c.value));
    return [{ label: "All Categories", value: "all" }, ...cats];
  }, []);

  const filteredInventory = useMemo(() => {
    let items = [...inventory];
    
    // 1. Filter out inactive products (optional, based on requirement)
    items = items.filter((item) => item.product?.isActive !== false);
    
    // 2. Type Filter (Sale/Supply)
    if (filterType === 'sale') {
      items = items.filter((item) => !item.product?.isServiceSupply);
    } else if (filterType === 'supply') {
      items = items.filter((item) => item.product?.isServiceSupply);
    }

    // 3. Category Filter
    if (filterCategory !== 'all') {
      items = items.filter((item) => item.product?.category === filterCategory);
    }

    // 4. Unit Filter
    if (filterUnit !== 'all') {
      items = items.filter((item) => item.product?.unitType === filterUnit);
    }
    
    // 5. Search Filter
    if (searchQuery) {
      items = items.filter((item) =>
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 6. Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      items = items.filter((item) => {
        const itemDate = new Date(item.product?.createdAt || item.createdAt);
        if (dateFilter === 'today') {
           return itemDate.toDateString() === now.toDateString();
        }
        if (dateFilter === 'yesterday') {
           const yest = new Date(now);
           yest.setDate(yest.getDate() - 1);
           return itemDate.toDateString() === yest.toDateString();
        }
        if (dateFilter === 'week') {
           const weekAgo = new Date(now);
           weekAgo.setDate(weekAgo.getDate() - 7);
           return itemDate >= weekAgo;
        }
        if (dateFilter === 'month') {
           const monthAgo = new Date(now);
           monthAgo.setMonth(monthAgo.getMonth() - 1);
           return itemDate >= monthAgo;
        }
        if (dateFilter === 'year') {
           const yearAgo = new Date(now);
           yearAgo.setFullYear(yearAgo.getFullYear() - 1);
           return itemDate >= yearAgo;
        }
        return true;
      });
    }

    // 7. Sort
    const [field, order] = sortConfig.split(":");
    items.sort((a, b) => {
      let valA, valB;
      if (field === 'name') {
        valA = a.product?.name || "";
        valB = b.product?.name || "";
      } else if (field === 'stock' || field === 'quantity') {
        valA = a.quantity || 0;
        valB = b.quantity || 0;
      } else if (field === 'price') {
        valA = a.product?.basePrice || 0;
        valB = b.product?.basePrice || 0;
      } else {
        valA = new Date(a.product?.createdAt || a.createdAt);
        valB = new Date(b.product?.createdAt || b.createdAt);
      }

      const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
      return order === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [inventory, searchQuery, filterType, filterUnit, dateFilter, sortConfig, filterCategory]);

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
      header: "Sale Price",
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
    ...(isAdmin ? [{
      accessorKey: "product.purchasePrice",
      header: "Purchase Price",
      cell: ({ row }) => {
        const price = row.original.product?.purchasePrice;
        return (
          <span className="text-orange-400 text-nowrap font-semibold">
             Rs {price?.toFixed(3) || "0.000"}
          </span>
        );
      },
    }] : []),
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
            Available Stock
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
      header: () => <div className="text-center">Low Stock Alert</div>,
      cell: ({ row }) => <div className="text-center text-gray-500">{parseFloat(row.original.lowStockThreshold || 0).toFixed(3)}</div>,
    },

    {
      id: "status",
      header: () => <div className="text-center">Stock Status</div>,
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
    ...(isAdmin ? [{
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-1.5 pr-1">
            <Tooltip content="Adjust Stock">
              <button
                type="button"
                onClick={() => setAdjustingItem(item)}
                aria-label="Adjust Stock"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 hover:bg-orange-500 hover:text-white hover:ring-orange-400 transition-all cursor-pointer"
              >
                <SlidersHorizontal size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Edit Item">
              <Link
                href={`/dashboard/inventory/edit/${item.id}`}
                aria-label="Edit Item"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 hover:bg-blue-500 hover:text-white hover:ring-blue-400 transition-all"
              >
                <Pencil size={14} />
              </Link>
            </Tooltip>
            <Tooltip content="Delete Item">
              <button
                type="button"
                onClick={() => setDeleteId(item.id)}
                aria-label="Delete Item"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500 hover:text-white hover:ring-red-400 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </Tooltip>
          </div>
        );
      },
    }] : []),
  ], [isAdmin]);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
         <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search product stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-700 h-10"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('sale')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'sale'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package size={14} /> Sale
            </button>
            <button
              onClick={() => setFilterType('supply')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'supply'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Supplies
            </button>
          </div>
          
          {isAdmin && (
            <Link href="/dashboard/inventory/add">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap">
                Add Product Stock
              </Button>
            </Link>
          )}
        </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0 pb-6 border-b border-gray-800">
          <CardTitle className="flex items-center gap-2">
            <span>📦</span> Product Stock
            <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
              {filteredInventory.length}
            </Badge>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="w-40">
                <Select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)} 
                  options={combinedCategories}
                  placeholder="Category"
                  className="bg-gray-900 border-gray-700 text-white h-9"
                />
              </div>

              <div className="w-32">
                <Select 
                  value={filterUnit} 
                  onChange={(e) => setFilterUnit(e.target.value)} 
                  options={combinedUnits}
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
                  setFilterType('all');
                  setFilterCategory('all');
                  setFilterUnit('all');
                  setDateFilter('all');
                  setSortConfig('createdAt:desc');
                  setSearchQuery('');
                }}
                title="Reset All Filters"
                className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800 hover:text-orange-400 transition-colors"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
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

"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

// Separate component for the adjustment cell to manage its own state
const AdjustmentCell = ({ row, adjustInventory }) => {
  const [adjustment, setAdjustment] = useState("");
  const item = row.original;

  const handleAdjustment = async () => {
    if (!adjustment || adjustment === 0) return;
    try {
      await adjustInventory(item.productId, parseInt(adjustment));
      setAdjustment("");
    } catch (error) {
      console.error("Failed to adjust inventory:", error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Input
        type="number"
        placeholder="+/-"
        value={adjustment}
        onChange={(e) => setAdjustment(e.target.value)}
        className="w-20 text-center"
      />
      <Button
        size="sm"
        onClick={handleAdjustment}
        disabled={!adjustment}
      >
        Update
      </Button>
    </div>
  );
};

export default function InventoryPage() {
  const { inventory, loading, adjustInventory } = useInventory();

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
      id: "actions",
      header: () => <div className="text-center">Adjust</div>,
      cell: ({ row }) => (
        <AdjustmentCell row={row} adjustInventory={adjustInventory} />
      ),
    },
  ], [adjustInventory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📦</span> Stock Levels
        </CardTitle>
        <div className="flex justify-end mt-2 mr-4">
          <Link href="/dashboard/inventory/add"><Button size="sm">Add Inventory</Button></Link>
        </div>
      </CardHeader>
      
      <CardContent>
        <DataTable 
          columns={columns} 
          data={inventory || []} 
          isLoading={loading} 
        />
      </CardContent>
    </Card>
  );
}

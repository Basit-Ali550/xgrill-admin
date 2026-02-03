"use client";
import React from "react";
import { Package, Search, Minus } from "lucide-react";

/**
 * Inventory add-ons selector - dropdown and tags for inventory items
 */
export default function InventoryAddonsSelector({
  filteredInventory,
  selectedProducts,
  availableProducts,
  onAdd,
  onRemove,
}) {
  // Get selected inventory items
  const selectedInventoryItems = selectedProducts
    .map((id) => availableProducts.find((p) => p.id === id))
    .filter((p) => p && p.isInventoryOnly);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2 pb-1 border-b border-gray-800">
        <Package size={14} className="text-purple-400" />
        <span className="text-sm font-medium text-gray-300">
          Inventory Add-ons
        </span>
        <span className="text-xs text-gray-600">(Drinks, Sides, etc.)</span>
      </div>

      <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 space-y-4">
        {/* Custom Search/Select Input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <select
            onChange={(e) => {
              if (e.target.value) onAdd(e.target.value);
              e.target.value = "";
            }}
            className="w-full h-11 bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
          >
            <option value="">Find & add inventory item...</option>
            {filteredInventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — Rs. {item.basePrice || item.price}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Inventory Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedInventoryItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 pr-1 pl-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full animate-in fade-in zoom-in duration-200"
            >
              <span className="text-xs text-purple-200 font-medium">
                {item.name}
              </span>
              <span className="text-[10px] text-purple-400/70 border-l border-purple-500/20 pl-2">
                Rs.{item.basePrice || item.price}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1 hover:bg-purple-500/20 rounded-full text-purple-400 hover:text-white transition-colors"
              >
                <Minus size={12} />
              </button>
            </div>
          ))}
          {selectedInventoryItems.length === 0 && (
            <p className="text-xs text-gray-600 py-2 ml-1">
              No add-ons selected yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

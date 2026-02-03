"use client";
import React from "react";
import { Search, ShoppingBag, Plus, Utensils } from "lucide-react";
export default function MenuItemsSelector({
  menuItems,
  selectedProducts,
  menuSearch,
  setMenuSearch,
  onToggle,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gray-900/40 p-2 rounded-lg border border-gray-800/50">
        <div className="flex items-center gap-2 px-2">
          <Utensils size={14} className="text-orange-400" />
          <span className="text-sm font-medium text-gray-300">Menu Items</span>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search menu..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="h-8 bg-gray-900 border border-gray-700 rounded text-xs text-white pl-8 pr-3 focus:outline-none focus:border-orange-500 w-40 transition-all focus:w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {menuItems.map((product) => {
          const isSelected = selectedProducts.includes(product.id);
          return (
            <div
              key={product.id}
              onClick={() => onToggle(product.id, !isSelected)}
              className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "bg-gray-800/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800"
              }`}
            >
              {/* Selection Indicator */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? "bg-blue-500" : "bg-transparent"}`}
              />

              {/* Image Placeholder or Icon */}
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-500 text-white" : "bg-gray-700/50 text-gray-500"}`}
              >
                {isSelected ? (
                  <Plus size={20} className="rotate-45" />
                ) : (
                  <ShoppingBag size={18} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium truncate ${isSelected ? "text-blue-400" : "text-gray-300 group-hover:text-white"}`}
                >
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-gray-400 block">
                  Rs.{product.basePrice || product.price}
                </span>
              </div>
            </div>
          );
        })}
        {menuItems.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500 text-sm italic">
            No matching menu items found.
          </div>
        )}
      </div>
    </div>
  );
}

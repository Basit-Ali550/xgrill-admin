"use client";
import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIZE_CONFIG } from "@/constants";

export default function VariantPricingSection({
  category,
  productionCost,
  variants,
  selectedSize,
  setSelectedSize,
  variantPrice,
  setVariantPrice,
  profit,
  setProfit,
  onAddVariant,
  onRemoveVariant,
}) {
  const sizes = SIZE_CONFIG[category] || [];
  // Filter out sizes that have already been added
  const availableSizes = sizes.filter(
    (s) => !variants.some((v) => v.size === s),
  );

  const handleProfitChange = (e) => {
    const p = parseFloat(e.target.value) || 0;
    setProfit(e.target.value);
    setVariantPrice((productionCost + p).toFixed(0));
  };

  const handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    setVariantPrice(e.target.value);
    setProfit((price - productionCost).toFixed(0));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Size Variants</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider">
            Mfg Cost:{" "}
            <span className="text-orange-400 font-mono">
              Rs.{productionCost.toFixed(0)}
            </span>
          </span>
        </div>
      </div>

      {/* Variant Entry Row — only show if there are sizes left to add */}
      {availableSizes.length > 0 && (
        <div className="grid grid-cols-12 gap-2 items-end">
          {/* Size */}
          <div className="col-span-4">
            <label className="text-[10px] text-gray-500 mb-1 block">Size</label>
            <select
              className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Select</option>
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Profit */}
          <div className="col-span-3">
            <label className="text-[10px] text-blue-400 mb-1 block">
              Profit
            </label>
            <input
              type="number"
              className="w-full bg-gray-800 border-blue-500/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Profit"
              value={profit}
              onChange={handleProfitChange}
            />
          </div>

          {/* Price */}
          <div className="col-span-3">
            <label className="text-[10px] text-green-500 mb-1 block">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-500 text-xs">
                Rs.
              </span>
              <input
                type="number"
                className="w-full bg-gray-800 border-green-500/30 rounded-lg pl-6 pr-2 py-2 text-sm text-white focus:ring-green-500 focus:border-green-500 font-bold"
                placeholder="0"
                value={variantPrice}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          {/* Add Button */}
          <div className="col-span-2">
            <Button
              type="button"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              onClick={onAddVariant}
              disabled={!selectedSize || !variantPrice}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Variants List */}
      <div className="space-y-2 mt-2">
        {variants.map((v, i) => {
          const impliedProfit = (v.price - productionCost).toFixed(0);
          return (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-800/40 px-3 py-2 rounded border border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-sm">{v.size}</span>
                <span className="text-[10px] text-gray-500">
                  (Profit:{" "}
                  <span
                    className={
                      impliedProfit >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {impliedProfit}
                  </span>
                  )
                </span>
                {v.isDefault && (
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-mono font-bold">
                  Rs. {v.price}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveVariant(i)}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { FormInput } from "@/components/ui/form-components";
export default function SimplePricingSection({
  productionCost,
  profit,
  setProfit,
  values,
  setFieldValue,
  handleChange,
}) {
  const handleProfitChange = (e) => {
    const p = parseFloat(e.target.value) || 0;
    setProfit(e.target.value);
    setFieldValue("basePrice", (productionCost + p).toFixed(0));
  };

  const handlePriceChange = (e) => {
    handleChange(e);
    const price = parseFloat(e.target.value) || 0;
    setProfit((price - productionCost).toFixed(0));
  };

  return (
    <div className="grid grid-cols-3 gap-6 items-end">
      {/* A. Mfg Cost */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Mfg. Cost</label>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 font-mono text-lg h-[46px] flex items-center">
          {productionCost.toFixed(0)}
        </div>
      </div>

      {/* B. Profit Input */}
      <div>
        <FormInput
          label="+ Your Profit"
          name="profit"
          type="number"
          value={profit}
          placeholder="Add"
          onChange={handleProfitChange}
          className="bg-gray-800 border-blue-500/30 focus:border-blue-500 text-white font-mono text-lg font-bold"
        />
      </div>

      {/* C. Final Price */}
      <div>
        <FormInput
          label="= Selling Price"
          name="basePrice"
          type="number"
          value={values.basePrice}
          onChange={handlePriceChange}
          className="bg-gray-950 border-green-500/50 text-green-400 font-mono text-lg font-bold"
        />
      </div>
    </div>
  );
}

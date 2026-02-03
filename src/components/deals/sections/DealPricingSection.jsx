"use client";
import React from "react";
import { DollarSign } from "lucide-react";
import { FormInput } from "@/components/ui/form-components";

/**
 * Deal pricing section - original price display, deal price input, and savings indicator
 */
export default function DealPricingSection({ values, savings }) {
  const amountSaved = (
    parseFloat(values.originalPrice || 0) - parseFloat(values.dealPrice || 0)
  ).toFixed(0);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <DollarSign size={18} className="text-green-500" />
        Pricing Strategy
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Total Value (Calculated)
          </label>
          <div className="h-10 px-3 bg-gray-800/80 border border-gray-700 rounded-lg flex items-center text-gray-300 font-mono text-sm">
            Rs. {values.originalPrice || 0}
          </div>
        </div>
        <FormInput
          label="Deal Price (Your Offer)"
          name="dealPrice"
          type="number"
          placeholder="0"
          className="bg-gray-800 border-gray-700 focus:border-orange-500"
        />
      </div>

      {/* Savings Indicator */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          savings > 0
            ? "bg-green-500/10 border-green-500/30"
            : "bg-gray-800 border-gray-700"
        }`}
      >
        <div>
          <p className="text-xs text-gray-400">Customer Savings</p>
          <p
            className={`text-lg font-bold ${savings > 0 ? "text-green-400" : "text-gray-500"}`}
          >
            {savings > 0 ? `${savings}% OFF` : "0%"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Amount Saved</p>
          <p
            className={`text-lg font-bold ${savings > 0 ? "text-green-400" : "text-gray-500"}`}
          >
            Rs. {amountSaved}
          </p>
        </div>
      </div>
    </div>
  );
}

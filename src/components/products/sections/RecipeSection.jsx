"use client";
import React from "react";
import { FieldArray } from "formik";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-components";
import { RECIPE_UNITS } from "@/constants";
import { convertUnit, getCompatibleUnits } from "@/lib/pricing-utils";

/**
 * Recipe section with ingredient list and cost calculation
 */
export default function RecipeSection({
  recipeData,
  availableIngredients,
  productionCost,
  handleChange,
  setFieldValue,
}) {
  // When ingredient changes, auto-set unit to ingredient's base unit
  const handleIngredientChange = (index, newIngredientId) => {
    setFieldValue(`recipeData[${index}].ingredientId`, newIngredientId);
    const ing = availableIngredients.find((i) => i.id === newIngredientId);
    if (ing && ing.unit) {
      setFieldValue(`recipeData[${index}].unit`, ing.unit);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Recipe & Ingredients
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Total Mfg. Cost:</span>
          <span className="text-xl font-mono font-bold text-orange-400">
            Rs. {productionCost.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <FieldArray name="recipeData">
          {({ push, remove }) => (
            <div>
              <div className="grid grid-cols-12 gap-2 p-3 bg-gray-950 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-bold">
                <div className="col-span-12 lg:col-span-5">Ingredient</div>
                <div className="col-span-3">Qty</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2 text-right">Cost</div>
              </div>
              <div className="p-2 space-y-2">
                {recipeData.map((item, index) => {
                  const ing = availableIngredients.find(
                    (i) => i.id === item.ingredientId,
                  );
                  let qty = parseFloat(item.quantityRequired) || 0;
                  // Unit conversion for cost display
                  if (ing && ing.unit && item.unit !== ing.unit) {
                    qty = convertUnit(qty, item.unit, ing.unit);
                  }
                  const cost = qty * (ing?.costPerUnit || 0);
                  const unitOptions = getCompatibleUnits(
                    ing?.unit,
                    RECIPE_UNITS,
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-12 lg:col-span-5">
                        <select
                          value={item.ingredientId || ""}
                          onChange={(e) =>
                            handleIngredientChange(index, e.target.value)
                          }
                          className="w-full bg-gray-800 border-transparent rounded text-xs h-8 px-2 text-gray-300"
                        >
                          <option value="">Select ingredient</option>
                          {availableIngredients.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <FormInput
                          name={`recipeData[${index}].quantityRequired`}
                          type="number"
                          placeholder="0"
                          className="bg-gray-800 border-transparent h-8 text-xs px-2"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            setFieldValue(
                              `recipeData[${index}].unit`,
                              e.target.value,
                            )
                          }
                          className="w-full bg-gray-800 border-transparent rounded text-xs h-8 px-1 text-gray-300"
                        >
                          {unitOptions.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2 items-center">
                        <span className="text-xs font-mono text-gray-400">
                          {cost > 0 ? cost.toFixed(1) : "-"}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-gray-600 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    push({
                      ingredientId: "",
                      quantityRequired: "",
                      unit: "g",
                    })
                  }
                  className="w-full text-xs border border-dashed border-gray-700 text-gray-500 hover:text-blue-400 mt-2"
                >
                  + Add Ingredient
                </Button>
              </div>
            </div>
          )}
        </FieldArray>
      </div>
    </section>
  );
}

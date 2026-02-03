/**
 * Pricing utility functions for deals and products
 */

/**
 * Calculate savings percentage between original and deal price
 * @param {number|string} original - Original total price
 * @param {number|string} deal - Deal price
 * @returns {number} Savings percentage (0-100)
 */
export const calculateSavings = (original, deal) => {
  const orig = parseFloat(original) || 0;
  const dealP = parseFloat(deal) || 0;
  if (orig <= 0) return 0;
  return Math.round(((orig - dealP) / orig) * 100);
};

/**
 * Calculate total price of selected products
 * @param {Array} products - All available products
 * @param {Array} selectedIds - Array of selected product IDs
 * @returns {number} Total price
 */
export const calculateTotalOriginalPrice = (products, selectedIds) => {
  return selectedIds.reduce((sum, id) => {
    const prod = products.find((p) => p.id === id);
    return sum + (prod ? parseFloat(prod.basePrice || prod.price) || 0 : 0);
  }, 0);
};

/**
 * Convert quantity between units
 * @param {number} qty - Quantity to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted quantity
 */
export const convertUnit = (qty, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return qty;
  
  if (fromUnit === "g" && toUnit === "kg") return qty / 1000;
  if (fromUnit === "kg" && toUnit === "g") return qty * 1000;
  if (fromUnit === "ml" && toUnit === "l") return qty / 1000;
  if (fromUnit === "l" && toUnit === "ml") return qty * 1000;
  
  return qty;
};

/**
 * Calculate production cost from recipe data
 * @param {Array} recipeData - Array of { ingredientId, quantityRequired, unit }
 * @param {Array} ingredients - Available ingredients with costPerUnit
 * @returns {number} Total production cost
 */
export const calculateProductionCost = (recipeData, ingredients) => {
  return recipeData.reduce((sum, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    if (!ing) return sum;

    let qty = parseFloat(item.quantityRequired) || 0;
    qty = convertUnit(qty, item.unit, ing.unit);

    return sum + qty * (ing.costPerUnit || 0);
  }, 0);
};

/**
 * Get compatible unit options based on ingredient's base unit
 * @param {string} ingredientUnit - The ingredient's base unit
 * @param {Array} allUnits - All available unit options
 * @returns {Array} Filtered unit options
 */
export const getCompatibleUnits = (ingredientUnit, allUnits) => {
  if (!ingredientUnit) return allUnits;
  
  const mass = ["g", "kg"];
  const vol = ["ml", "l"];
  
  if (mass.includes(ingredientUnit)) {
    return allUnits.filter((u) => mass.includes(u.value));
  }
  if (vol.includes(ingredientUnit)) {
    return allUnits.filter((u) => vol.includes(u.value));
  }
  
  return [{ label: ingredientUnit, value: ingredientUnit }];
};

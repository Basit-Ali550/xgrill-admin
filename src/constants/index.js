// Shared constants for admin-panel

// Order status with colors
export const ORDER_STATUS_COLORS = {
  PENDING: { bg: "rgba(234, 179, 8, 0.2)", color: "#facc15", label: "Pending" },
  PREPARING: { bg: "rgba(139, 92, 246, 0.2)", color: "#a78bfa", label: "Preparing" },
  PREPARED: { bg: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", label: "Prepared" },
  OUT_FOR_DELIVERY: { bg: "rgba(249, 115, 22, 0.2)", color: "#fb923c", label: "Out for Delivery" },
  DELIVERED: { bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80", label: "Delivered" },
  CANCELLED: { bg: "rgba(239, 68, 68, 0.2)", color: "#f87171", label: "Cancelled" },
};

// Size configurations by category (Moving from AddProductModal)
export const SIZE_CONFIG = {
  Pizza: ["Small", "Medium", "Large", "Extra Large"],
  Pasta: ["Regular", "Large"],
  Burgers: ["Single", "Double"],
  Beverages: ["Small", "Medium", "Large"], // Changed 'Drinks' to 'Beverages' to match PRODUCT_CATEGORIES
};

// Categories that support sizes
export const CATEGORIES_WITH_SIZES = Object.keys(SIZE_CONFIG);

// Order statuses array
export const ORDER_STATUSES = [
  "PENDING",
  "PREPARING",
  "PREPARED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export const PRODUCT_CATEGORIES = [
  { label: "Burgers", value: "Burgers" },
  { label: "Steaks", value: "Steaks" },
  { label: "Pizza", value: "Pizza" },
  { label: "Pasta", value: "Pasta" },
  { label: "Appetizers", value: "Appetizers" },
  { label: "Drinks", value: "Drinks" },

  // Added easy & common categories
  { label: "Sandwiches", value: "Sandwiches" },
  { label: "Wraps", value: "Wraps" },
  { label: "Fries & Sides", value: "Fries & Sides" },
  { label: "Chicken Items", value: "Chicken Items" },
  { label: "Desserts", value: "Desserts" },
  { label: "Ice Cream", value: "Ice Cream" },
  { label: "Combos / Meals", value: "Combos / Meals" },
  { label: "Sauces & Dips", value: "Sauces & Dips" },
  { label: "Beverages", value: "Beverages" }, // covers juice, coffee, tea, shakes
];


export const RECIPE_UNITS = [
  { label: "--", value: "" },
  { label: "g", value: "g" },
  { label: "kg", value: "kg" },
  { label: "ml", value: "ml" },
  { label: "l", value: "l" },
  { label: "pcs", value: "pcs" },
];

export const IMAGE_UPLOAD_FOLDERS = {
  PRODUCTS: "grill-x/products",
};

// Inventory categories (for direct sale items)
export const INVENTORY_CATEGORIES = [
  { value: "", label: "Select category" },
  { value: "Drink", label: "Soft Drinks" },
  { value: "Water", label: "Water" },
  { value: "Juice", label: "Juice" },
  { value: "Shake", label: "Shakes" },
  { value: "Smoothie", label: "Smoothies" },
  { value: "Tea", label: "Tea" },
  { value: "Coffee", label: "Coffee" },
  { value: "Energy Drink", label: "Energy Drinks" },
  { value: "Burger", label: "Burgers" },
  { value: "Pizza", label: "Pizza" },
  { value: "Sandwich", label: "Sandwiches" },
  { value: "Wrap", label: "Wraps & Rolls" },
  { value: "Fried Chicken", label: "Fried Chicken" },
  { value: "BBQ", label: "BBQ" },
  { value: "Pasta", label: "Pasta" },
  { value: "Rice", label: "Rice / Bowls" },
  { value: "Snack", label: "Snacks" },
  { value: "Fries", label: "Fries" },
  { value: "Nuggets", label: "Nuggets" },
  { value: "Wings", label: "Wings" },
  { value: "Side", label: "Side Items" },
  { value: "Dessert", label: "Desserts" },
  { value: "Cake", label: "Cakes" },
  { value: "Ice Cream", label: "Ice Cream" },
  { value: "Donut", label: "Donuts" },
  { value: "Pastry", label: "Pastries" },
  { value: "Bakery", label: "Bakery Items" },
  { value: "Sauce", label: "Sauces & Dips" },
  { value: "Topping", label: "Toppings" },
  { value: "Add-on", label: "Add-ons" },
  { value: "Combo", label: "Combo Deals" },
  { value: "Meal", label: "Meals" },
  { value: "Raw Material", label: "Raw Materials" },
  { value: "Frozen", label: "Frozen Items" },
  { value: "Other", label: "Other" },
];

// Unit types
export const UNIT_TYPES = [
  { value: "", label: "Select unit" },
  { value: "Bottle", label: "Bottle" },
  { value: "Can", label: "Can" },
  { value: "Cup", label: "Cup" },
  { value: "Glass", label: "Glass" },
  { value: "Piece", label: "Piece" },
  { value: "Pack", label: "Pack" },
  { value: "Six Pack", label: "Six Pack" },
  { value: "Dozen", label: "Dozen" },
  { value: "Case", label: "Case" },
  { value: "Box", label: "Box" },
  { value: "Carton", label: "Carton" },
  { value: "Crate", label: "Crate" },
  { value: "Jug", label: "Jug" },
  { value: "Pitcher", label: "Pitcher" },
  { value: "Liter", label: "Liter" },
  { value: "Milliliter", label: "Milliliter" },
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
  { value: "Extra Large", label: "Extra Large" },
  { value: "Tray", label: "Tray" },
  { value: "Bundle", label: "Bundle" },
];


// Size options
export const SIZE_OPTIONS = [
  { value: "", label: "Select size" },
  { value: "150ml", label: "150ml" },
  { value: "200ml", label: "200ml" },
  { value: "250ml", label: "250ml" },
  { value: "300ml", label: "300ml" },
  { value: "330ml", label: "330ml (Can)" },
  { value: "345ml", label: "345ml" },
  { value: "400ml", label: "400ml" },
  { value: "450ml", label: "450ml" },
  { value: "500ml", label: "500ml" },
  { value: "600ml", label: "600ml" },
  { value: "650ml", label: "650ml" },
  { value: "750ml", label: "750ml" },
  { value: "1L", label: "1L" },
  { value: "1.25L", label: "1.25L" },
  { value: "1.5L", label: "1.5L" },
  { value: "1.75L", label: "1.75L" },
  { value: "2L", label: "2L" },
  { value: "2.25L", label: "2.25L" },
  // { value: "2.5L", label: "2.5L" },
  // { value: "3L", label: "3L" },

  // Cups / fountain / fast-food sizes
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
  { value: "Extra Large", label: "Extra Large" },

  // Glass sizes (restaurants)
  { value: "Half Glass", label: "Half Glass" },
  { value: "Full Glass", label: "Full Glass" },
  { value: "Jug", label: "Jug" },

  // Custom / special
  { value: "Family Pack", label: "Family Pack" },
  { value: "Party Pack", label: "Party Pack" },
];

export const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const ITEM_TYPE_OPTIONS = [
  { value: "sale", label: "🛒 Sale Item", description: "Items sold to customers" },
  { value: "supply", label: "🧻 Service Supply", description: "Free items (tissues, napkins)" },
];
export const SERVICE_SUPPLY_CATEGORIES = [
  { value: "", label: "Select category" },
  { value: "Tissues", label: "Tissues" },
  { value: "Napkins", label: "Napkins" },
  { value: "Disposable Plates", label: "Disposable Plates" },
  { value: "Disposable Cups", label: "Disposable Cups" },
  { value: "Disposable Spoons", label: "Disposable Spoons" },
  { value: "Disposable Forks", label: "Disposable Forks" },
  { value: "Straws", label: "Straws" },
  { value: "Toothpicks", label: "Toothpicks" },
  { value: "Paper Bags", label: "Paper Bags" },
  { value: "Plastic Bags", label: "Plastic Bags" },
  { value: "Food Wrapping", label: "Food Wrapping" },
  { value: "Aluminum Foil", label: "Aluminum Foil" },
  { value: "Takeaway Boxes", label: "Takeaway Boxes" },
  { value: "Gloves", label: "Gloves" },
  { value: "Cleaning Supplies", label: "Cleaning Supplies" },
  { value: "Other Supply", label: "Other" },
];
export const SERVICE_SUPPLY_UNITS = [
  { value: "", label: "Select unit" },
  { value: "Pack", label: "Pack" },
  { value: "Box", label: "Box" },
  { value: "Roll", label: "Roll" },
  { value: "Bundle", label: "Bundle" },
  { value: "Piece", label: "Piece" },
  { value: "Dozen", label: "Dozen" },
  { value: "Carton", label: "Carton" },
  { value: "Bag", label: "Bag" },
  { value: "Set", label: "Set" },
];


// Helper to get status style
export const getStatusStyle = (status) => {
  return ORDER_STATUS_COLORS[status] || { bg: "rgba(107, 114, 128, 0.2)", color: "#9ca3af", label: status };
};

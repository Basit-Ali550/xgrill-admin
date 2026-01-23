// Shared constants for admin-panel

// Order status with colors
export const ORDER_STATUS_COLORS = {
  PENDING: { bg: "rgba(234, 179, 8, 0.2)", color: "#facc15", label: "Pending" },
  ACCEPTED: { bg: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", label: "Accepted" },
  PREPARING: { bg: "rgba(139, 92, 246, 0.2)", color: "#a78bfa", label: "Preparing" },
  OUT_FOR_DELIVERY: { bg: "rgba(249, 115, 22, 0.2)", color: "#fb923c", label: "Out for Delivery" },
  DELIVERED: { bg: "rgba(34, 197, 94, 0.2)", color: "#4ade80", label: "Delivered" },
  CANCELLED: { bg: "rgba(239, 68, 68, 0.2)", color: "#f87171", label: "Cancelled" },
};

// Order statuses array
export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED", 
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

// Product categories
export const PRODUCT_CATEGORIES = [
  "Pizza",
  "Burgers",
  "Pasta",
  "Grills",
  "Appetizers",
  "Sides",
  "Beverages",
  "Desserts",
];

// Inventory categories (for direct sale items)
export const INVENTORY_CATEGORIES = [
  { value: "", label: "Select category" },
  { value: "Drink", label: "Drink" },
  { value: "Water", label: "Water" },
  { value: "Snack", label: "Snack" },
  { value: "Dessert", label: "Dessert" },
];

// Unit types
export const UNIT_TYPES = [
  { value: "", label: "Select unit" },
  { value: "Bottle", label: "Bottle" },
  { value: "Can", label: "Can" },
  { value: "Pack", label: "Pack" },
  { value: "Piece", label: "Piece" },
];

// Size options
export const SIZE_OPTIONS = [
  { value: "", label: "Select size" },
  { value: "250ml", label: "250ml" },
  { value: "500ml", label: "500ml" },
  { value: "1L", label: "1L" },
  { value: "1.5L", label: "1.5L" },
  { value: "2.25L", label: "2.25L" },
  { value: "Small", label: "Small" },
  { value: "Large", label: "Large" },
];

// Helper to get status style
export const getStatusStyle = (status) => {
  return ORDER_STATUS_COLORS[status] || { bg: "rgba(107, 114, 128, 0.2)", color: "#9ca3af", label: status };
};

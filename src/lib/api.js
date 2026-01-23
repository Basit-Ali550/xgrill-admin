// Centralized API client for admin-panel

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Base fetch wrapper with error handling
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// API methods
export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  
  post: (endpoint, body) => request(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  }),
  
  put: (endpoint, body) => request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  }),
  
  patch: (endpoint, body) => request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  }),
  
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;

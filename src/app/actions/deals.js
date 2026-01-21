"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export async function getDealsAction() {
  try {
    const res = await fetch(`${API_URL}/deals`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching deals:", error);
    return { success: false, error: error.message };
  }
}

export async function getDealAction(id) {
  try {
    const res = await fetch(`${API_URL}/deals/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching deal:", error);
    return { success: false, error: error.message };
  }
}

export async function createDealAction(dealData) {
  try {
    const res = await fetch(`${API_URL}/deals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealData),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error creating deal:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDealAction(id, dealData) {
  try {
    const res = await fetch(`${API_URL}/deals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealData),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating deal:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDealAction(id) {
  try {
    const res = await fetch(`${API_URL}/deals/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error deleting deal:", error);
    return { success: false, error: error.message };
  }
}

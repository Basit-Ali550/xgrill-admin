import { api } from "@/lib/api";

export const getDashboardStats = async () => {
    try {
        const response = await api.get("/api/v1/dashboard/stats");
        if (response.success) {
            return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

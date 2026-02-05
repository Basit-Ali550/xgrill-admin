import { api } from "@/lib/api";

export const getDashboardStats = async (startDate, endDate) => {
    try {
        let url = "/api/v1/dashboard/stats";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        if (response.success) {
            return { success: true, data: response.data };
        }
        return { success: false, error: response.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

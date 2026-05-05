import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorReport = {
            message: error.message,
            status: error.response?.status,
            code: error.code,
            isNetworkError: !error.response,
        };

        console.error(
            `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url ?? ""}`,
            errorReport,
        );

        return Promise.reject(errorReport);
    },
);

export default apiClient;

import apiClient from "./api.client";

const apiService = {
    async getApiStatus() {
        const [aliveResponse, readyResponse] = await Promise.all([
            apiClient.get<boolean>("ping"),
            apiClient.get<boolean>("ready"),
        ]);

        return {
            isAlive: aliveResponse.data,
            isReady: readyResponse.data,
        };
    },
};

export default apiService;

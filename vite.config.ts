import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
/// <reference types="@batijs/core/types" />

import vike from "vike/plugin";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [vike(), tailwindcss(), vue()],
        server: {
            proxy: {
                "/api": {
                    target: env.VITE_PROXY_TARGET,
                    changeOrigin: true,
                },
            },
        },
    };
});

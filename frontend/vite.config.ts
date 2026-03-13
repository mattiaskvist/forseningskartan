import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
    },
    server: {
        port: 8080,
        proxy: {
            "/sl": {
                target: "https://transport.integration.sl.se/v1",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/sl/, ""),
            },
        },
    },
    build: {
        sourcemap: true,
        minify: false,
    },
});

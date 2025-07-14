import dts from "vite-plugin-dts";
import path from "path";
import { defineConfig, UserConfig } from "vite";

export default defineConfig({
    base: "/src",
    plugins: [dts({ rollupTypes: true })],
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "lib",
            formats: ["es", "cjs"],
            fileName: (format) => `${format}/index.js`,
        },
        rollupOptions: {
            external: ['chart.js', 'canvas'],
        },
    },
} satisfies UserConfig);
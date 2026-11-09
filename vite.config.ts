import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The sandboxed Godot iframe fetches WASM and the game pack with an opaque origin.
const runtimeCors = () => ({
  name: "godot-runtime-cors",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use("/runtime", allowRuntime);
  },
  configurePreviewServer(server: import("vite").PreviewServer) {
    server.middlewares.use("/runtime", allowRuntime);
  },
});
const allowRuntime: import("vite").Connect.NextHandleFunction = (
  _req,
  res,
  next,
) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
};
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            /node_modules\/(@codemirror|@lezer|style-mod|w3c-keyname|crelt)\//.test(
              id,
            )
          )
            return "code-editor";
        },
      },
    },
  },
  plugins: [react(), runtimeCors()],
  server: { host: "127.0.0.1", port: 4175, strictPort: true },
  preview: { host: "127.0.0.1", port: 4175, strictPort: true },
});

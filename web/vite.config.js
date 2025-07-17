import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig(({ mode }) => {
  const rootPath = resolve(__dirname, "../")
  const env = loadEnv(mode, rootPath, "")
  const proxyTarget = env.NODE_ENV === "production" ? env.PROD_BACKEND_URL : env.LOCAL_BACKEND_URL

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    define: {
      "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
      "import.meta.env.LOCAL_BACKEND_URL": JSON.stringify(env.LOCAL_BACKEND_URL),
      "import.meta.env.PROD_BACKEND_URL": JSON.stringify(env.PROD_BACKEND_URL),
    },
  }
})

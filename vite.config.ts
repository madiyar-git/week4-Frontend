import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const devTarget = env.DEV_TARGET_URL;
  const prodTarget = env.PROD_TARGET_URL;
  return {
    plugins: [
      vue(),
      vueDevTools(),
      visualizer({
        filename: 'stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: devTarget, changeOrigin: true }
      }
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: prodTarget, changeOrigin: true }
      }
    }
  };
});

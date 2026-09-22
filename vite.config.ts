import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { visualizer } from 'rollup-plugin-visualizer';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        resolvers: [NaiveUiResolver()],
        dts: 'src/components.d.ts'
      }),
      env.ANALYZE === 'true' &&
        visualizer({
          filename: 'stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/naive-ui')) {
              return 'vendor-naive-ui';
            }
            if (id.includes('node_modules/lodash-es') || id.includes('node_modules/date-fns')) {
              return 'vendor-utils';
            }
            if (
              id.includes('node_modules/vue') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/vue-router')
            ) {
              return 'vendor-vue';
            }
          }
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: env.TARGET_URL, changeOrigin: true }
      }
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: env.TARGET_URL, changeOrigin: true }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/__tests__/setup.ts'
    }
  };
});

import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfigFn from './vite.config';

export default defineConfig((configEnv) => {
  const resolvedViteConfig =
    typeof viteConfigFn === 'function' ? viteConfigFn(configEnv) : viteConfigFn;

  return mergeConfig(
    resolvedViteConfig,
    defineConfig({
      test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url))
      }
    })
  );
});

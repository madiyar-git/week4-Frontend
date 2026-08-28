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
        exclude: [...configDefaults.exclude, 'e2e/**', '**/dist/**'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html', 'json'],
          exclude: [
            'src/main.ts',
            'src/env.d.ts',
            'src/**/*.d.ts',
            'src/types/**',
            'src/api/client.ts',
            '**/*.config.*'
          ],
          thresholds: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70
          }
        }
      }
    })
  );
});

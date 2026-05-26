import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import Sitemap from 'vite-plugin-sitemap';
import viteCompression from 'vite-plugin-compression';
import {
  DEV_API_ORIGIN,
  PROD_API_ORIGIN,
  PROD_SITE_URL,
} from './src/config/urls';

function collectConnectSrcOrigins(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '');
  const origins = new Set<string>();
  const add = (raw: string | undefined) => {
    if (!raw?.trim()) return;
    try {
      origins.add(new URL(raw.trim()).origin);
    } catch {
      /* ignore invalid URL */
    }
  };
  add(DEV_API_ORIGIN);
  add('http://localhost:4100');
  add(PROD_API_ORIGIN);
  add(env.VITE_API_URL);
  const ws = env.VITE_WS_URL?.trim();
  if (ws) {
    try {
      const normalized = ws.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:');
      add(normalized);
    } catch {
      /* ignore */
    }
  }
  return [...origins].join(' ');
}

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), '');
  const connectSrc = `'self' ws: wss: ${collectConnectSrcOrigins(mode)}`;
  const apiProxyTarget =
    loadedEnv.VITE_DEV_API_PROXY_TARGET?.trim() || 'http://127.0.0.1:4100';
  const precompressEnabled =
    loadedEnv.VITE_PRECOMPRESS !== 'false' &&
    mode !== 'development' &&
    mode !== 'analyze';

  return {
    plugins: [
      react(),
      tailwindcss(),
      mode === 'analyze' &&
        visualizer({
          filename: 'dist/stats.html',
          projectRoot: path.resolve(__dirname),
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          open: process.env.CI !== 'true',
          title: 'Faber Companii — bundle',
        }),
      precompressEnabled &&
        viteCompression({
          algorithm: 'gzip',
          threshold: 256,
          verbose: false,
        }),
      precompressEnabled &&
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 256,
          verbose: false,
        }),
      Sitemap({
        hostname: PROD_SITE_URL,
        dynamicRoutes: [
          '/',
          '/companii',
          '/companies',
          '/login',
          '/register',
        ],
        robots: [{ userAgent: '*', allow: '/' }],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5174,
      host: '0.0.0.0',
      watch: {
        usePolling: loadedEnv.VITE_USE_POLLING === 'true',
        interval: loadedEnv.VITE_USE_POLLING === 'true' ? 300 : undefined,
      },
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: http: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src ${connectSrc}; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';`,
      },
    },
    preview: {
      port: 5174,
      host: '0.0.0.0',
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      ...(mode !== 'development' && {
        esbuild: { drop: ['console', 'debugger'] },
      }),
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'query-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-query-devtools',
            ],
            'table-vendor': ['@tanstack/react-table'],
            'motion-vendor': ['framer-motion'],
            icons: ['lucide-react'],
            i18n: ['i18next', 'react-i18next'],
            'ui-primitives': [
              '@radix-ui/react-label',
              '@radix-ui/react-slot',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});

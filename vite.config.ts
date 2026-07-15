import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Detect whether we are running inside Replit. Outside Replit the
// @replit/* vite plugins try to talk to a parent Replit window that
// does not exist, and `PORT` / `BASE_PATH` are not injected by the
// platform, so we default them and skip Replit-only plugins.
const isReplit = process.env["REPL_ID"] !== undefined;

const rawPort = process.env["PORT"] ?? "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env["BASE_PATH"] ?? "/";

const plugins: any[] = [
  react(),
  tailwindcss(),
];

if (isReplit) {
  plugins.push(runtimeErrorOverlay());
}

if (isReplit && process.env["NODE_ENV"] !== "production") {
  plugins.push(
    await import('@replit/vite-plugin-cartographer').then((m) =>
      m.cartographer({
        root: path.resolve(import.meta.dirname, '..'),
      }),
    ),
    await import('@replit/vite-plugin-dev-banner').then((m) =>
      m.devBanner(),
    ),
  );
}

export default defineConfig({
  base: basePath,
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split Monaco and the Lab UI into their own chunk so the
        // homepage bundle stays small (Monaco is ~1 MB minified).
        manualChunks(id) {
          if (id.includes('node_modules/monaco-editor')) return 'monaco';
          if (id.includes('node_modules/@monaco-editor/react')) return 'monaco';
          if (id.includes('/lib/lab/') || id.includes('/components/lab/') || id.includes('/pages/Lab')) return 'lab';
          return undefined as any;
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

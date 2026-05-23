import { defineConfig } from 'vite';
import type { Connect } from 'vite';

// Map clean paths to .html files
const pages = ['index', 'auth', 'paints', 'mix', 'preview', 'recipes', 'presets', 'color-wheel'];

function spaFallback(): Connect.NextHandleFunction {
  return (req, _res, next) => {
    const path = req.url?.split('?')[0] || '/';
    const name = path === '/' ? 'index' : path.replace(/^\//, '');
    if (pages.includes(name)) {
      req.url = '/' + name + '.html' + (req.url?.includes('?') ? '?' + req.url.split('?')[1] : '');
    }
    next();
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [{ name: 'clean-urls', configureServer(server) { server.middlewares.use(spaFallback()); } }],
  server: {
    port: 5175,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, p + '.html'])),
    },
  },
});

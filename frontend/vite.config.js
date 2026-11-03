import { defineConfig } from 'vite';
export default defineConfig({ server: { proxy: { '/idea/': { target: 'http://localhost:5080', changeOrigin: true }, '/producto': { target: 'http://localhost:5080', changeOrigin: true }, '/api': { target: 'http://localhost:5080', changeOrigin: true } } } });

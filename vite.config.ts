import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ base: './', plugins: [react(), tailwindcss()], server: { host: '127.0.0.1', port: 1438, strictPort: true }, clearScreen: false });

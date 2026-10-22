/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Separa bibliotecas e conteúdo estático em chunks próprios (cache estável entre versões).
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/ },
            { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|@reduxjs|immer|reselect|redux)[\\/]/ },
            // Mapa e dados dos estados (aba Viagens) antes do resto do conteúdo, para nenhum chunk passar de 500 kB.
            { name: 'brazil', test: /src[\\/]data[\\/](brazilMap|states|visitKinds)\.ts/ },
            { name: 'content', test: /src[\\/]data[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

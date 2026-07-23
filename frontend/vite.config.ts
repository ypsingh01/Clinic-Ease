import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router)/ },
            { name: 'motion', test: /node_modules[\\/]framer-motion/ },
            { name: 'charts', test: /node_modules[\\/]recharts/ },
            { name: 'icons', test: /node_modules[\\/]@tabler[\\/]icons-react/ },
          ],
        },
      },
    },
  },
})

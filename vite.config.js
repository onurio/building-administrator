import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        // Let Vite handle Firebase and other large dependencies internally
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/system'],
          'mui-legacy': ['@material-ui/core', '@material-ui/icons', '@material-ui/lab'],
          router: ['react-router', 'react-router-dom']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  envPrefix: 'VITE_'
})
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import componentTagger from './plugins/component-tagger';

export default defineConfig({
  plugins: [react(), componentTagger()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Split wagmi/viem separately from RainbowKit
          if (id.includes('node_modules/wagmi') || id.includes('node_modules/viem')) {
            return 'wagmi-vendor';
          }
          if (id.includes('node_modules/@rainbow-me')) {
            return 'rainbowkit-vendor';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/canvas-confetti')) {
            return 'animation-vendor';
          }
          // UI component library
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Query and form libraries
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) {
            return 'data-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    hmr: {
      overlay: false,
      timeout: 15000,
    },
    watch: {
      // Use polling instead of native file system events (more reliable for some environments)
      usePolling: true,
      // Wait 500ms before triggering a rebuild (gives time for all files to be flushed)
      interval: 500,
      // Additional delay between file change detection and reload
      binaryInterval: 500,
    },
  },
});

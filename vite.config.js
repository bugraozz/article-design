import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']
        
      ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React ve React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // TipTap editör kütüphaneleri
            if (id.includes('@tiptap')) {
              return 'tiptap';
            }
            // Matematik kütüphaneleri
            if (id.includes('katex') || id.includes('mathjs')) {
              return 'math';
            }
            // PDF ve Export kütüphaneleri
            if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('html2pdf')) {
              return 'export';
            }
            // UI ve ikon kütüphaneleri
            if (id.includes('lucide-react')) {
              return 'ui';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB'a çıkar (opsiyonel)
  },
})

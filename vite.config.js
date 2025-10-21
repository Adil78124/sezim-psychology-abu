import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/psychology/', // ← Для GitHub Pages (название репозитория)
  server: {
    port: 3000,
    // Proxy API requests to local backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Если локальный backend не запущен - ошибка будет понятной
        onError: (err, req, res) => {
          console.error('Proxy error:', err.message);
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ 
            error: 'Локальный backend не запущен. Запустите: cd backend && npm start',
            details: err.message 
          }));
        }
      }
    }
  }
})

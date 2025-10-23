import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Убираем base для Vercel
  server: {
    port: 3000,
    open: true, // Автоматически открывать браузер
    // Proxy API requests to production backend
    proxy: {
      '/api': {
        target: 'https://sezim.abu.edu.kz',
        changeOrigin: true,
        secure: true,
        // Если production backend недоступен - показываем понятную ошибку
        onError: (err, req, res) => {
          console.error('Proxy error:', err.message);
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({
            error: 'Backend сервер недоступен. Проверьте настройки сервера.',
            details: err.message
          }));
        }
      }
    }
  }
})

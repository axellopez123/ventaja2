import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,   // esto permite acceso desde otras máquinas en la red
    port: 5173    // puedes cambiar el puerto si quieres
  }
})

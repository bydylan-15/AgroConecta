import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AgroConecta RD',
        short_name: 'AgroConecta',
        description: 'Plataforma inteligente de conexión agrocomercial en República Dominicana',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
});

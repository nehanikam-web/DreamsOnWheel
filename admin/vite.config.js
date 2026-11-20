import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin panel runs on its own port so it stays separate from the customer website (5173).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true, open: true },
});

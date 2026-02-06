import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    base: './',
    server: {

        host: '0.0.0.0',
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        open: false,
        allowedHosts: ['grocery-projection-app-1.onrender.com', '.onrender.com']
    },

    preview: {
        host: '0.0.0.0',
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000
    }
});


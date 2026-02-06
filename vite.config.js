import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    server: {
        host: '0.0.0.0',
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        open: false
    },
    preview: {
        host: '0.0.0.0',
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000
    }
});


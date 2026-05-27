import { defineConfig } from 'vite';

export default defineConfig({
    // Relative path ensures assets load correctly under GitHub Pages subdirectories
    base: './',
    build: {
        // Output demo build to demo-dist to separate it from the library dist
        outDir: 'demo-dist',
        emptyOutDir: true
    }
});

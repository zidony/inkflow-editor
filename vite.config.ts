// vite.config.ts

import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        // Auto-generate TypeScript declaration files
        dts({ insertTypesEntry: true }),
    ],
    // Do not copy public/ static assets to dist/ in library mode
    publicDir: false,
    build: {
        // Enable library build mode
        lib: {
            entry: resolve(__dirname, 'src/index.ts'), // Entry point for the library
            name: 'InkflowEditor', // Global variable name (for UMD format)
            fileName: (format) => `inkflow-editor.${format}.js` // Output file name
        },
        rollupOptions: {
            // Externalize dependencies: keep it empty since it's a zero-dependency project.
            // If third-party packages are introduced in the future but shouldn't be bundled, list them here.
            external: [],
            output: {
                // Rename the default style.css output by Vite
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'inkflow-editor.css';
                    return assetInfo.name || '';
                },
            }
        }
    }
});
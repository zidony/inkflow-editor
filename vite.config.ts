import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
    const isEmojiBuild = mode === 'emoji';

    return {
        plugins: isEmojiBuild ? [] : [dts({ insertTypesEntry: true })],
        publicDir: false,
        build: {
            emptyOutDir: !isEmojiBuild,
            lib: {
                entry: resolve(__dirname, isEmojiBuild ? 'src/emoji.ts' : 'src/index.ts'),
                name: isEmojiBuild ? 'InkflowEditorEmoji' : 'InkflowEditor',
                fileName: format =>
                    `${isEmojiBuild ? 'inkflow-editor-emoji' : 'inkflow-editor'}.${format}.js`
            },
            rollupOptions: {
                external: [],
                output: {
                    assetFileNames: assetInfo => {
                        if (assetInfo.name === 'style.css') return 'inkflow-editor.css';
                        return assetInfo.name || '';
                    }
                }
            }
        }
    };
});

// vite.config.ts

import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        // 自动生成 TypeScript 声明文件
        dts({ insertTypesEntry: true }),
    ],
    // 库模式下不要把 public/ 的静态资源复制到 dist/ 里
    publicDir: false,
    build: {
        // 开启库编译模式
        lib: {
            entry: resolve(__dirname, 'src/index.ts'), // 指定刚建的入口文件
            name: 'InkflowEditor', // 全局变量名 (针对 UMD 格式)
            fileName: (format) => `inkflow-editor.${format}.js` // 输出文件名
        },
        rollupOptions: {
            // 外部化依赖：因为我们坚持了零依赖，所以这里保持为空即可。
            // 如果未来引入了第三方包但不希望打包进去，就写在这里。
            external: [],
            output: {
                // 如果你的组件有 CSS，Vite 默认会打包出 style.css
                // 这里我们可以重命名一下输出的 CSS 文件名
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'inkflow-editor.css';
                    return assetInfo.name || '';
                },
            }
        }
    }
});
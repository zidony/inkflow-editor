import { defineConfig } from 'vite';

export default defineConfig({
    // 相对路径，确保在 github pages 的子目录下能正确加载资源
    base: './',
    build: {
        // 将演示页面打包到 demo-dist 目录，与组件库的 dist 区分开
        outDir: 'demo-dist',
        emptyOutDir: true
    }
});

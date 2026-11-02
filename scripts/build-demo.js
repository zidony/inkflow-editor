import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.resolve(rootDir, 'dist');
const demoDir = path.resolve(rootDir, 'demo');
const outDir = path.resolve(rootDir, 'demo-dist');

function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('[build-demo] Packaging standalone demo distribution for GitHub Pages...');

// 1. 确保 demo-dist 目录干净
if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 2. 将编译产物 dist/ 整体拷贝到 demo-dist/dist/
if (!fs.existsSync(distDir)) {
    throw new Error('dist/ directory does not exist! Please run "npm run build" first.');
}
copyDirSync(distDir, path.join(outDir, 'dist'));
console.log('✓ Copied dist/ (including local emoji SVGs) to demo-dist/dist/');

// 3. 将 demo/*.html 复制到 demo-dist 根目录，并将 ../dist/ 调整为 ./dist/
const htmlFiles = ['index.html', 'index.zh-CN.html'];
for (const file of htmlFiles) {
    const srcFile = path.join(demoDir, file);
    if (!fs.existsSync(srcFile)) continue;

    let content = fs.readFileSync(srcFile, 'utf8');
    // 将 ../dist/ 替换为 ./dist/
    content = content.replace(/\.\.\/dist\//g, './dist/');

    fs.writeFileSync(path.join(outDir, file), content, 'utf8');
    console.log(`✓ Generated demo-dist/${file}`);
}

// 4. 同时将 demo/ 目录原样拷贝一份到 demo-dist/demo/，确保通过 /demo/index.html 访问也完全兼容
copyDirSync(demoDir, path.join(outDir, 'demo'));
console.log('✓ Copied demo/ subfolder for full URL compatibility.');

console.log('[build-demo] Successfully prepared demo-dist for GitHub Pages.');


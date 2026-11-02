import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const expectedFiles = new Set([
    'emoji.d.ts',
    'index.d.ts',
    'inkflow-editor-emoji.css',
    'inkflow-editor-emoji.es.js',
    'inkflow-editor-emoji.umd.js',
    'inkflow-editor.css',
    'inkflow-editor.es.js',
    'inkflow-editor.umd.js'
]);

function fail(message) {
    console.error(`[check-dist] ${message}`);
    process.exitCode = 1;
}

if (!fs.existsSync(distDir)) {
    fail('dist folder was not found. Run npm run build first.');
} else {
    const entries = fs.readdirSync(distDir, { withFileTypes: true });
    const fileNames = entries.filter(entry => entry.isFile()).map(entry => entry.name);
    const directoryNames = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

    for (const directoryName of directoryNames) {
        if (directoryName !== 'emoji') {
            fail(`Unexpected directory in dist: ${directoryName}`);
        }
    }

    const emojiSvgDir = path.join(distDir, 'emoji', 'svg');
    if (!fs.existsSync(emojiSvgDir)) {
        fail('Missing dist/emoji/svg directory.');
    } else {
        const svgCount = fs.readdirSync(emojiSvgDir).length;
        if (svgCount < 300) {
            fail(`Expected at least 300 SVG assets in dist/emoji/svg, found: ${svgCount}`);
        }
    }

    for (const expectedFile of expectedFiles) {
        if (!fileNames.includes(expectedFile)) {
            fail(`Missing dist file: ${expectedFile}`);
        }
    }

    for (const fileName of fileNames) {
        if (!expectedFiles.has(fileName)) {
            fail(`Unexpected dist file: ${fileName}`);
        }
    }

    const indexTypesPath = path.join(distDir, 'index.d.ts');
    const emojiTypesPath = path.join(distDir, 'emoji.d.ts');
    const indexTypes = fs.existsSync(indexTypesPath) ? fs.readFileSync(indexTypesPath, 'utf8') : '';
    const emojiTypes = fs.existsSync(emojiTypesPath) ? fs.readFileSync(emojiTypesPath, 'utf8') : '';

    if (indexTypes.includes('any[]')) {
        fail('Public index.d.ts must not expose any[] event arguments.');
    }

    if (!indexTypes.includes('unknown[]')) {
        fail('Public index.d.ts should expose unknown[] event arguments.');
    }

    if (!indexTypes.includes('saveHistoryNow(): void;')) {
        fail('Public index.d.ts should expose saveHistoryNow().');
    }

    if (!indexTypes.includes("export type ToolbarMode = 'full' | 'basic';")) {
        fail('Public index.d.ts should expose ToolbarMode.');
    }

    if (!indexTypes.includes('toolbarMode?: ToolbarMode;')) {
        fail('Public index.d.ts should expose toolbarMode.');
    }

    if (!emojiTypes.includes("from './index'")) {
        fail('emoji.d.ts should reference the public index types.');
    }

    // Verify emoji UMD bundle does NOT inline massive base64 SVG images
    const emojiUmdPath = path.join(distDir, 'inkflow-editor-emoji.umd.js');
    if (fs.existsSync(emojiUmdPath)) {
        const content = fs.readFileSync(emojiUmdPath, 'utf8');
        if (content.includes('data:image/svg+xml')) {
            fail('inkflow-editor-emoji.umd.js should not inline data:image/svg+xml assets.');
        }
        if (content.length > 100 * 1024) {
            fail(`inkflow-editor-emoji.umd.js size (${Math.round(content.length / 1024)}KB) exceeds expected 100KB limit.`);
        }
    }
}

if (!process.exitCode) {
    console.log('[check-dist] dist output looks good.');
}

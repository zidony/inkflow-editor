import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Read package.json using fs
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));

const version = packageJson.version;
const packageName = `inkflow-editor-v${version}`;
const distDir = path.join(process.cwd(), 'dist');
const demoDir = path.join(process.cwd(), 'demo');
const outputDir = path.join(process.cwd(), 'releases');
const outputFile = path.join(outputDir, `${packageName}.zip`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create a new zip file
const zip = new AdmZip();

// Add specific files from dist folder (excluding types and src)
if (fs.existsSync(distDir)) {
    const files = ['inkflow-editor.css', 'inkflow-editor.umd.js', 'inkflow-editor.es.js'];
    files.forEach(file => {
        const filePath = path.join(distDir, file);
        if (fs.existsSync(filePath)) {
            zip.addLocalFile(filePath, `${packageName}/dist`);
        }
    });
} else {
    console.error('❌ dist folder not found. Did you run npm run build?');
    process.exit(1);
}

// Add the demo folder
if (fs.existsSync(demoDir)) {
    zip.addLocalFolder(demoDir, `${packageName}/demo`);
}

// Add README files
try {
    zip.addLocalFile(path.join(process.cwd(), 'README.md'), packageName);
    zip.addLocalFile(path.join(process.cwd(), 'README.zh-CN.md'), packageName);
} catch (e) {
    console.warn('Warning: README files not found');
}

// Add LICENSE if exists
try {
    const licensePath = path.join(process.cwd(), 'LICENSE');
    if (fs.existsSync(licensePath)) {
        zip.addLocalFile(licensePath, packageName);
    }
} catch (e) {}

// Write the zip to disk
zip.writeZip(outputFile);

console.log(`\n✅ Successfully created release package!`);
console.log(`📦 File: releases/${packageName}.zip\n`);

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;
const packageName = `inkflow-editor-v${version}`;
const outputDir = path.join(process.cwd(), 'releases');
const outputFile = path.join(outputDir, `${packageName}.zip`);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Basic CRC32 table for ZIP checksums
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
}

function crc32(buffer) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

const filesToAdd = [];

function addFile(filePath, zipPath) {
    if (fs.existsSync(filePath)) {
        filesToAdd.push({
            name: zipPath.replace(/\\/g, '/'),
            content: fs.readFileSync(filePath)
        });
    }
}

function addDirectory(dirPath, zipPathPrefix) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const zipPath = zipPathPrefix ? `${zipPathPrefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            addDirectory(fullPath, zipPath);
        } else {
            addFile(fullPath, zipPath);
        }
    }
}

// Add dist files
const distDir = path.join(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
    ['inkflow-editor.css', 'inkflow-editor.umd.js', 'inkflow-editor.es.js'].forEach(file => {
        addFile(path.join(distDir, file), `${packageName}/dist/${file}`);
    });
} else {
    console.error('❌ dist folder not found. Did you run npm run build?');
    process.exit(1);
}

// Add demo dir
addDirectory(path.join(process.cwd(), 'demo'), `${packageName}/demo`);

// Add documentation
['README.md', 'README.zh-CN.md', 'LICENSE'].forEach(file => {
    addFile(path.join(process.cwd(), file), `${packageName}/${file}`);
});

// ZIP Structure generation
let offset = 0;
const centralDirectory = [];
const localFiles = [];

for (const file of filesToAdd) {
    const isCompressed = true;
    const rawData = file.content;
    const compressedData = isCompressed ? zlib.deflateRawSync(rawData) : rawData;
    const crc = crc32(rawData);
    
    const nameBuf = Buffer.from(file.name, 'utf8');
    
    // Local File Header
    const lfh = Buffer.alloc(30 + nameBuf.length);
    lfh.writeUInt32LE(0x04034B50, 0); // Signature
    lfh.writeUInt16LE(20, 4); // Version needed
    lfh.writeUInt16LE(1 << 11, 6); // General purpose bit flag (UTF8)
    lfh.writeUInt16LE(isCompressed ? 8 : 0, 8); // Compression method
    // Time/Date: Dummy time
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    lfh.writeUInt16LE(time, 10);
    lfh.writeUInt16LE(date, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressedData.length, 18);
    lfh.writeUInt32LE(rawData.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28); // Extra field length
    nameBuf.copy(lfh, 30);
    
    localFiles.push(lfh, compressedData);
    
    // Central Directory Record
    const cdh = Buffer.alloc(46 + nameBuf.length);
    cdh.writeUInt32LE(0x02014B50, 0); // Signature
    cdh.writeUInt16LE(20, 4); // Version made by
    cdh.writeUInt16LE(20, 6); // Version needed
    cdh.writeUInt16LE(1 << 11, 8); // Flag (UTF8)
    cdh.writeUInt16LE(isCompressed ? 8 : 0, 10); // Compression method
    cdh.writeUInt16LE(time, 12);
    cdh.writeUInt16LE(date, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressedData.length, 20);
    cdh.writeUInt32LE(rawData.length, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30); // Extra field length
    cdh.writeUInt16LE(0, 32); // File comment length
    cdh.writeUInt16LE(0, 34); // Disk number
    cdh.writeUInt16LE(0, 36); // Internal file attributes
    cdh.writeUInt32LE(0, 38); // External file attributes
    cdh.writeUInt32LE(offset, 42); // Local file header offset
    nameBuf.copy(cdh, 46);
    
    centralDirectory.push(cdh);
    offset += lfh.length + compressedData.length;
}

const cdBuffer = Buffer.concat(centralDirectory);

// End of Central Directory Record
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054B50, 0); // Signature
eocd.writeUInt16LE(0, 4); // Number of this disk
eocd.writeUInt16LE(0, 6); // Disk where CD starts
eocd.writeUInt16LE(filesToAdd.length, 8); // Number of CD records on this disk
eocd.writeUInt16LE(filesToAdd.length, 10); // Total number of CD records
eocd.writeUInt32LE(cdBuffer.length, 12); // Size of central directory
eocd.writeUInt32LE(offset, 16); // Offset of start of CD
eocd.writeUInt16LE(0, 20); // Comment length

const finalZipBuffer = Buffer.concat([...localFiles, cdBuffer, eocd]);
fs.writeFileSync(outputFile, finalZipBuffer);

console.log(`\n✅ Successfully created ZERO-DEPENDENCY release package!`);
console.log(`📦 File: releases/${packageName}.zip\n`);

# Inkflow Editor

**🇬🇧 English Documentation** | [🇨🇳 中文文档](README.zh-CN.md)

Inkflow Editor is a lightweight, high-performance, and commercial-grade WYSIWYG rich text editor built with pure Vanilla JavaScript (TypeScript). It relies on zero external dependencies and is designed for modern web applications.

**[🚀 Live Demo](https://zidony.github.io/inkflow-editor/)**

## ✨ Features

- **Zero Dependencies**: Pure Vanilla JS, extremely lightweight (`< 30KB` gzipped).
- **Modern Engineering Architecture (SPA Safe)**: Built on a robust Pub/Sub `EventEmitter` for elegant hooks. Memory-safe design detaches all global `window`/`document` listeners upon `destroy()`.
- **Caret Selection Preservation**: Temporary DOM Bookmarking preserves exact cursor/caret position on Undo and Redo actions seamlessly.
- **Bottom Status Bar**: Dedicated status bar reporting word/character metrics, current mode, and dynamic flash badges ("Saved", "Undo", "Redo").
- **Design System Ready**: Fully powered by CSS variables. Supports **`sm` / `md` / `lg`** scale adjustments for menu and relative-em icons seamlessly.
- **Notion-Style Uploads**: Intercepts `Ctrl+V` and Drag & Drop to automatically render pulsing skeleton loaders while uploading.
- **Image Drag-to-Resize**: Professional-grade, non-intrusive handlings for image selection and seamless dragging to resize.
- **Efficient Markdown Shortcuts**: Instantly converts `**bold**`, `*italic*`, and `` `code` `` on the fly. Added block support for **ordered lists (`1. `)**, **horizontal dividers (`---`)**, and **code blocks (`` ``` ``)**.
- **Memory Optimized**: Smart History Stack with dynamic byte-size capping prevents browser OOM on massive documents.
- **Accessibility (A11y)**: WCAG 2.1 compliant with native ARIA tags and keyboard support.

## 📦 Installation

Since it has zero dependencies, you can simply use the compiled UMD or ES module versions directly in your project.

```html
<!-- Import CSS -->
<link rel="stylesheet" href="path/to/inkflow-editor.css" />

<!-- Import JS -->
<script src="path/to/inkflow-editor.umd.js"></script>
```

## 🚀 Quick Start

```html
<div id="editor-container"></div>

<script>
    const editor = new InkflowEditor({
        container: '#editor-container',
        lang: 'en-US',
        placeholder: 'Start writing your amazing content here...'
    });

    // Listen to lifecycle events
    editor.on('ready', () => {
        console.log('Editor is ready!');
    });

    editor.on('change', html => {
        console.log('Content changed:', html);
    });
</script>
```

## 🎨 Theming & Dark Mode

Inkflow uses CSS variables. To change the primary color or build a dark theme, simply override the root variables in your own CSS:

```css
:root {
    /* Override Primary Color */
    --inkflow-primary: #10b981;
    --inkflow-primary-light: #d1fae5;
}

/* Dark Mode Example */
@media (prefers-color-scheme: dark) {
    :root {
        --inkflow-bg-main: #1f2937;
        --inkflow-text-main: #f9fafb;
        --inkflow-bg-toolbar: #111827;
        --inkflow-border: #374151;
    }
}
```

## 📖 API Reference

### Constructor Options

```typescript
const editor = new InkflowEditor({
    container: '#editor', // String selector or HTMLElement
    lang: 'en-US', // 'en-US' or 'zh-CN'
    placeholder: 'Type...', // Empty state text
    height: '500px', // Optional fixed height
    size: 'md', // Size variant: 'sm' (small menu and icons), 'md' (medium, default), 'lg' (large)
    theme: inkflowTheme // Optional custom theme classes
});
```

### Public Methods

- `editor.getHTML()`: Returns the rich text HTML string.
- `editor.getText()`: Returns the plain text content.
- `editor.setHTML(html)`: Replaces the editor's content programmatically.
- `editor.destroy()`: Cleans up the DOM and event listeners.

### Events

- `editor.on('ready', (editor) => {})`
- `editor.on('change', (html) => {})`
- `editor.on('focus', () => {})`
- `editor.on('blur', () => {})`

## 💻 Browser Support

Supports all modern browsers (Chrome, Edge, Firefox, Safari). Internet Explorer is NOT supported.

## 🛠️ Build from Source

```bash
npm install
npm run build
```

## 📄 License

MIT License

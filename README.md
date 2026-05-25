# Inkflow Editor

[🇨🇳 中文文档](README.zh-CN.md) | 🇬🇧 English Documentation

Inkflow Editor is a lightweight, high-performance, and commercial-grade WYSIWYG rich text editor built with pure Vanilla JavaScript (TypeScript). It relies on zero external dependencies and is designed for modern web applications.

## ✨ Features

- **Zero Dependencies**: Pure Vanilla JS, extremely lightweight (`< 30KB` gzipped).
- **World-Class Architecture**: Built on a robust Pub/Sub `EventEmitter` for elegant lifecycle hooks.
- **Design System Ready**: Fully powered by CSS Custom Properties (Variables), making Dark Mode and brand theming a 1-line CSS override.
- **Accessibility (A11y)**: WCAG 2.1 compliant with native ARIA tags and keyboard support.
- **Extensible i18n**: Inject any language dictionary on the fly.
- **Memory Optimized**: Smart History Manager with dynamic byte-size capping prevents browser OOM on massive documents.
- **Markdown Shortcuts**: Type markdown syntax (like `# ` or `*`) to automatically format text.

## 📦 Installation

Since it has zero dependencies, you can simply use the compiled UMD or ES module versions directly in your project.

```html
<!-- Import CSS -->
<link rel="stylesheet" href="path/to/inkflow-editor.css">

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

  editor.on('change', (html) => {
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

## 🛠️ Build from Source

```bash
npm install
npm run build
```

## 📄 License

MIT License
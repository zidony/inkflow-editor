# Inkflow Editor

**English** | [简体中文](README.zh-CN.md)

Inkflow Editor is a lightweight rich text editor built with vanilla TypeScript. It provides a visual editing surface, a configurable toolbar, basic Markdown shortcuts, image upload hooks, source editing, and a small public API for use in modern web applications.

[Live Demo](https://zidony.github.io/inkflow-editor/)

## Project Status

Inkflow Editor is under active development. It is suitable for lightweight editing use cases such as forms, comments, notes, and simple CMS fields.

For complex editing requirements such as collaborative editing, advanced table workflows, strict document schemas, block-based documents, or plugin ecosystems, a model-driven editor framework may be a better fit.

## Features

- Vanilla TypeScript implementation with no runtime framework dependency.
- Visual WYSIWYG editing based on `contenteditable`.
- Configurable toolbar with formatting, alignment, lists, links, media, tables, source mode, fullscreen mode, and optional emoji.
- Basic Markdown shortcuts for inline formatting, headings, blockquotes, lists, dividers, and code blocks.
- Undo and redo history with caret restoration.
- Paste sanitization and URL validation for common editing flows.
- Image upload hooks for pasted or dropped image files.
- Click-to-select image resizing.
- Source code mode for editing sanitized HTML.
- English and Simplified Chinese locale support.
- Theme customization through CSS variables and class mappings.

## Install

```bash
npm install inkflow-editor
```

```ts
import { InkflowEditor } from 'inkflow-editor';
import 'inkflow-editor/style.css';

const editor = new InkflowEditor({
    container: '#editor',
    lang: 'en-US',
    placeholder: 'Start writing...'
});
```

You can also use the UMD build in a plain HTML page:

```html
<link rel="stylesheet" href="dist/inkflow-editor.css" />

<div id="editor"></div>

<script src="dist/inkflow-editor.umd.js"></script>
<script>
    const { InkflowEditor } = window.InkflowEditor;

    const editor = new InkflowEditor({
        container: '#editor',
        lang: 'en-US'
    });
</script>
```

## Optional Emoji Extension

Emoji support is shipped as an optional entry so the main editor bundle stays small. Import it only when the emoji picker is needed:

```ts
import { InkflowEditor } from 'inkflow-editor';
import { emojiExtension } from 'inkflow-editor/emoji';
import 'inkflow-editor/style.css';

const editor = new InkflowEditor({
    container: '#editor',
    emoji: emojiExtension()
});
```

For plain HTML or PHP-rendered pages, include the emoji UMD file after the core editor:

```html
<link rel="stylesheet" href="dist/inkflow-editor.css" />

<div id="editor"></div>

<script src="dist/inkflow-editor.umd.js"></script>
<script src="dist/inkflow-editor-emoji.umd.js"></script>
<script>
    const { InkflowEditor } = window.InkflowEditor;
    const { emojiExtension } = window.InkflowEditorEmoji;

    const editor = new InkflowEditor({
        container: '#editor',
        emoji: emojiExtension()
    });
</script>
```

## Options

```ts
const editor = new InkflowEditor({
    container: '#editor',
    lang: 'en-US',
    placeholder: 'Start writing...',
    height: '500px',
    size: 'md',
    toolbar: [
        ['heading'],
        ['bold', 'italic', 'underline'],
        ['link', 'image', 'table'],
        ['undo', 'redo']
    ]
});
```

| Option | Type | Description |
| --- | --- | --- |
| `container` | `HTMLElement \| string` | Target element or selector. |
| `theme` | `'inkflow' \| ThemeClasses` | Built-in theme or custom class map. |
| `size` | `'sm' \| 'md' \| 'lg'` | Editor size variant. |
| `toolbar` | `Array<string \| string[]>` | Toolbar layout. |
| `placeholder` | `string` | Placeholder text for an empty editor. |
| `lang` | `'en-US' \| 'zh-CN' \| LocaleDict` | Built-in or custom locale. |
| `height` | `string` | CSS height for the editing area. |
| `emoji` | `EmojiExtension` | Optional emoji picker extension from `inkflow-editor/emoji`. |
| `hooks` | `object` | Async hooks for links, images, uploads, and videos. |

## Hooks

```ts
const editor = new InkflowEditor({
    container: '#editor',
    hooks: {
        onInsertLink: async () => 'https://example.com',
        onInsertImage: async () => 'https://example.com/image.png',
        onInsertVideo: async () => 'https://example.com/video.mp4',
        onUploadImage: async file => {
            // Upload the file and return a public image URL.
            return uploadImage(file);
        }
    }
});
```

## API

```ts
editor.getHTML();
editor.getText();
editor.setHTML('<p>Hello</p>');
editor.destroy();

editor.on('ready', instance => {});
editor.on('change', html => {});
editor.on('focus', () => {});
editor.on('blur', () => {});
```

## Security Notes

Inkflow Editor sanitizes HTML before it enters key editing flows such as initialization, `setHTML`, paste, source mode, and media insertion. It also validates common link and media URL protocols.

Applications should still validate and sanitize content on the server before storing or rendering it. Client-side sanitization is a useful editing safeguard, not a replacement for backend content security.

## Browser Support

Inkflow Editor targets modern browsers: Chrome, Edge, Firefox, and Safari. Internet Explorer is not supported.

The editor currently uses browser editing APIs through a centralized command adapter. This keeps compatibility work localized while the project gradually replaces higher-risk commands with direct DOM and Selection operations.

## Development

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

Run the full local check:

```bash
npm run check
```

## License

MIT

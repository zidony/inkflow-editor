# Inkflow Editor

[English](README.md) | **简体中文**

Inkflow Editor 是一款基于原生 TypeScript 开发的轻量级富文本编辑器。它提供可视化编辑区域、可配置工具栏、基础 Markdown 快捷输入、图片上传 Hook、源码模式，以及适合现代 Web 应用集成的基础 API。

[在线演示](https://zidony.github.io/inkflow-editor/)

## 项目状态

Inkflow Editor 仍在持续开发中。它适合表单、评论、笔记、简单 CMS 字段等轻量富文本编辑场景。

如果你的业务需要协同编辑、复杂表格、严格文档 Schema、块级文档结构或大型插件生态，基于编辑模型的成熟编辑器框架可能更合适。

## 功能

- 基于原生 TypeScript 实现，不依赖运行时前端框架。
- 基于 `contenteditable` 的可视化富文本编辑。
- 可配置工具栏，支持格式、对齐、列表、链接、媒体、表格、源码模式、全屏模式和可选 emoji。
- 基础 Markdown 快捷输入，支持行内格式、标题、引用、列表、分割线和代码块。
- 支持撤销/重做，并尽量恢复光标位置。
- 对常见编辑入口进行 HTML 清洗和 URL 校验。
- 支持粘贴或拖拽图片文件，并通过 Hook 接入上传逻辑。
- 支持点击选择图片并拖拽调整尺寸。
- 支持源码模式，可编辑经过清洗的 HTML。
- 内置英文和简体中文语言包。
- 支持通过 CSS 变量和 class 映射定制主题。

## 安装

```bash
npm install inkflow-editor
```

```ts
import { InkflowEditor } from 'inkflow-editor';
import 'inkflow-editor/style.css';

const editor = new InkflowEditor({
    container: '#editor',
    lang: 'zh-CN',
    placeholder: '开始输入...'
});
```

也可以在普通 HTML 页面中使用 UMD 构建：

```html
<link rel="stylesheet" href="dist/inkflow-editor.css" />

<div id="editor"></div>

<script src="dist/inkflow-editor.umd.js"></script>
<script>
    const { InkflowEditor } = window.InkflowEditor;

    const editor = new InkflowEditor({
        container: '#editor',
        lang: 'zh-CN'
    });
</script>
```

## 可选 Emoji 扩展

Emoji 功能以可选入口发布，这样主编辑器包可以保持较小体积。只有需要 emoji 选择器时再导入：

```ts
import { InkflowEditor } from 'inkflow-editor';
import { emojiExtension } from 'inkflow-editor/emoji';
import 'inkflow-editor/style.css';

const editor = new InkflowEditor({
    container: '#editor',
    emoji: emojiExtension()
});
```

在普通 HTML 或 PHP 渲染页面中，可以在核心编辑器之后引入 emoji UMD 文件：

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

## 配置项

```ts
const editor = new InkflowEditor({
    container: '#editor',
    lang: 'zh-CN',
    placeholder: '开始输入...',
    height: '500px',
    size: 'md',
    toolbarMode: 'basic',
    // 可选自定义布局。提供 toolbar 时会覆盖 toolbarMode。
    toolbar: [
        ['heading'],
        ['bold', 'italic', 'underline'],
        ['link', 'image', 'table'],
        ['undo', 'redo']
    ]
});
```

| 配置项 | 类型 | 说明 |
| --- | --- | --- |
| `container` | `HTMLElement \| string` | 挂载目标元素或选择器。 |
| `theme` | `'inkflow' \| ThemeClasses` | 内置主题或自定义 class 映射。 |
| `size` | `'sm' \| 'md' \| 'lg'` | 编辑器尺寸。 |
| `toolbarMode` | `'full' \| 'basic'` | 未提供 `toolbar` 时使用的内置工具栏显示模式。 |
| `toolbar` | `Array<string \| string[]>` | 工具栏布局。 |
| `placeholder` | `string` | 空内容时的占位提示。 |
| `lang` | `'en-US' \| 'zh-CN' \| LocaleDict` | 内置或自定义语言包。 |
| `height` | `string` | 编辑区域 CSS 高度。 |
| `emoji` | `EmojiExtension` | 来自 `inkflow-editor/emoji` 的可选 emoji 选择器扩展。 |
| `hooks` | `object` | 链接、图片、上传、视频等异步 Hook。 |

`size` 控制编辑器的视觉尺寸，`toolbarMode` 控制内置工具栏显示模式。提供自定义 `toolbar` 时，`toolbar` 始终优先于 `toolbarMode`。

## Hooks

```ts
const editor = new InkflowEditor({
    container: '#editor',
    hooks: {
        onInsertLink: async () => 'https://example.com',
        onInsertImage: async () => 'https://example.com/image.png',
        onInsertVideo: async () => 'https://example.com/video.mp4',
        onUploadImage: async file => {
            // 上传文件，并返回可访问的图片 URL。
            return uploadImage(file);
        }
    }
});
```

## API

```ts
// 内容
editor.getHTML();
editor.getText();
editor.setHTML('<p>Hello</p>');
editor.insertHTML('<strong>插入到光标处</strong>');
editor.clear();
editor.isEmpty();

// 焦点与模式
editor.focus();
editor.blur();
editor.setReadOnly(true);
editor.isReadOnly();

// 历史
editor.undo();
editor.redo();
editor.saveHistoryNow();

// 生命周期
editor.destroy();

// 事件
editor.on('ready', instance => {});
editor.on('change', html => {});
editor.on('focus', () => {});
editor.on('blur', () => {});
```

## 安全说明

Inkflow Editor 会在初始化、`setHTML`、粘贴、源码模式、媒体插入等关键编辑入口对 HTML 进行清洗，并对常见链接和媒体 URL 协议进行校验。

业务系统在保存或渲染内容前，仍应在服务端进行校验和清洗。客户端清洗可以降低编辑过程中的风险，但不能替代后端内容安全策略。

## 浏览器支持

Inkflow Editor 面向现代浏览器：Chrome、Edge、Firefox 和 Safari。不支持 Internet Explorer。

当前编辑器通过统一的命令适配器使用浏览器编辑 API。这样可以把兼容性处理集中起来，并为后续逐步替换高风险命令为 DOM 和 Selection 操作留出空间。

## 开发

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

运行完整本地检查：

```bash
npm run check
```

## 开源协议

MIT

# Inkflow Editor

[🇬🇧 English Documentation](README.md) | **🇨🇳 中文文档**

Inkflow Editor 是一款基于原生 JavaScript (TypeScript) 打造的轻量级、高性能、商业级富文本编辑器。它**零依赖**任何第三方框架，专为现代 Web 应用程序设计。

**[🚀 在线演示 (Live Demo)](https://zidony.github.io/inkflow-editor/)**

## ✨ 核心特性

- **极致轻量 (零依赖)**：纯原生实现，Gzip 压缩后 `< 30KB`。
- **世界级架构**：底层基于 Pub/Sub `EventEmitter`，提供极其优雅的生命周期 Hook API。
- **企业级设计系统**：UI 完全由 CSS Variables 驱动，只需一行 CSS 即可实现品牌色替换或完美对接暗黑模式。
- **无感图片上传管线**：全面拦截 `Ctrl+V` 粘贴与文件拖拽，自动注入跳动的骨架屏动画，体验比肩 Notion。
- **专业级图片缩放**：采用无侵入式浮动遮罩层，完美支持图片点击选中及拖拉手柄无极缩放。
- **行内 Markdown 解析**：无需脱离键盘，在输入空格瞬间自动解析 `**粗体**`、`*斜体*` 及 `` `代码` ``。
- **防 OOM 内存优化**：智能历史记录管理器，基于动态字节容量检测，完美解决大文档导致的内存溢出崩溃。
- **无障碍访问 (A11y)**：严格遵循 WCAG 2.1 标准，提供完善的 ARIA 标签与键盘支持。

## 📦 安装

由于本编辑器零依赖，您可以直接在项目中引入编译后的 UMD 脚本或 ES 模块。

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="path/to/inkflow-editor.css" />

<!-- 引入脚本 -->
<script src="path/to/inkflow-editor.umd.js"></script>
```

## 🚀 快速上手

```html
<div id="editor-container"></div>

<script>
    const editor = new InkflowEditor({
        container: '#editor-container',
        lang: 'zh-CN',
        placeholder: '在这里开始编写精彩的内容...'
    });

    // 监听生命周期事件
    editor.on('ready', () => {
        console.log('编辑器加载完毕！');
    });

    editor.on('change', html => {
        console.log('内容发生变更:', html);
    });
</script>
```

## 🎨 主题与暗黑模式

Inkflow 完全由 CSS 变量驱动。如果想修改品牌主色调或实现暗黑模式，只需在您的项目 CSS 中覆盖这些变量：

```css
:root {
    /* 覆盖品牌主色调 */
    --inkflow-primary: #10b981;
    --inkflow-primary-light: #d1fae5;
}

/* 暗黑模式配置示例 */
@media (prefers-color-scheme: dark) {
    :root {
        --inkflow-bg-main: #1f2937;
        --inkflow-text-main: #f9fafb;
        --inkflow-bg-toolbar: #111827;
        --inkflow-border: #374151;
    }
}
```

## 📖 API 参考文档

### 实例化选项 (Options)

```typescript
const editor = new InkflowEditor({
    container: '#editor', // 选择器字符串或 HTMLElement
    lang: 'zh-CN', // 语言，支持 'zh-CN' 或 'en-US'
    placeholder: '开始输入...', // 占位符提示文字
    height: '500px', // 可选的固定高度
    theme: inkflowTheme // 可选的自定义主题 Class 映射
});
```

### 实例方法 (Methods)

- `editor.getHTML()`: 获取当前富文本的 HTML 字符串。
- `editor.getText()`: 获取纯文本内容。
- `editor.setHTML(html)`: 动态设置编辑器的 HTML 内容。
- `editor.destroy()`: 销毁编辑器实例并清理事件监听。

### 事件回调 (Events)

- `editor.on('ready', (editor) => {})`: 编辑器初始化完毕后触发。
- `editor.on('change', (html) => {})`: 内容发生任何变化时触发。
- `editor.on('focus', () => {})`: 编辑器获得焦点时触发。
- `editor.on('blur', () => {})`: 编辑器失去焦点时触发。

## 💻 浏览器兼容性

全面支持所有现代浏览器（Chrome、Edge、Firefox、Safari 等）。不支持 Internet Explorer (IE)。

## 🛠️ 源码构建

```bash
npm install
npm run build
```

## 📄 开源协议

MIT License

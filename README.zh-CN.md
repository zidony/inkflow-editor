# Inkflow Editor

🇨🇳 中文文档 | [🇬🇧 English Documentation](README.md)

Inkflow Editor 是一款基于原生 JavaScript (TypeScript) 打造的轻量级、高性能、商业级富文本编辑器。它**零依赖**任何第三方框架，专为现代 Web 应用程序设计。

## ✨ 核心特性

- **极致轻量 (零依赖)**：纯原生实现，Gzip 压缩后 `< 30KB`。
- **世界级架构**：底层基于 Pub/Sub `EventEmitter`，提供极其优雅的生命周期 Hook API。
- **企业级设计系统**：UI 完全由 CSS Variables（自定义属性）驱动。只需一行 CSS 即可实现品牌色替换或完美对接暗黑模式。
- **无障碍访问 (A11y)**：严格遵循 WCAG 2.1 标准，提供完善的 ARIA 标签与键盘无障碍支持。
- **灵活的国际化 (i18n)**：除了内置的中英文，支持在初始化时动态注入任何小语种字典对象。
- **防 OOM 内存优化**：智能历史记录管理器 (`HistoryManager`)，基于动态字节容量检测，完美解决千万字大文档导致的浏览器内存溢出崩溃。
- **Markdown 快捷键**：支持输入 Markdown 语法（如 `# ` 变标题，`* ` 变列表）进行无缝高效排版。

## 📦 安装

由于本编辑器零依赖，您可以直接在项目中引入编译后的 UMD 脚本或 ES 模块。

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="path/to/inkflow-editor.css">

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

  editor.on('change', (html) => {
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

## 🛠️ 源码构建

```bash
npm install
npm run build
```

## 📄 开源协议

MIT License

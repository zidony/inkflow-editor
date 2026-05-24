# 🖋️ Inkflow Editor

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-success.svg)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)

**Inkflow Editor** 是一款极其轻量、极度优雅的 Vanilla JS 富文本编辑器。专为现代 CMS 后台和博客系统打造。

完全零依赖（**0 Dependencies**），无 jQuery，无 React/Vue 绑定负担。它用最纯粹的 Web API 实现了极客级的创作体验。

## ✨ 核心特性

* 🍃 **绝对轻量**：坚持 Vanilla JS 编写，极低的代码体积和内存占用。
* 🔌 **双轨打包**：原生支持现代 ESM (`import`) 和传统 UMD (`<script>`) 引入方式，完美兼容 Vue/React 单页应用与 PHP/Java 传统服务端渲染模板。
* 🎨 **现代化 UI**：清爽的工具栏、基于 SVG 的无损图标、丝滑的交互体验。
* 🧮 **动态矩阵表格**：内置类似高级编辑器的 10x10 图形化表格选择器，告别生硬的弹窗输入。
* 💻 **极客暗黑源码模式**：专属的 Source Code 视图，采用类 IDE 的深色护眼配色和等宽字体。
* 🚀 **Markdown 快捷语法**：支持输入 `# ` 快速生成标题、`> ` 生成引用块等心流输入拦截。
* ⚓ **强大的 Hook 机制**：图片上传、链接插入完全解耦，将业务逻辑（如直接上传至 OSS/服务器）控制权完美交还给开发者。

## 📦 安装与引入

### 方式一：在现代前端项目中使用 (NPM)

```bash
npm install inkflow-editor
```

```javascript
import { InkflowEditor } from 'inkflow-editor';
import 'inkflow-editor/style.css';

const editor = new InkflowEditor({
  container: '#editor-container',
  height: '500px'
});
```

### 方式二：在传统服务端渲染模板中使用 (CDN / 本地静态文件)

下载 dist 目录中的 inkflow-editor.umd.js 和 inkflow-editor.css，在 HTML 中引入：

```HTML
<link rel="stylesheet" href="/path/to/inkflow-editor.css">
<script src="/path/to/inkflow-editor.umd.js"></script>

<div id="editor-container"></div>

<script>
  // 解决 UMD 命名空间嵌套
  const CoreEditor = typeof InkflowEditor.InkflowEditor !== 'undefined' 
      ? InkflowEditor.InkflowEditor 
      : InkflowEditor;

  const editor = new CoreEditor({
    container: '#editor-container',
    lang: 'zh-CN',
    height: '600px'
  });
</script>
```

## 🛠️ 配置项 (Options)

在初始化时，可通过配置对象深度定制编辑器行为：

```TypeScript
interface InkflowOptions {
  container: HTMLElement | string; // 挂载节点 (必需)
  theme?: 'inkflow';               // 主题配置
  placeholder?: string;            // 占位符提示文字
  lang?: 'en-US' | 'zh-CN';        // 语言包
  height?: string;                 // 锁定编辑器高度并开启滚动 (如 '500px')
  
  // 生命周期与业务拦截钩子
  hooks?: {
    // 拦截图片插入逻辑，返回图片 URL 以供编辑器渲染
    onInsertImage?: () => Promise<string | null>;
  };
}
```

## 💡 高级用法示例：对接自建图片上传 API

通过 hooks 彻底摆脱传统编辑器难用的图片上传插件，使用原生 fetch 极简上传：

```JavaScript
const editor = new CoreEditor({
  container: '#editor-container',
  hooks: {
    onInsertImage: async () => {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
          const file = e.target.files[0];
          if (!file) return resolve(null);

          const data = new FormData();
          data.append("file", file);

          fetch("/api/upload", {
            method: "POST",
            body: data
          })
          .then(res => res.json())
          .then(res => {
            if (res.success) {
              resolve(res.imageUrl); // 将服务器返回的图片路径交给编辑器
            } else {
              resolve(null);
            }
          })
        };
        input.click();
      });
    }
  }
});
```

## 📄 数据提交 (Get / Set HTML)

* **获取数据**：提交表单前，使用 editor.getHTML() 获取纯净的富文本代码。  
* **回显数据**：编辑旧文章时，使用 editor.setHTML('<p>初始内容</p>') 将内容注入编辑器。

## 📜 License

MIT License. 自由使用，自由创造。
import { Toolbar } from '../ui/toolbar';
import type { InkflowOptions, ThemeClasses, EditorInstance, LocaleDict } from '../types/index';
import { inkflowTheme } from '../themes/inkflow';
import { HistoryManager } from './history';
import { enUS } from '../locales/en-US';
import { zhCN } from '../locales/zh-CN';

import { EventEmitter } from './emitter';

/**
 * Core InkflowEditor Class
 * Implements a lightweight, visual WYSIWYG editor with Markdown shortcuts and source code viewing.
 */
export class InkflowEditor extends EventEmitter implements EditorInstance {
    // ============================================================================
    // Fields
    // ============================================================================
    private options: InkflowOptions;
    private theme: ThemeClasses;
    private locale: LocaleDict;

    private containerEl: HTMLElement;
    private wrapperEl!: HTMLElement;
    private toolbarEl!: HTMLElement;
    private editorAreaEl!: HTMLElement;
    private sourceCodeEl!: HTMLTextAreaElement;

    private isSourceMode: boolean = false;
    private toolbarInstance!: Toolbar;
    private history!: HistoryManager;
    private historyTimeout: number | null = null;
    private savedRange: Range | null = null;

    // ============================================================================
    // Constructor
    // ============================================================================
    /**
     * Initializes a new instance of the InkflowEditor.
     * @param options Configuration options for the editor.
     */
    constructor(options: InkflowOptions) {
        super();
        this.options = options;

        const el =
            typeof options.container === 'string'
                ? document.querySelector<HTMLElement>(options.container)
                : options.container;

        if (!el) {
            throw new Error(`[InkflowEditor] Container element not found.`);
        }
        this.containerEl = el;

        this.theme = typeof options.theme === 'object' ? options.theme : inkflowTheme;

        if (typeof options.lang === 'object') {
            this.locale = options.lang;
        } else {
            this.locale = options.lang === 'en-US' ? enUS : zhCN;
        }

        // Extract initial HTML before DOM is overwritten
        const initialHtml = this.containerEl.innerHTML.trim();

        this.initDOM(initialHtml);
        this.history = new HistoryManager(this.getHTML());
    }

    // ============================================================================
    // Initialization & Lifecycle
    // ============================================================================
    /**
     * Bootstraps the DOM structure for the editor.
     */
    private initDOM(initialHtml: string = ''): void {
        this.createWrapper();
        this.createToolbar();
        this.createEditorArea();
        this.createSourceArea();
        
        // Inject the initial HTML
        if (initialHtml) {
            this.editorAreaEl.innerHTML = initialHtml;
        }

        this.wrapperEl.appendChild(this.toolbarEl);
        this.wrapperEl.appendChild(this.editorAreaEl);
        this.wrapperEl.appendChild(this.sourceCodeEl);

        this.containerEl.innerHTML = '';
        this.containerEl.appendChild(this.wrapperEl);

        this.initializeToolbar();
        this.bindEvents();

        // Emit ready event after DOM is fully initialized
        setTimeout(() => this.emit('ready', this), 0);
    }

    private createWrapper(): void {
        this.wrapperEl = document.createElement('div');
        this.wrapperEl.className = this.theme.container;
    }

    private createToolbar(): void {
        this.toolbarEl = document.createElement('div');
        this.toolbarEl.className = this.theme.toolbar;
    }

    private createEditorArea(): void {
        this.editorAreaEl = document.createElement('div');
        this.editorAreaEl.className = this.theme.editorArea;
        this.editorAreaEl.contentEditable = 'true';
        if (this.options.placeholder) {
            this.editorAreaEl.dataset.placeholder = this.options.placeholder;
        }

        if (this.options.height) {
            this.editorAreaEl.style.height = this.options.height;
            this.editorAreaEl.style.overflowY = 'auto';
        }
    }

    private createSourceArea(): void {
        this.sourceCodeEl = document.createElement('textarea');
        this.sourceCodeEl.className = 'inkflow-source-area';
        this.sourceCodeEl.style.display = 'none';
        this.sourceCodeEl.spellcheck = false;

        if (this.options.height) {
            this.sourceCodeEl.style.height = this.options.height;
            this.sourceCodeEl.style.overflowY = 'auto';
        }
    }

    private initializeToolbar(): void {
        const defaultToolbarLayout = [
            ['heading'],
            ['bold', 'italic', 'underline', 'strike', 'inlineCode', 'eraser'],
            ['alignLeft', 'alignCenter', 'alignRight'],
            ['listUl', 'listOl'],
            ['link', 'image', 'video', 'codeBlock', 'blockquote', 'table', 'divider'],
            ['undo', 'redo'],
            ['sourceCode', 'fullscreen']
        ];
        const toolbarConfig = this.options.toolbar || defaultToolbarLayout;

        this.toolbarInstance = new Toolbar(
            this.toolbarEl,
            this.editorAreaEl,
            this.theme,
            toolbarConfig,
            this.locale,
            this.options.hooks
        );
    }

    // ============================================================================
    // Public API Methods
    // ============================================================================
    /**
     * Retrieves the current HTML content of the editor.
     * @returns The formatted HTML string.
     */
    public getHTML(): string {
        return this.isSourceMode
            ? this.sourceCodeEl.value
            : this.formatOutputHTML(this.editorAreaEl.innerHTML);
    }

    /**
     * Retrieves the plain text content of the editor.
     * @returns The plain text string.
     */
    public getText(): string {
        return this.editorAreaEl.innerText || this.editorAreaEl.textContent || '';
    }

    /**
     * Sets the HTML content of the editor programmatically.
     * @param html The HTML string to inject.
     */
    public setHTML(html: string): void {
        this.editorAreaEl.innerHTML = html;
        this.saveHistoryNow();
    }

    /**
     * Triggers an immediate history snapshot save.
     */
    public saveHistoryNow(): void {
        const html = this.getHTML();
        this.history.saveSnapshot(html);
        this.emit('change', html);
    }

    /**
     * Destroys the editor instance and cleans up the DOM.
     */
    public destroy(): void {
        this.containerEl.innerHTML = '';
    }

    // ============================================================================
    // Event Handlers
    // ============================================================================
    /**
     * Binds native DOM events and custom widget events.
     */
    private bindEvents(): void {
        // Lifecycle events
        this.editorAreaEl.addEventListener('focus', () => this.emit('focus'));
        this.editorAreaEl.addEventListener('blur', () => this.emit('blur'));

        // Selection tracking
        this.editorAreaEl.addEventListener('keyup', () => this.handleSelectionSave());
        this.editorAreaEl.addEventListener('mouseup', () => this.handleSelectionSave());
        this.editorAreaEl.addEventListener('focusout', () => this.handleSelectionSave());

        // Keyboard & State tracking
        this.editorAreaEl.addEventListener('mouseup', () => this.toolbarInstance.updateState());
        this.editorAreaEl.addEventListener('keyup', (e: KeyboardEvent) =>
            this.handleKeyboardEvent(e)
        );
        this.editorAreaEl.addEventListener('keydown', (e: KeyboardEvent) =>
            this.handleShortcuts(e)
        );

        // Paste sanitization & Image upload
        this.editorAreaEl.addEventListener('paste', (e: ClipboardEvent) =>
            this.handlePasteEvent(e)
        );

        // Drag and Drop Image upload
        const preventNav = (e: DragEvent) => {
            if (e.dataTransfer?.types.includes('Files')) {
                e.preventDefault();
            }
        };
        this.wrapperEl.addEventListener('dragenter', preventNav);
        this.wrapperEl.addEventListener('dragover', preventNav);
        this.wrapperEl.addEventListener('drop', (e: DragEvent) => {
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                e.preventDefault(); // Prevent browser navigation
            }
            // Only process image drop if it was dropped inside the editor area
            if (this.editorAreaEl.contains(e.target as Node) || e.target === this.editorAreaEl) {
                this.handleDropEvent(e);
            }
        });

        // Format changed listener from Toolbar
        this.editorAreaEl.addEventListener('inkflow-format-changed', () => this.saveHistoryNow());

        // Custom Commands from Toolbar (e.g., fullscreen, codeblock, table)
        this.toolbarEl.addEventListener('inkflow-custom-command', (e: Event) =>
            this.handleCustomCommand(e as CustomEvent)
        );
    }

    private handleSelectionSave(): void {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            this.savedRange = sel.getRangeAt(0).cloneRange();
        }
    }

    private handleKeyboardEvent(e: KeyboardEvent): void {
        this.toolbarInstance.updateState();

        const ignoredKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Control',
            'Shift',
            'Alt',
            'Meta'
        ];
        if (!ignoredKeys.includes(e.key)) {
            this.debounceSaveHistory();
        }

        if (e.key === ' ' || e.code === 'Space') {
            this.checkMarkdownRules();
        }
    }

    private handleShortcuts(e: KeyboardEvent): void {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            e.shiftKey ? this.performRedo() : this.performUndo();
        } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            this.performRedo();
        }
    }

    private handlePasteEvent(e: ClipboardEvent): void {
        e.preventDefault();
        if (!e.clipboardData) return;

        // Check for image files first if hook is provided
        if (this.options.hooks?.onUploadImage && e.clipboardData.files && e.clipboardData.files.length > 0) {
            for (let i = 0; i < e.clipboardData.files.length; i++) {
                const file = e.clipboardData.files[i];
                if (file.type.indexOf('image') !== -1) {
                    this.processImageUpload(file);
                    return; // intercept paste completely
                }
            }
        }

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html) {
            document.execCommand('insertHTML', false, this.sanitizeHTML(html));
        } else if (text) {
            document.execCommand('insertText', false, text);
        }

        this.saveHistoryNow();
    }

    private handleDropEvent(e: DragEvent): void {
        if (!this.options.hooks?.onUploadImage || !e.dataTransfer) return;
        
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.indexOf('image') !== -1) {
                e.preventDefault(); // Prevent browser from opening the image directly
                
                // Update selection to drop position
                if (document.caretRangeFromPoint) {
                    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                    if (range) {
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                }
                
                this.processImageUpload(file);
                return; // only process the first image
            }
        }
    }

    private async processImageUpload(file: File): Promise<void> {
        const uploadId = 'upload-img-' + Math.random().toString(36).substring(2, 9);
        const skeletonHtml = `<span id="${uploadId}" class="inkflow-img-skeleton" contenteditable="false">🖼️ Uploading...</span>&nbsp;`;
        document.execCommand('insertHTML', false, skeletonHtml);
        
        const hook = this.options.hooks?.onUploadImage;
        if (!hook) return;

        try {
            const url = await hook(file);
            const skeletonEl = this.editorAreaEl.querySelector(`#${uploadId}`);
            if (skeletonEl) {
                if (url) {
                    const imgHtml = `<img src="${url}" alt="image" style="max-width:100%;height:auto;">&nbsp;`;
                    skeletonEl.outerHTML = imgHtml;
                    this.saveHistoryNow();
                } else {
                    skeletonEl.remove();
                }
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            const skeletonEl = this.editorAreaEl.querySelector(`#${uploadId}`);
            if (skeletonEl) {
                skeletonEl.remove();
            }
        }
    }

    private handleCustomCommand(e: CustomEvent): void {
        const detail = e.detail;

        switch (detail.command) {
            case 'sourceCode':
                this.toggleSourceMode();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'codeBlock':
                this.insertCodeBlock();
                break;
            case 'table':
                this.insertTable(detail.rows, detail.cols);
                break;
        }
    }

    // ============================================================================
    // Private Actions & Commands
    // ============================================================================
    private toggleSourceMode(): void {
        this.isSourceMode = !this.isSourceMode;

        if (this.isSourceMode) {
            this.sourceCodeEl.value = this.formatOutputHTML(this.editorAreaEl.innerHTML);
            // Sync height so if user resized visual editor, source editor matches
            this.sourceCodeEl.style.height = `${this.editorAreaEl.offsetHeight}px`;
            
            this.editorAreaEl.style.display = 'none';
            this.sourceCodeEl.style.display = 'block';
        } else {
            this.editorAreaEl.innerHTML = this.sourceCodeEl.value;
            // Sync height so if user resized source editor, visual editor matches
            this.editorAreaEl.style.height = `${this.sourceCodeEl.offsetHeight}px`;
            
            this.sourceCodeEl.style.display = 'none';
            this.editorAreaEl.style.display = 'block';
            this.saveHistoryNow();
        }
    }

    private toggleFullscreen(): void {
        const isFullScreen = this.wrapperEl.classList.contains('is-fullscreen');

        if (!isFullScreen) {
            document.body.appendChild(this.wrapperEl);
            this.wrapperEl.classList.add('is-fullscreen');
            document.body.style.overflow = 'hidden';
        } else {
            this.containerEl.appendChild(this.wrapperEl);
            this.wrapperEl.classList.remove('is-fullscreen');
            document.body.style.overflow = '';
        }
    }

    private insertCodeBlock(): void {
        const html = `<pre><code>// Paste your code here...</code></pre><p><br></p>`;
        document.execCommand('insertHTML', false, html);
        this.saveHistoryNow();
    }

    private insertTable(rows: number, cols: number): void {
        if (!rows || !cols) return;

        this.editorAreaEl.focus();

        if (this.savedRange) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(this.savedRange);
        }

        let tableHtml = '<table><tbody>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                tableHtml += '<td><br></td>';
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';

        document.execCommand('insertHTML', false, tableHtml);
        this.saveHistoryNow();
    }

    // ============================================================================
    // History Management
    // ============================================================================
    private debounceSaveHistory(): void {
        if (this.historyTimeout) {
            window.clearTimeout(this.historyTimeout);
        }
        this.historyTimeout = window.setTimeout(() => this.saveHistoryNow(), 500);
    }

    private performUndo(): void {
        const prev = this.history.undo();
        if (prev !== null) {
            this.editorAreaEl.innerHTML = prev;
            this.toolbarInstance.updateState();
        }
    }

    private performRedo(): void {
        const next = this.history.redo();
        if (next !== null) {
            this.editorAreaEl.innerHTML = next;
            this.toolbarInstance.updateState();
        }
    }

    // ============================================================================
    // Markdown Engine
    // ============================================================================
    /**
     * Intercepts spacebar presses to execute Markdown-like formatting.
     */
    private checkMarkdownRules(): void {
        const sel = window.getSelection();
        if (!sel || !sel.focusNode) return;

        let block = sel.focusNode;
        while (block && block.nodeType !== Node.ELEMENT_NODE) {
            block = block.parentNode as Node;
        }

        if (!block || block === this.editorAreaEl) return;

        const text = block.textContent || '';
        const rules = [
            { prefix: '# ', command: 'formatBlock', value: 'H1' },
            { prefix: '## ', command: 'formatBlock', value: 'H2' },
            { prefix: '### ', command: 'formatBlock', value: 'H3' },
            { prefix: '> ', command: 'formatBlock', value: 'BLOCKQUOTE' },
            { prefix: '- ', command: 'insertUnorderedList', value: undefined }
        ];

        for (const rule of rules) {
            if (text === rule.prefix) {
                block.textContent = '';
                this.editorAreaEl.focus();
                document.execCommand(rule.command, false, rule.value);
                this.saveHistoryNow();
                break;
            }
        }
    }

    // ============================================================================
    // Utilities
    // ============================================================================
    /**
     * Cleans up pasted HTML to prevent XSS and strip unwanted styles.
     * @param dirtyHtml The raw HTML string.
     * @returns A sanitized HTML string.
     */
    private sanitizeHTML(dirtyHtml: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(dirtyHtml, 'text/html');
        const body = doc.body;

        const forbiddenTags = ['script', 'style', 'meta', 'iframe', 'object', 'embed'];
        forbiddenTags.forEach(tag => body.querySelectorAll(tag).forEach(el => el.remove()));

        body.querySelectorAll('*').forEach(el => {
            el.removeAttribute('style');
            el.removeAttribute('class');
            el.removeAttribute('id');

            Array.from(el.attributes).forEach(attr => {
                if (attr.name.toLowerCase().startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        return body.innerHTML;
    }

    /**
     * Processes editor HTML to ensure standard tags (e.g., strong instead of b)
     * and removes empty formatting blocks.
     * @param html The raw editor HTML.
     * @returns Formatted HTML string.
     */
    private formatOutputHTML(html: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.body;

        body.querySelectorAll('b').forEach(b => {
            const strong = document.createElement('strong');
            strong.innerHTML = b.innerHTML;
            b.replaceWith(strong);
        });

        body.querySelectorAll('i').forEach(i => {
            const em = document.createElement('em');
            em.innerHTML = i.innerHTML;
            i.replaceWith(em);
        });

        let foundEmpty = true;
        const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];

        while (foundEmpty) {
            foundEmpty = false;
            const allElements = body.querySelectorAll('*');
            for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i];
                if (blockTags.includes(el.tagName.toLowerCase())) {
                    const hasImg = el.querySelector('img') !== null;
                    const isJustBr = el.innerHTML.trim().toLowerCase() === '<br>';
                    if (!hasImg && ((el.textContent || '').trim() === '' || isJustBr)) {
                        el.remove();
                        foundEmpty = true;
                    }
                }
            }
        }
        return body.innerHTML === '<br>' ? '' : body.innerHTML;
    }
}

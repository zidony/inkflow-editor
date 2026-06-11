import { Toolbar } from '../ui/toolbar';
import type { InkflowOptions, ThemeClasses, EditorInstance, LocaleDict, ToolbarLayout } from '../types/index';
import { inkflowTheme } from '../themes/inkflow';
import { HistoryManager } from './history';
import { enUS } from '../locales/en-US';
import { zhCN } from '../locales/zh-CN';
import { sanitizeHTML, sanitizeMediaUrl } from '../utils/security';

import { CommandAdapter } from './commands';
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
    private resizerOverlayEl!: HTMLElement;
    private statusBarEl!: HTMLElement;

    private isSourceMode: boolean = false;
    private isDestroyed: boolean = false;
    private activeResizingImage: HTMLImageElement | null = null;
    private toolbarInstance!: Toolbar;
    private commands!: CommandAdapter;
    private history!: HistoryManager;
    private historyTimeout: number | null = null;
    private readyTimeout: number | null = null;
    private statusMessageTimeout: number | null = null;
    private savedRange: Range | null = null;
    private isComposing: boolean = false;
    private previousBodyOverflow: string = '';

    private activeResizerMouseMove: ((e: MouseEvent) => void) | null = null;
    private activeResizerMouseUp: (() => void) | null = null;

    private resizeListener = () => {
        if (this.activeResizingImage) this.updateResizerPosition(this.activeResizingImage);
    };

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

        // Extract and sanitize initial HTML before the container is overwritten.
        const initialHtml = sanitizeHTML(this.containerEl.innerHTML.trim());

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
        this.commands = new CommandAdapter(this.editorAreaEl);
        this.createSourceArea();
        this.createResizerOverlay();
        this.createStatusBar();
        
        // Inject the initial HTML.
        if (initialHtml) {
            this.editorAreaEl.innerHTML = this.parseEmojiHTML(initialHtml);
        }

        this.wrapperEl.appendChild(this.toolbarEl);
        this.wrapperEl.appendChild(this.editorAreaEl);
        this.wrapperEl.appendChild(this.sourceCodeEl);
        this.wrapperEl.appendChild(this.resizerOverlayEl);
        this.wrapperEl.appendChild(this.statusBarEl);

        this.containerEl.innerHTML = '';
        this.containerEl.appendChild(this.wrapperEl);

        this.initializeToolbar();
        this.bindEvents();
        this.updateStatusBar();

        // Emit ready event after DOM is fully initialized.
        this.readyTimeout = window.setTimeout(() => {
            this.readyTimeout = null;
            this.emit('ready', this);
        }, 0);
    }

    private createWrapper(): void {
        this.wrapperEl = document.createElement('div');
        this.wrapperEl.className = this.theme.container;
        const size = this.options.size || 'md';
        this.wrapperEl.classList.add(`inkflow-size-${size}`);
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

    private createResizerOverlay(): void {
        this.resizerOverlayEl = document.createElement('div');
        this.resizerOverlayEl.className = 'inkflow-image-resizer';
        this.resizerOverlayEl.style.display = 'none';

        const positions = ['nw', 'ne', 'sw', 'se'];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `inkflow-resizer-handle ${pos}`;
            handle.dataset.pos = pos;
            this.resizerOverlayEl.appendChild(handle);
        });

        this.bindResizerEvents();
    }

    private createStatusBar(): void {
        this.statusBarEl = document.createElement('div');
        this.statusBarEl.className = 'inkflow-status-bar';

        const modeSpan = document.createElement('span');
        modeSpan.className = 'inkflow-status-mode';
        modeSpan.textContent = this.isSourceMode ? 'HTML Source' : 'Visual Editor';

        const statsSpan = document.createElement('span');
        statsSpan.className = 'inkflow-status-stats';
        statsSpan.textContent = 'Words: 0 | Characters: 0';

        const statusMsgSpan = document.createElement('span');
        statusMsgSpan.className = 'inkflow-status-message';
        statusMsgSpan.textContent = 'Ready';

        this.statusBarEl.appendChild(modeSpan);
        this.statusBarEl.appendChild(statsSpan);
        this.statusBarEl.appendChild(statusMsgSpan);
    }

    private bindResizerEvents(): void {
        let isDragging = false;
        let startX = 0;
        let startWidth = 0;
        let activeHandle = '';

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging || !this.activeResizingImage) return;
            e.preventDefault();

            const dx = e.clientX - startX;
            let newWidth = startWidth;

            // Simple width scaling
            if (activeHandle === 'se' || activeHandle === 'ne') {
                newWidth = startWidth + dx;
            } else if (activeHandle === 'sw' || activeHandle === 'nw') {
                newWidth = startWidth - dx;
            }

            if (newWidth > 20) {
                this.activeResizingImage.style.width = `${newWidth}px`;
                this.activeResizingImage.style.height = 'auto';
                this.updateResizerPosition(this.activeResizingImage);
            }
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                this.activeResizerMouseMove = null;
                this.activeResizerMouseUp = null;
                this.saveHistoryNow();
            }
        };

        this.resizerOverlayEl.addEventListener('mousedown', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('inkflow-resizer-handle')) {
                e.preventDefault();
                isDragging = true;
                startX = e.clientX;
                startWidth = this.activeResizingImage?.offsetWidth || 0;
                activeHandle = target.dataset.pos || '';

                this.activeResizerMouseMove = onMouseMove;
                this.activeResizerMouseUp = onMouseUp;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
    }

    private updateResizerPosition(img: HTMLImageElement | null): void {
        this.activeResizingImage = img;
        if (!img) {
            this.resizerOverlayEl.style.display = 'none';
            return;
        }
        
        const wrapperRect = this.wrapperEl.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        this.resizerOverlayEl.style.display = 'block';
        // Check if image is out of bounds due to scroll
        const editorRect = this.editorAreaEl.getBoundingClientRect();
        if (imgRect.bottom <= editorRect.top || imgRect.top >= editorRect.bottom) {
            this.resizerOverlayEl.style.display = 'none';
            return;
        }

        this.resizerOverlayEl.style.top = `${imgRect.top - wrapperRect.top}px`;
        this.resizerOverlayEl.style.left = `${imgRect.left - wrapperRect.left}px`;
        this.resizerOverlayEl.style.width = `${imgRect.width}px`;
        this.resizerOverlayEl.style.height = `${imgRect.height}px`;
    }

    private initializeToolbar(): void {
        const toolbarConfig = this.resolveToolbarLayout();

        this.toolbarInstance = new Toolbar(
            this.toolbarEl,
            this.editorAreaEl,
            this.theme,
            toolbarConfig,
            this.locale,
            this.commands,
            this.options.emoji,
            this.options.hooks
        );
    }

    private resolveToolbarLayout(): ToolbarLayout {
        if (this.options.toolbar) return this.options.toolbar;
        return this.options.toolbarMode === 'basic'
            ? this.createBasicToolbarLayout()
            : this.createFullToolbarLayout();
    }

    private createFullToolbarLayout(): ToolbarLayout {
        const blockTools = this.options.emoji
            ? ['codeBlock', 'blockquote', 'table', 'divider', 'emoji']
            : ['codeBlock', 'blockquote', 'table', 'divider'];

        return [
            ['heading'],
            ['bold', 'italic', 'underline', 'strike', 'inlineCode', 'eraser'],
            ['alignLeft', 'alignCenter', 'alignRight'],
            ['listUl', 'listOl'],
            blockTools,
            ['link', 'image', 'video'],
            ['undo', 'redo'],
            ['sourceCode', 'fullscreen']
        ];
    }

    private createBasicToolbarLayout(): ToolbarLayout {
        const toolbarLayout: ToolbarLayout = [
            ['heading'],
            ['bold', 'italic', 'underline'],
            ['listUl', 'listOl'],
            ['link', 'image'],
        ];

        if (this.options.emoji) {
            toolbarLayout.push(['emoji']);
        }

        toolbarLayout.push(
            ['undo', 'redo']
        );

        return toolbarLayout;
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
            ? this.formatOutputHTML(sanitizeHTML(this.sourceCodeEl.value))
            : this.formatOutputHTML(this.editorAreaEl.innerHTML);
    }

    /**
     * Retrieves the plain text content of the editor.
     * @returns The plain text string.
     */
    public getText(): string {
        if (this.isSourceMode) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(sanitizeHTML(this.sourceCodeEl.value), 'text/html');
            return doc.body.innerText || doc.body.textContent || '';
        }

        return this.editorAreaEl.innerText || this.editorAreaEl.textContent || '';
    }

    /**
     * Sets the HTML content of the editor programmatically.
     * @param html The HTML string to inject.
     */
    public setHTML(html: string): void {
        if (this.isDestroyed) return;

        const sanitizedHtml = sanitizeHTML(html);
        const formattedHtml = this.formatOutputHTML(sanitizedHtml);
        this.editorAreaEl.innerHTML = this.parseEmojiHTML(formattedHtml);
        if (this.isSourceMode) {
            this.sourceCodeEl.value = formattedHtml;
        }
        this.saveHistoryNow();
    }

    /**
     * Triggers an immediate history snapshot save.
     */
    public saveHistoryNow(): void {
        if (this.isDestroyed) return;

        const snapshotHtml = this.getSnapshotHTML();
        const hasChanged = this.history.saveSnapshot(snapshotHtml);
        this.updateStatusBar();
        if (hasChanged) {
            this.emit('change', this.getHTML());
            this.setStatusMessage('Saved');
        }
    }

    /**
     * Destroys the editor instance and cleans up the DOM.
     */
    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        // 1. Remove window resize listener
        window.removeEventListener('resize', this.resizeListener);

        // 2. Remove active resizer drag listeners if drag was in progress
        if (this.activeResizerMouseMove) {
            document.removeEventListener('mousemove', this.activeResizerMouseMove);
        }
        if (this.activeResizerMouseUp) {
            document.removeEventListener('mouseup', this.activeResizerMouseUp);
        }

        // 3. Clear pending timers
        if (this.readyTimeout) {
            window.clearTimeout(this.readyTimeout);
            this.readyTimeout = null;
        }
        if (this.historyTimeout) {
            window.clearTimeout(this.historyTimeout);
            this.historyTimeout = null;
        }
        if (this.statusMessageTimeout) {
            window.clearTimeout(this.statusMessageTimeout);
            this.statusMessageTimeout = null;
        }

        // 4. Destroy the toolbar (clears document-level table picker click listeners)
        if (this.toolbarInstance) {
            this.toolbarInstance.destroy();
        }

        // 5. Unsubscribe all Event Emitter handlers
        this.clear();

        // 6. Restore global document state and clear DOM
        if (this.wrapperEl?.classList.contains('is-fullscreen')) {
            this.wrapperEl.classList.remove('is-fullscreen');
            document.body.style.overflow = this.previousBodyOverflow;
            this.previousBodyOverflow = '';
        }

        this.wrapperEl?.remove();
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

        // Image selection
        this.editorAreaEl.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() === 'img' && !target.classList.contains('inkflow-emoji')) {
                this.clearImageSelection();
                target.classList.add('is-selected');
                this.updateResizerPosition(target as HTMLImageElement);
            } else {
                this.clearImageSelection();
            }
        });

        // Scroll and resize tracking for resizer overlay
        this.editorAreaEl.addEventListener('scroll', () => {
            if (this.activeResizingImage) this.updateResizerPosition(this.activeResizingImage);
        });
        window.addEventListener('resize', this.resizeListener);

        // Selection tracking
        this.editorAreaEl.addEventListener('keyup', () => this.handleSelectionSave());
        this.editorAreaEl.addEventListener('mouseup', () => this.handleSelectionSave());
        this.editorAreaEl.addEventListener('focusout', () => this.handleSelectionSave());
        this.editorAreaEl.addEventListener('copy', (e) => this.handleCopyEvent(e as ClipboardEvent));
        this.editorAreaEl.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });
        this.editorAreaEl.addEventListener('compositionend', () => {
            this.isComposing = false;
            this.debounceSaveHistory();
            this.updateStatusBar();
        });

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
        this.sourceCodeEl.addEventListener('input', () => {
            this.setStatusMessage('Editing...', 0);
            this.debounceSaveHistory();
            this.updateStatusBar();
        });
        this.sourceCodeEl.addEventListener('keydown', (e: KeyboardEvent) =>
            this.handleShortcuts(e)
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

    private clearImageSelection(): void {
        const selectedImages = this.editorAreaEl.querySelectorAll('img.is-selected');
        selectedImages.forEach(img => img.classList.remove('is-selected'));
        this.updateResizerPosition(null);
    }

    private handleKeyboardEvent(e: KeyboardEvent): void {
        this.toolbarInstance.updateState();

        if (this.isComposing || e.isComposing) {
            this.updateStatusBar();
            return;
        }

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
            this.clearImageSelection();
            this.setStatusMessage('Editing...', 0);
            this.debounceSaveHistory();
        }

        this.updateStatusBar();

        if (e.key === ' ' || e.code === 'Space') {
            this.checkMarkdownRules();
        }
    }

    private handleShortcuts(e: KeyboardEvent): void {
        if (this.isComposing || e.isComposing) return;

        // Image deletion
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const selectedImage = this.editorAreaEl.querySelector('img.is-selected');
            if (selectedImage) {
                e.preventDefault();
                selectedImage.remove();
                this.saveHistoryNow();
                return;
            }
        }

        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                this.performRedo();
            } else {
                this.performUndo();
            }
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
            this.commands.insertHTML(sanitizeHTML(html));
        } else if (text) {
            this.commands.insertText(text);
        }

        this.saveHistoryNow();
    }

    private handleCopyEvent(e: ClipboardEvent): void {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

        const container = document.createElement('div');
        for (let i = 0; i < sel.rangeCount; i++) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
        }

        container.querySelectorAll('img.inkflow-emoji').forEach(img => {
            const altText = img.getAttribute('alt');
            if (altText) {
                const textNode = document.createTextNode(altText);
                img.replaceWith(textNode);
            }
        });

        if (e.clipboardData) {
            e.preventDefault();
            e.clipboardData.setData('text/html', container.innerHTML);
            e.clipboardData.setData('text/plain', container.innerText);
        }
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
        if (this.isDestroyed) return;

        const uploadId = 'upload-img-' + Math.random().toString(36).substring(2, 9);
        this.commands.insertImageUploadPlaceholder(uploadId);
        
        const hook = this.options.hooks?.onUploadImage;
        if (!hook) return;

        try {
            const url = await hook(file);
            if (this.isDestroyed) return;

            const skeletonEl = this.editorAreaEl.querySelector(`#${uploadId}`);
            if (skeletonEl) {
                if (url) {
                    const safeUrl = sanitizeMediaUrl(url, 'image');
                    if (!safeUrl) {
                        skeletonEl.remove();
                        return;
                    }

                    const img = document.createElement('img');
                    img.src = safeUrl;
                    img.alt = 'image';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    skeletonEl.replaceWith(img, document.createTextNode('\u00A0'));
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
            case 'undo':
                this.performUndo();
                break;
            case 'redo':
                this.performRedo();
                break;
            case 'emoji':
                if (detail.value) {
                    if (detail.src) {
                        this.commands.insertEmojiImage(detail.value, detail.src);
                    } else {
                        this.commands.insertText(detail.value);
                    }
                    this.saveHistoryNow();
                }
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
            this.toolbarInstance.setDisabled(true);
        } else {
            const sanitizedHtml = sanitizeHTML(this.sourceCodeEl.value);
            const formattedHtml = this.formatOutputHTML(sanitizedHtml);
            this.sourceCodeEl.value = formattedHtml;
            this.editorAreaEl.innerHTML = this.parseEmojiHTML(formattedHtml);
            // Sync height so if user resized source editor, visual editor matches
            this.editorAreaEl.style.height = `${this.sourceCodeEl.offsetHeight}px`;
            
            this.sourceCodeEl.style.display = 'none';
            this.editorAreaEl.style.display = 'block';
            this.toolbarInstance.setDisabled(false);
            this.saveHistoryNow();
        }
        this.updateStatusBar();
    }

    private toggleFullscreen(): void {
        const isFullScreen = this.wrapperEl.classList.contains('is-fullscreen');

        if (!isFullScreen) {
            this.previousBodyOverflow = document.body.style.overflow;
            document.body.appendChild(this.wrapperEl);
            this.wrapperEl.classList.add('is-fullscreen');
            document.body.style.overflow = 'hidden';
        } else {
            this.containerEl.appendChild(this.wrapperEl);
            this.wrapperEl.classList.remove('is-fullscreen');
            document.body.style.overflow = this.previousBodyOverflow;
            this.previousBodyOverflow = '';
        }
    }

    private insertCodeBlock(): void {
        this.commands.insertCodeBlock();
        this.saveHistoryNow();
    }

    private insertTable(rows: number, cols: number): void {
        this.editorAreaEl.focus();

        if (this.savedRange) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(this.savedRange);
        }

        if (this.commands.insertTable(rows, cols)) {
            this.saveHistoryNow();
        }
    }

    // ============================================================================
    // History Management
    // ============================================================================
    private debounceSaveHistory(): void {
        if (this.historyTimeout) {
            window.clearTimeout(this.historyTimeout);
        }
        this.historyTimeout = window.setTimeout(() => {
            this.historyTimeout = null;
            this.saveHistoryNow();
        }, 500);
    }

    private flushPendingHistory(): void {
        if (!this.historyTimeout) return;

        window.clearTimeout(this.historyTimeout);
        this.historyTimeout = null;
        this.saveHistoryNow();
    }

    private performUndo(): void {
        this.flushPendingHistory();
        const prev = this.history.undo();
        if (prev !== null) {
            this.restoreSnapshot(prev);
            this.toolbarInstance.updateState();
            this.updateStatusBar();
            this.setStatusMessage('Undo');
        }
    }

    private performRedo(): void {
        this.flushPendingHistory();
        const next = this.history.redo();
        if (next !== null) {
            this.restoreSnapshot(next);
            this.toolbarInstance.updateState();
            this.updateStatusBar();
            this.setStatusMessage('Redo');
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

        const textNode = sel.focusNode;
        const offset = sel.focusOffset;

        // 1. Inline Markdown Parsing
        if (textNode.nodeType === Node.TEXT_NODE) {
            let isInsideCode = false;
            let parent = textNode.parentNode;
            while (parent && parent !== this.editorAreaEl) {
                if (parent.nodeName === 'PRE' || parent.nodeName === 'CODE') {
                    isInsideCode = true;
                    break;
                }
                parent = parent.parentNode;
            }

            if (!isInsideCode) {
                const textBeforeCursor = (textNode.textContent || '').substring(0, offset);
                
                const inlineRules = [
                    { regex: /\*\*([^*]+)\*\*[\s\u00A0]$/, tag: 'strong' },
                    { regex: /__([^_]+)__[\s\u00A0]$/, tag: 'strong' },
                    { regex: /\*([^*]+)\*[\s\u00A0]$/, tag: 'em' },
                    { regex: /_([^_]+)_[\s\u00A0]$/, tag: 'em' },
                    { regex: /~~([^~]+)~~[\s\u00A0]$/, tag: 'del' },
                    { regex: /`([^`]+)`[\s\u00A0]$/, tag: 'code' }
                ];

                for (const rule of inlineRules) {
                    const match = rule.regex.exec(textBeforeCursor);
                    if (match) {
                        const matchLength = match[0].length;
                        const startOffset = offset - matchLength;

                        const range = document.createRange();
                        range.setStart(textNode, startOffset);
                        range.setEnd(textNode, offset);
                        range.deleteContents();

                        const newEl = document.createElement(rule.tag);
                        newEl.textContent = match[1];

                        range.insertNode(newEl);

                        const spaceNode = document.createTextNode('\u00A0');
                        if (newEl.parentNode) {
                            newEl.parentNode.insertBefore(spaceNode, newEl.nextSibling);
                        }

                        sel.removeAllRanges();
                        const newRange = document.createRange();
                        newRange.setStart(spaceNode, 1);
                        newRange.setEnd(spaceNode, 1);
                        sel.addRange(newRange);

                        this.saveHistoryNow();
                        return; // Stop processing rules
                    }
                }
            }
        }

        // 2. Block Markdown Parsing
        let block = sel.focusNode;
        while (block && block.nodeType !== Node.ELEMENT_NODE) {
            block = block.parentNode as Node;
        }

        if (!block || block === this.editorAreaEl) return;

        const text = block.textContent || '';
        const textNormal = text.replace(/\u00A0/g, ' ');

        // Check for horizontal rules (--- or ***)
        if (textNormal === '---' || textNormal === '--- ' || textNormal === '***' || textNormal === '*** ') {
            block.textContent = '';
            this.editorAreaEl.focus();
            this.commands.insertHorizontalRule();
            this.saveHistoryNow();
            return;
        }

        // Check for code block (```)
        if (textNormal === '```' || textNormal === '``` ') {
            block.textContent = '';
            this.editorAreaEl.focus();
            this.insertCodeBlock();
            return;
        }

        const rules = [
            { prefix: '# ', command: 'formatBlock', value: 'H1' },
            { prefix: '## ', command: 'formatBlock', value: 'H2' },
            { prefix: '### ', command: 'formatBlock', value: 'H3' },
            { prefix: '> ', command: 'formatBlock', value: 'BLOCKQUOTE' },
            { prefix: '- ', command: 'insertUnorderedList', value: undefined },
            { prefix: '* ', command: 'insertUnorderedList', value: undefined },
            { prefix: '1. ', command: 'insertOrderedList', value: undefined }
        ];

        for (const rule of rules) {
            if (textNormal === rule.prefix) {
                this.editorAreaEl.focus();
                if (this.commands.exec(rule.command, rule.value || '')) {
                    block.textContent = '';
                    this.saveHistoryNow();
                }
                break;
            }
        }
    }

    // ============================================================================
    // Utilities
    // ============================================================================
    private parseEmojiHTML(html: string): string {
        return this.options.emoji?.parseHTML ? this.options.emoji.parseHTML(html) : html;
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

        // 1. Strip history bookmarks that might leak into the output
        body.querySelectorAll('.inkflow-bookmark').forEach(el => el.remove());

        // 1.5 Restore Unicode emojis from local img tags
        body.querySelectorAll('img.inkflow-emoji').forEach(img => {
            const altText = img.getAttribute('alt');
            if (altText) {
                const textNode = document.createTextNode(altText);
                img.replaceWith(textNode);
            }
        });

        // 2. Standardize tags
        body.querySelectorAll('b').forEach(b => {
            const strong = document.createElement('strong');
            this.moveChildNodes(b, strong);
            b.replaceWith(strong);
        });

        body.querySelectorAll('i').forEach(i => {
            const em = document.createElement('em');
            this.moveChildNodes(i, em);
            i.replaceWith(em);
        });

        // 3. Purge empty inline styling junk tags (e.g. empty strong or em left by browsers)
        const inlineFormattingTags = ['strong', 'em', 'u', 'span', 'code', 'del', 'a'];
        let foundEmptyInline = true;
        while (foundEmptyInline) {
            foundEmptyInline = false;
            const elements = body.querySelectorAll('*');
            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                const tagName = el.tagName.toLowerCase();
                if (inlineFormattingTags.includes(tagName)) {
                    if (el.childNodes.length === 0 || el.innerHTML.trim() === '') {
                        el.remove();
                        foundEmptyInline = true;
                        break;
                    }
                }
            }
        }

        return body.innerHTML === '<br>' ? '' : body.innerHTML;
    }

    private moveChildNodes(from: Element, to: Element): void {
        while (from.firstChild) {
            to.appendChild(from.firstChild);
        }
    }

    // ============================================================================
    // Caret Preservation & Bookmark Snapshots
    // ============================================================================
    /**
     * Gets the HTML of the editor with temporary selection bookmark nodes injected.
     */
    private getSnapshotHTML(): string {
        if (this.isSourceMode) {
            return this.formatOutputHTML(sanitizeHTML(this.sourceCodeEl.value));
        }

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !this.editorAreaEl.contains(sel.anchorNode)) {
            return this.editorAreaEl.innerHTML;
        }

        const range = sel.getRangeAt(0);
        
        const startBookmark = document.createElement('span');
        startBookmark.className = 'inkflow-bookmark';
        startBookmark.id = 'inkflow-bookmark-start';
        startBookmark.style.display = 'none';
        
        const endBookmark = document.createElement('span');
        endBookmark.className = 'inkflow-bookmark';
        endBookmark.id = 'inkflow-bookmark-end';
        endBookmark.style.display = 'none';

        try {
            // End bookmark inserted first to avoid offset shifting
            const endRange = range.cloneRange();
            endRange.collapse(false);
            endRange.insertNode(endBookmark);

            const startRange = range.cloneRange();
            startRange.collapse(true);
            startRange.insertNode(startBookmark);
        } catch {
            // Fallback if insertion fails in edge cases (e.g. read-only elements)
            return this.editorAreaEl.innerHTML;
        }

        const html = this.editorAreaEl.innerHTML;

        // Clean up bookmark nodes from the live DOM immediately
        startBookmark.remove();
        endBookmark.remove();
        this.editorAreaEl.normalize();

        return html;
    }

    /**
     * Sets the HTML of the editor and restores caret selection from bookmarked tags.
     */
    private restoreSnapshot(html: string): void {
        if (this.isSourceMode) {
            const formattedHtml = this.formatOutputHTML(sanitizeHTML(html));
            this.sourceCodeEl.value = formattedHtml;
            this.editorAreaEl.innerHTML = this.parseEmojiHTML(formattedHtml);
            this.sourceCodeEl.focus();
            return;
        }

        this.editorAreaEl.innerHTML = html;

        const startBookmark = this.editorAreaEl.querySelector('#inkflow-bookmark-start');
        const endBookmark = this.editorAreaEl.querySelector('#inkflow-bookmark-end');

        if (startBookmark && endBookmark) {
            const range = document.createRange();
            
            try {
                range.setStartAfter(startBookmark);
                range.setEndBefore(endBookmark);

                startBookmark.remove();
                endBookmark.remove();

                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } catch {
                // Fallback cleanup if range building fails
                if (startBookmark) startBookmark.remove();
                if (endBookmark) endBookmark.remove();
            }
        } else {
            if (startBookmark) startBookmark.remove();
            if (endBookmark) endBookmark.remove();
        }

        this.editorAreaEl.normalize();
        this.editorAreaEl.focus();
    }

    // ============================================================================
    // Status Bar & Metrics Helpers
    // ============================================================================
    /**
     * Updates word and character counts in the status bar.
     */
    private updateStatusBar(): void {
        if (!this.statusBarEl) return;

        const modeEl = this.statusBarEl.querySelector('.inkflow-status-mode');
        const statsEl = this.statusBarEl.querySelector('.inkflow-status-stats');

        if (modeEl) {
            modeEl.textContent = this.isSourceMode ? 'HTML Source' : 'Visual Editor';
        }

        if (statsEl) {
            const text = this.getText();
            const charCount = text.length;
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            statsEl.textContent = `Words: ${wordCount} | Characters: ${charCount}`;
        }
    }

    /**
     * Briefly flashes a message inside the status bar (e.g. "Saved").
     */
    private setStatusMessage(msg: string, duration: number = 1500): void {
        if (!this.statusBarEl) return;
        const msgEl = this.statusBarEl.querySelector('.inkflow-status-message');
        if (msgEl) {
            msgEl.textContent = msg;
            msgEl.classList.add('is-active');
            if (this.statusMessageTimeout) {
                window.clearTimeout(this.statusMessageTimeout);
                this.statusMessageTimeout = null;
            }
            if (duration > 0) {
                this.statusMessageTimeout = window.setTimeout(() => {
                    this.statusMessageTimeout = null;
                    if (msgEl && msgEl.textContent === msg) {
                        msgEl.textContent = 'Ready';
                        msgEl.classList.remove('is-active');
                    }
                }, duration);
            }
        }
    }
}

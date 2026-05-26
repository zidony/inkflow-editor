import { InkflowOptions, EditorInstance } from '../types/index';
import { EventEmitter } from './emitter';
/**
 * Core InkflowEditor Class
 * Implements a lightweight, visual WYSIWYG editor with Markdown shortcuts and source code viewing.
 */
export declare class InkflowEditor extends EventEmitter implements EditorInstance {
    private options;
    private theme;
    private locale;
    private containerEl;
    private wrapperEl;
    private toolbarEl;
    private editorAreaEl;
    private sourceCodeEl;
    private isSourceMode;
    private toolbarInstance;
    private history;
    private historyTimeout;
    private savedRange;
    /**
     * Initializes a new instance of the InkflowEditor.
     * @param options Configuration options for the editor.
     */
    constructor(options: InkflowOptions);
    /**
     * Bootstraps the DOM structure for the editor.
     */
    private initDOM;
    private createWrapper;
    private createToolbar;
    private createEditorArea;
    private createSourceArea;
    private initializeToolbar;
    /**
     * Retrieves the current HTML content of the editor.
     * @returns The formatted HTML string.
     */
    getHTML(): string;
    /**
     * Retrieves the plain text content of the editor.
     * @returns The plain text string.
     */
    getText(): string;
    /**
     * Sets the HTML content of the editor programmatically.
     * @param html The HTML string to inject.
     */
    setHTML(html: string): void;
    /**
     * Triggers an immediate history snapshot save.
     */
    saveHistoryNow(): void;
    /**
     * Destroys the editor instance and cleans up the DOM.
     */
    destroy(): void;
    /**
     * Binds native DOM events and custom widget events.
     */
    private bindEvents;
    private handleSelectionSave;
    private handleKeyboardEvent;
    private handleShortcuts;
    private handlePasteEvent;
    private handleDropEvent;
    private processImageUpload;
    private handleCustomCommand;
    private toggleSourceMode;
    private toggleFullscreen;
    private insertCodeBlock;
    private insertTable;
    private debounceSaveHistory;
    private performUndo;
    private performRedo;
    /**
     * Intercepts spacebar presses to execute Markdown-like formatting.
     */
    private checkMarkdownRules;
    /**
     * Cleans up pasted HTML to prevent XSS and strip unwanted styles.
     * @param dirtyHtml The raw HTML string.
     * @returns A sanitized HTML string.
     */
    private sanitizeHTML;
    /**
     * Processes editor HTML to ensure standard tags (e.g., strong instead of b)
     * and removes empty formatting blocks.
     * @param html The raw editor HTML.
     * @returns Formatted HTML string.
     */
    private formatOutputHTML;
}

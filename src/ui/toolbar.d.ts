import { ThemeClasses, InkflowOptions, LocaleDict } from '../types/index';
/**
 * Toolbar Component
 * Manages the creation, state, and event dispatching for the editor toolbar.
 */
export declare class Toolbar {
    private container;
    private editorArea;
    private theme;
    private config;
    private locale;
    private hooks?;
    private buttonElements;
    private headingSelectEl;
    /**
     * Initializes the Toolbar and renders it into the container.
     */
    constructor(container: HTMLElement, editorArea: HTMLElement, theme: ThemeClasses, config: Array<string | string[]>, locale: LocaleDict, hooks?: InkflowOptions['hooks']);
    /**
     * Parses the 2D configuration array and renders DOM elements accordingly.
     */
    private render;
    private createHeadingSelect;
    private createButton;
    /**
     * Synchronizes the UI state (active classes, select values) with the current cursor position.
     */
    updateState(): void;
    private syncHeadingSelect;
    private syncButtonsState;
    /**
     * Central command dispatcher that routes commands to native execCommand or custom events.
     */
    private executeCommand;
    private handleInsertLink;
    private handleInsertImage;
    private handleInsertVideo;
    private saveSelection;
    private restoreSelection;
    private postAsyncCommand;
    private createTablePickerButton;
    private buildTableGrid;
    private bindTablePickerEvents;
}

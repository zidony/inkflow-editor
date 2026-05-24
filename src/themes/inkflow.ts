import type { ThemeClasses } from '../types/index';

/**
 * Inkflow Native Theme configuration.
 * Uses BEM naming convention to remain completely independent of external CSS frameworks like Bootstrap.
 */
export const inkflowTheme: ThemeClasses = {
    // Optional outer wrapper if you want to apply grid layout like .ink-editor-layout
    container: 'inkflow-container',

    // Toolbar wrapper
    toolbar: 'inkflow-toolbar',

    // Group separator line/wrapper
    toolbarGroup: 'inkflow-toolbar-group',

    // Standard button
    button: 'inkflow-btn',

    // Active state for button (e.g., when text is bold)
    buttonActive: 'is-active',

    // Dropdown select for headings
    select: 'inkflow-select',

    // The actual contenteditable area
    editorArea: 'inkflow-editor-body'
};

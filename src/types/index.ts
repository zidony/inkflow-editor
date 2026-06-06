/**
 * Language dictionary interface for editor localization.
 */
export interface LocaleDict {
    toolbar: Record<string, string>;
    emojiCategories?: Record<string, string>;
    prompts: {
        linkUrl: string;
        imageUrl: string;
        videoUrl: string;
        linkDefault: string;
    };
}

/**
 * Theme dictionary mapping for UI elements.
 * Uses BEM naming convention internally.
 */
export interface ThemeClasses {
    container: string;
    toolbar: string;
    toolbarGroup: string;
    button: string;
    buttonActive: string;
    select: string;
    editorArea: string;
}

/**
 * Optional emoji integration contract.
 * The core editor depends on this small interface instead of bundling emoji data by default.
 */
export interface EmojiExtension {
    parseHTML?: (html: string) => string;
    mountPicker: (options: {
        wrapper: HTMLElement;
        button: HTMLElement;
        theme: ThemeClasses;
        locale: LocaleDict;
        cleanup: Array<() => void>;
        onSelect: (emoji: string, src: string) => void;
    }) => void;
}

/**
 * Configuration options for initializing the InkflowEditor.
 */
export interface InkflowOptions {
    /** The DOM element or selector string to attach the editor to. */
    container: HTMLElement | string;
    /** The theme configuration, either a preset string or a custom class map. */
    theme?: 'inkflow' | ThemeClasses;
    /** The size variant of the editor. */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Toolbar layout configuration.
     * Can be a 1D array of item names or a 2D array for logical grouping.
     */
    toolbar?: Array<string | string[]>;
    /** Placeholder text displayed when the editor is empty. */
    placeholder?: string;
    /** Interface language (e.g., 'en-US', 'zh-CN') or a custom LocaleDict object. */
    lang?: 'en-US' | 'zh-CN' | LocaleDict;
    /** Custom CSS height for the editor container. */
    height?: string;
    /** Optional emoji extension. Import it from `inkflow-editor/emoji` when needed. */
    emoji?: EmojiExtension;

    /**
     * Lifecycle and action hooks for external integration.
     */
    hooks?: {
        /** Hook invoked when inserting a link. Should resolve to a URL or null. */
        onInsertLink?: () => Promise<string | null>;
        /** Hook invoked when inserting an image. Should resolve to a URL or null. */
        onInsertImage?: () => Promise<string | null>;
        /** Hook invoked when a raw image file is pasted or dropped. Should resolve to a URL or null. */
        onUploadImage?: (file: File) => Promise<string | null>;
        /** Hook invoked when inserting a video. Should resolve to a URL or null. */
        onInsertVideo?: () => Promise<string | null>;
    };
}

/**
 * Public Editor API Instance.
 */
export interface EditorInstance {
    /** Returns the current raw HTML content of the editor. */
    getHTML(): string;
    /** Returns the plain text representation of the editor's content. */
    getText(): string;
    /** Programmatically sets the HTML content of the editor. */
    setHTML(html: string): void;
    /** Completely removes the editor from the DOM and cleans up resources. */
    destroy(): void;

    // Event Bus
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}

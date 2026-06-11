import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const generatedTypesDir = path.join(distDir, 'src');

const publicTypes = `/**
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

export type ToolbarMode = 'full' | 'basic';
export type ToolbarLayout = Array<string | string[]>;

/**
 * Configuration options for initializing the editor.
 */
export interface InkflowOptions {
    container: HTMLElement | string;
    theme?: 'inkflow' | ThemeClasses;
    size?: 'sm' | 'md' | 'lg';
    toolbarMode?: ToolbarMode;
    toolbar?: ToolbarLayout;
    placeholder?: string;
    lang?: 'en-US' | 'zh-CN' | LocaleDict;
    height?: string;
    emoji?: EmojiExtension;
    hooks?: {
        onInsertLink?: () => Promise<string | null>;
        onInsertImage?: () => Promise<string | null>;
        onUploadImage?: (file: File) => Promise<string | null>;
        onInsertVideo?: () => Promise<string | null>;
    };
}

/**
 * Public editor instance API.
 */
export interface EditorInstance {
    getHTML(): string;
    getText(): string;
    setHTML(html: string): void;
    saveHistoryNow(): void;
    destroy(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
}

export declare const inkflowTheme: ThemeClasses;

export declare class InkflowEditor implements EditorInstance {
    constructor(options: InkflowOptions);
    getHTML(): string;
    getText(): string;
    setHTML(html: string): void;
    saveHistoryNow(): void;
    destroy(): void;
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, ...args: unknown[]): void;
}
`;

const emojiTypes = `import type { EmojiExtension } from './index';

/**
 * Creates the optional emoji extension.
 * Import this entry only when the emoji picker should be included in the bundle.
 */
export declare function emojiExtension(): EmojiExtension;
export { emojiExtension as createEmojiExtension };
`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'index.d.ts'), publicTypes);
fs.writeFileSync(path.join(distDir, 'emoji.d.ts'), emojiTypes);

if (fs.existsSync(generatedTypesDir)) {
    fs.rmSync(generatedTypesDir, { recursive: true, force: true });
}

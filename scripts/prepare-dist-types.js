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

export interface EmojiCategory {
    id: string;
    name: string;
    icon: string;
    emojis: string[];
}

export interface EmojiLocale {
    ui: {
        title: string;
        recent: string;
        recentEmpty: string;
    };
    categories: Record<string, string>;
    names: Record<string, string>;
}

export interface EmojiSelectPayload {
    char: string;
    name: string;
    src: string;
}

export interface EmojiPickerOptions {
    container?: HTMLElement;
    locale?: 'zh-CN' | 'en-US' | EmojiLocale;
    assetBase?: string;
    categories?: EmojiCategory[];
    recent?: false | { max?: number; storageKey?: string };
    closeOnSelect?: boolean;
    onSelect: (payload: EmojiSelectPayload) => void;
}

export declare class EmojiPickerInstance {
    constructor(options: EmojiPickerOptions);
    open(anchor?: HTMLElement): void;
    close(): void;
    toggle(anchor?: HTMLElement): void;
    isOpen(): boolean;
    switchTab(tabId: string): void;
    destroy(): void;
}

export declare function createEmojiPicker(options: EmojiPickerOptions): EmojiPickerInstance;
export declare function bindEmojiPicker(
    buttonEl: HTMLElement,
    options: Omit<EmojiPickerOptions, 'container'> & { container?: HTMLElement }
): EmojiPickerInstance;

export interface ParseEmojiOptions {
    assetBase?: string;
    className?: string;
    onlyKnown?: boolean;
}

export declare function parseEmoji(root: HTMLElement, options?: ParseEmojiOptions): void;
export declare function emojiToHTML(textOrHtml: string, options?: ParseEmojiOptions): string;
export declare function resolveAssetBase(customBase?: string): string;
export declare const DEFAULT_EMOJI_ASSET_BASE: string;
export declare function toCodePoint(unicodeSurrogates: string, sep?: string): string;
export declare function getEmojiSvgUrl(emoji: string, assetBase: string): string;

export declare const emojiCategories: EmojiCategory[];
export declare const allEmojiChars: string[];
export declare const allEmojiCharSet: Set<string>;

export declare const zhCN: EmojiLocale;
export declare const enUS: EmojiLocale;

export interface EmojiExtensionOptions extends Partial<ParseEmojiOptions> {
    pickerOptions?: Partial<EmojiPickerOptions>;
}

export declare function emojiExtension(options?: EmojiExtensionOptions): EmojiExtension;
export { emojiExtension as createEmojiExtension };
`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'index.d.ts'), publicTypes);
fs.writeFileSync(path.join(distDir, 'emoji.d.ts'), emojiTypes);

// Copy standalone emoji.css and svg assets to dist
const emojiCssSrc = path.join(process.cwd(), 'src', 'emoji', 'emoji.css');
if (fs.existsSync(emojiCssSrc)) {
    fs.copyFileSync(emojiCssSrc, path.join(distDir, 'inkflow-editor-emoji.css'));
}

const svgSrcDir = path.join(process.cwd(), 'src', 'emoji', 'assets', 'svg');
const svgDistDir = path.join(distDir, 'emoji', 'svg');
if (fs.existsSync(svgSrcDir)) {
    fs.mkdirSync(svgDistDir, { recursive: true });
    const files = fs.readdirSync(svgSrcDir);
    for (const f of files) {
        fs.copyFileSync(path.join(svgSrcDir, f), path.join(svgDistDir, f));
    }
}

if (fs.existsSync(generatedTypesDir)) {
    fs.rmSync(generatedTypesDir, { recursive: true, force: true });
}


import { getEmojiSvgUrl } from './codepoint';
import { allEmojiCharSet } from './data';

export interface ParseEmojiOptions {
    /** Base URL of the directory where emoji SVGs are hosted */
    assetBase?: string;
    /** Custom class for rendered <img> elements (defaults to 'inkflow-emoji') */
    className?: string;
    /** If true, only emojis present in the built-in dataset are replaced with images (defaults to true) */
    onlyKnown?: boolean;
}

// Regex to match unicode emojis (including surrogate pairs, joiners, and variation selectors)
const EMOJI_REGEX = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F004}-\u{1F0CF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25FD}\u{25FE}\u{2122}\u{00A9}\u{00AE}](?:\uFE0F|\u200D[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25FD}\u{25FE}\u{2122}\u{00A9}\u{00AE}\u{FE0F}]*)*/gu;

/**
 * Resolves the default assetBase.
 * In browser UMD contexts, tries to infer from currentScript location;
 * otherwise defaults to '/static/ytcms/inkflow-editor/emoji/svg/'.
 */
export function resolveAssetBase(customBase?: string): string {
    if (customBase) {
        return customBase.endsWith('/') ? customBase : `${customBase}/`;
    }

    if (typeof document !== 'undefined') {
        const currentScript = document.currentScript as (HTMLScriptElement | null);
        if (currentScript && currentScript.src) {
            try {
                const url = new URL(currentScript.src);
                const pathParts = url.pathname.split('/');
                pathParts.pop(); // remove script name
                return `${url.origin}${pathParts.join('/')}/emoji/svg/`;
            } catch {
                // fall through
            }
        }
    }

    return '/static/ytcms/inkflow-editor/emoji/svg/';
}

/**
 * Replaces Unicode emoji characters in an HTML string with Twemoji <img> tags.
 */
export function emojiToHTML(textOrHtml: string, options: ParseEmojiOptions = {}): string {
    const assetBase = resolveAssetBase(options.assetBase);
    const className = options.className || 'inkflow-emoji';
    const onlyKnown = options.onlyKnown !== false;

    return textOrHtml.replace(EMOJI_REGEX, match => {
        if (onlyKnown && !allEmojiCharSet.has(match)) {
            return match;
        }

        const src = getEmojiSvgUrl(match, assetBase);
        return `<img class="${className}" alt="${match}" src="${src}" loading="lazy" draggable="false">`;
    });
}

/**
 * Traverses text nodes in a DOM element and replaces Unicode emojis with Twemoji <img> elements.
 * Skips script, style, textarea, input, pre, code, and contenteditable elements to avoid breaking inputs.
 */
export function parseEmoji(root: HTMLElement, options: ParseEmojiOptions = {}): void {
    if (!root || typeof document === 'undefined') return;

    const assetBase = resolveAssetBase(options.assetBase);
    const className = options.className || 'inkflow-emoji';
    const onlyKnown = options.onlyKnown !== false;

    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'PRE', 'CODE']);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node: Node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (ignoredTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
            if (parent.closest('.inkflow-emoji-picker')) return NodeFilter.FILTER_REJECT;

            EMOJI_REGEX.lastIndex = 0;
            return EMOJI_REGEX.test(node.nodeValue || '')
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
        }
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
        textNodes.push(current as Text);
        current = walker.nextNode();
    }

    textNodes.forEach(textNode => {
        const text = textNode.nodeValue || '';
        EMOJI_REGEX.lastIndex = 0;
        if (!EMOJI_REGEX.test(text)) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        EMOJI_REGEX.lastIndex = 0;

        let match: RegExpExecArray | null;
        while ((match = EMOJI_REGEX.exec(text)) !== null) {
            const matchIndex = match.index;
            const emojiChar = match[0];

            if (matchIndex > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(text.substring(lastIndex, matchIndex))
                );
            }

            if (onlyKnown && !allEmojiCharSet.has(emojiChar)) {
                fragment.appendChild(document.createTextNode(emojiChar));
            } else {
                const img = document.createElement('img');
                img.className = className;
                img.alt = emojiChar;
                img.src = getEmojiSvgUrl(emojiChar, assetBase);
                img.loading = 'lazy';
                img.draggable = false;
                img.addEventListener('error', () => {
                    const fallbackText = document.createTextNode(emojiChar);
                    img.replaceWith(fallbackText);
                });
                fragment.appendChild(img);
            }

            lastIndex = matchIndex + emojiChar.length;
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        textNode.replaceWith(fragment);
    });
}

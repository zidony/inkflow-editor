import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    resolveAssetBase,
    DEFAULT_EMOJI_ASSET_BASE,
    toCodePoint,
    getEmojiSvgUrl,
    emojiToHTML,
    parseEmoji,
    allEmojiCharSet
} from '../src/emoji';

describe('Emoji Module', () => {
    describe('resolveAssetBase', () => {
        it('should use explicitly provided customBase and append trailing slash', () => {
            expect(resolveAssetBase('/custom/path')).toBe('/custom/path/');
            expect(resolveAssetBase('/custom/path/')).toBe('/custom/path/');
            expect(resolveAssetBase('https://cdn.example.com/svg')).toBe('https://cdn.example.com/svg/');
        });

        it('should fall back to standard twemoji CDN when no customBase is provided', () => {
            const resolved = resolveAssetBase();
            expect(resolved).toBe(DEFAULT_EMOJI_ASSET_BASE);
            expect(resolved).toContain('jsdelivr.net');
            expect(resolved.endsWith('/')).toBe(true);
        });
    });

    describe('toCodePoint & getEmojiSvgUrl', () => {
        it('should convert simple emojis to hex code point', () => {
            expect(toCodePoint('😀')).toBe('1f600');
            expect(toCodePoint('🐱')).toBe('1f431');
        });

        it('should handle variation selectors and zwj sequences', () => {
            // Heart has variation selector stripped if fe0f
            expect(toCodePoint('❤️')).toBe('2764');
            // Heart on fire
            expect(toCodePoint('❤️‍🔥')).toBe('2764-fe0f-200d-1f525');
        });

        it('should generate correct SVG url with given assetBase', () => {
            const url = getEmojiSvgUrl('😀', 'https://cdn.example.com/svg/');
            expect(url).toBe('https://cdn.example.com/svg/1f600.svg');
        });
    });

    describe('emojiToHTML', () => {
        it('should replace known unicode emojis with img tags', () => {
            const html = emojiToHTML('Hello 😀 World ❤️‍🔥', { assetBase: 'https://cdn.example.com/svg/' });
            expect(html).toContain('<img class="inkflow-emoji" alt="😀" src="https://cdn.example.com/svg/1f600.svg"');
            expect(html).toContain('alt="❤️‍🔥"');
        });

        it('should leave unknown emojis intact when onlyKnown is true', () => {
            // A character not in our 221 curated list
            const customChar = '🦤'; // Dodo bird
            if (!allEmojiCharSet.has(customChar)) {
                const html = emojiToHTML(`A bird ${customChar}`, { onlyKnown: true });
                expect(html).toBe(`A bird ${customChar}`);
            }
        });
    });

    describe('parseEmoji DOM traversal', () => {
        let container: HTMLElement;

        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            container.remove();
        });

        it('should replace text emojis inside elements', () => {
            container.innerHTML = '<p>Great job 👍!</p>';
            parseEmoji(container, { assetBase: '/test/svg/' });
            const img = container.querySelector('img');
            expect(img).not.toBeNull();
            expect(img?.alt).toBe('👍');
            expect(img?.src).toContain('/test/svg/1f44d.svg');
        });

        it('should skip code and pre blocks', () => {
            container.innerHTML = '<pre>Code with 👍</pre><code>Inline 👍</code>';
            parseEmoji(container);
            expect(container.querySelectorAll('img').length).toBe(0);
        });
    });
});

/**
 * Converts a Unicode emoji string to its Twemoji code point filename (without .svg).
 *
 * Twemoji file naming conventions:
 * 1. For standard single emojis, variation selector 16 (U+FE0F) is omitted (e.g. 2764-fe0f -> 2764).
 * 2. When a Zero Width Joiner (ZWJ, U+200D) sequence is present, FE0F is preserved
 *    (e.g. 1f926-200d-2642-fe0f for 🤦‍♂️).
 */
export function toCodePoint(unicodeSurrogates: string, sep: string = '-'): string {
    const r: string[] = [];
    let c = 0;
    let p = 0;
    let i = 0;

    while (i < unicodeSurrogates.length) {
        c = unicodeSurrogates.charCodeAt(i++);
        if (p) {
            r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
            p = 0;
        } else if (0xd800 <= c && c <= 0xdbff) {
            p = c;
        } else {
            r.push(c.toString(16));
        }
    }

    const hasZWJ = r.includes('200d');
    const filtered = hasZWJ ? r : r.filter(x => x !== 'fe0f');
    return filtered.join(sep);
}

/**
 * Returns the full SVG URL for an emoji character given an assetBase.
 */
export function getEmojiSvgUrl(emoji: string, assetBase: string): string {
    const normalizedBase = assetBase.endsWith('/') ? assetBase : `${assetBase}/`;
    return `${normalizedBase}${toCodePoint(emoji)}.svg`;
}


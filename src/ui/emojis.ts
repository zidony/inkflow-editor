export interface EmojiCategory {
    id: string;
    name: string;
    emojis: string[];
}

// Import all SVG urls from assets eagerly.
export const emojiAssets = import.meta.glob('../assets/emojis/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/**
 * Converts a Unicode emoji string to its Twemoji code point.
 * e.g., "😀" -> "1f600"
 */
export function toCodePoint(unicodeSurrogates: string, sep: string = '-'): string {
    const r = [];
    let c = 0, p = 0, i = 0;
    while (i < unicodeSurrogates.length) {
        c = unicodeSurrogates.charCodeAt(i++);
        if (p) {
            r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
            p = 0;
        } else if (0xD800 <= c && c <= 0xDBFF) {
            p = c;
        } else {
            r.push(c.toString(16));
        }
    }
    // Remove variation selector 16 (U+FE0F) as Twemoji filenames mostly omit it,
    // except in specific zero-width-joiner sequences.
    return r.filter(x => x !== 'fe0f').join(sep);
}

export const emojiData: EmojiCategory[] = [
    {
        id: 'emotion',
        name: '表情',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
            '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
            '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
            '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
            '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
            '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
            '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
            '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞'
        ]
    },
    {
        id: 'gesture',
        name: '人物',
        emojis: [
            '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟',
            '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎',
            '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
            '✍', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
            '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '👶', '🧒',
            '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵'
        ]
    },
    {
        id: 'symbols',
        name: '符号',
        emojis: [
            '❤', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔',
            '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💯', '💢', '💥',
            '💫', '💦', '💨', '🔥', '✨', '🌟', '⭐', '🎵', '🎶', '💤',
            '✅', '✔️', '☑️', '❌', '✖️', '❎', '➕', '➖', '➗', '❗',
            '❓', '❕', '❔', '⚠️', '⛔', '🚫', '🔴', '🟠', '🟡', '🟢',
            '🔵', '🟣', '⚫', '⚪', '⬛', '⬜', '⬆️', '⬇️', '⬅️', '➡️'
        ]
    },
    {
        id: 'items',
        name: '物品',
        emojis: [
            '⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹',
            '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
            '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚',
            '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋',
            '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴',
            '💶', '💷', '💰', '💳', '💎', '⚖', '🧰', '🔧', '🔨', '⚒',
            '🎉', '🎊', '🎈', '🎂', '🎀', '🎁', '🎇', '🎆', '🧨', '🧧'
        ]
    },
    {
        id: 'nature',
        name: '自然',
        emojis: [
            '🙈', '🙉', '🙊', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮',
            '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆',
            '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷',
            '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘', '🍀', '🍁', '🍂',
            '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐',
            '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍',
            '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢'
        ]
    }
];

// Regex to match emoji characters (very simplified covering typical surrogate pairs for our subset)
// A more robust regex can be used, but this matches surrogate pairs and typical symbols
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F004}-\u{1F0CF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25FD}\u{25FE}\u{2122}\u{00A9}\u{00AE}]/gu;

export function parseEmojisToHTML(textOrHtml: string): string {
    return textOrHtml.replace(emojiRegex, (match) => {
        const codePoint = toCodePoint(match);
        const assetPath = `../assets/emojis/${codePoint}.svg`;
        const src = emojiAssets[assetPath];
        if (src) {
            return `<img src="${src}" alt="${match}" class="inkflow-emoji" loading="lazy" draggable="false">`;
        }
        return match; // return original if we don't have the svg
    });
}

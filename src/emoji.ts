import type { EmojiExtension } from './types/index';
import { EmojiPicker } from './ui/emoji-picker';
import { parseEmojisToHTML } from './ui/emojis';

/**
 * Creates the optional emoji extension.
 * Import this entry only when the emoji picker should be included in the bundle.
 */
export function emojiExtension(): EmojiExtension {
    return {
        parseHTML: parseEmojisToHTML,
        mountPicker: ({ wrapper, button, theme, locale, cleanup, onSelect }) => {
            new EmojiPicker(wrapper, button, theme, locale, cleanup, onSelect);
        }
    };
}

export { emojiExtension as createEmojiExtension };

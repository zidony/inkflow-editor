// Core exports
export {
    createEmojiPicker,
    bindEmojiPicker,
    EmojiPickerInstance,
    type EmojiPickerOptions,
    type EmojiSelectPayload
} from './picker';

export {
    parseEmoji,
    emojiToHTML,
    resolveAssetBase,
    DEFAULT_EMOJI_ASSET_BASE,
    type ParseEmojiOptions
} from './renderer';

export { toCodePoint, getEmojiSvgUrl } from './codepoint';

export {
    emojiCategories,
    allEmojiChars,
    allEmojiCharSet,
    type EmojiCategory
} from './data';

export { zhCN, type EmojiLocale } from './locales/zh-CN';
export { enUS } from './locales/en-US';

// Inkflow Editor extension integration
export {
    emojiExtension,
    emojiExtension as createEmojiExtension,
    type EmojiExtensionOptions
} from './adapter';


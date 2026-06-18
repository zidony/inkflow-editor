import type { LocaleDict } from '../types/index';

export const enUS: LocaleDict = {
    toolbar: {
        // Basic Formatting
        normal: 'Normal',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        h4: 'Heading 4',
        h5: 'Heading 5',
        h6: 'Heading 6',

        // Inline Styles
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strike: 'Strikethrough',
        inlineCode: 'Inline Code',
        eraser: 'Clear Formatting',

        // Alignment
        alignLeft: 'Align Left',
        alignCenter: 'Align Center',
        alignRight: 'Align Right',

        // Lists
        listUl: 'Unordered List',
        listOl: 'Ordered List',

        // Media and Blocks
        link: 'Insert Link',
        image: 'Insert Image',
        video: 'Insert Video',
        codeBlock: 'Code Block',
        blockquote: 'Blockquote',
        table: 'Insert Table',
        divider: 'Divider',

        // History and View
        undo: 'Undo',
        redo: 'Redo',
        sourceCode: 'Source Code',
        fullscreen: 'Fullscreen',
        emoji: 'Emoji'
    },
    emojiCategories: {
        '表情': 'Smileys',
        '人物': 'People',
        '符号': 'Symbols',
        '物品': 'Objects',
        '自然': 'Nature'
    },
    status: {
        visualMode: 'Visual Editor',
        sourceMode: 'HTML Source',
        words: 'Words',
        characters: 'Characters',
        ready: 'Ready',
        saved: 'Saved',
        editing: 'Editing...',
        undo: 'Undo',
        redo: 'Redo',
        imageUploading: 'Image uploading...',
        uploadNotConfigured: 'Image upload is not configured'
    },
    prompts: {
        linkUrl: 'Enter link URL:',
        imageUrl: 'Enter image URL:',
        videoUrl: 'Enter video URL (e.g., MP4 or YouTube iframe):',
        linkDefault: 'https://'
    }
};

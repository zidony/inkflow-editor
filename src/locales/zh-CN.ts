import type { LocaleDict } from '../types/index';

export const zhCN: LocaleDict = {
    toolbar: {
        // Basic Formatting
        normal: '正文',
        h1: '标题 1',
        h2: '标题 2',
        h3: '标题 3',
        h4: '标题 4',
        h5: '标题 5',
        h6: '标题 6',

        // Inline Styles
        bold: '粗体',
        italic: '斜体',
        underline: '下划线',
        strike: '删除线',
        inlineCode: '行内代码',
        eraser: '清除格式',

        // Alignment
        alignLeft: '左对齐',
        alignCenter: '居中对齐',
        alignRight: '右对齐',

        // Lists
        listUl: '无序列表',
        listOl: '有序列表',

        // Media and Blocks
        link: '插入链接',
        image: '插入图片',
        video: '插入视频',
        codeBlock: '插入代码块',
        blockquote: '引用块',
        table: '插入表格',
        divider: '插入分割线',

        // History and View
        undo: '撤销',
        redo: '重做',
        sourceCode: '源码模式',
        fullscreen: '全屏',
        emoji: '表情',

        // Table context actions
        tableTools: '表格操作',
        rowAbove: '在上方插入行',
        rowBelow: '在下方插入行',
        colLeft: '在左侧插入列',
        colRight: '在右侧插入列',
        deleteRow: '删除行',
        deleteCol: '删除列',
        deleteTable: '删除表格'
    },
    emojiCategories: {
        '表情': '表情',
        '人物': '人物',
        '符号': '符号',
        '物品': '物品',
        '自然': '自然'
    },
    status: {
        visualMode: '可视编辑',
        sourceMode: 'HTML 源码',
        words: '词数',
        characters: '字符',
        ready: '就绪',
        saved: '已保存',
        editing: '编辑中...',
        undo: '撤销',
        redo: '重做',
        imageUploading: '图片上传中...',
        uploadNotConfigured: '未配置图片上传'
    },
    prompts: {
        linkUrl: '请输入链接地址:',
        imageUrl: '请输入图片地址:',
        videoUrl: '请输入视频链接 (如 MP4 或 B站 iframe):',
        linkDefault: 'https://'
    }
};

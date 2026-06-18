import { afterEach, describe, expect, it } from 'vitest';
import { InkflowEditor } from '../src/core/editor';
import type { InkflowOptions } from '../src/types';

function createEditor(
    html = '',
    options: Partial<Omit<InkflowOptions, 'container'>> = {}
): { container: HTMLElement; editor: InkflowEditor } {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;
    const editor = new InkflowEditor({ container, lang: 'en-US', ...options });
    return { container, editor };
}

function statsText(container: HTMLElement): string {
    return container.querySelector('.inkflow-status-stats')?.textContent || '';
}

function modeText(container: HTMLElement): string {
    return container.querySelector('.inkflow-status-mode')?.textContent || '';
}

describe('InkflowEditor status bar i18n', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders English status labels by default', () => {
        const { container, editor } = createEditor('<p>Hello world</p>', { lang: 'en-US' });

        expect(modeText(container)).toBe('Visual Editor');
        expect(statsText(container)).toBe('Words: 2 | Characters: 10');
        editor.destroy();
    });

    it('renders Chinese status labels for zh-CN', () => {
        const { container, editor } = createEditor('<p>你好世界</p>', { lang: 'zh-CN' });

        expect(modeText(container)).toBe('可视编辑');
        expect(statsText(container)).toBe('词数: 4 | 字符: 4');
        editor.destroy();
    });

    it('counts mixed CJK and Latin content correctly', () => {
        const { container, editor } = createEditor('<p>你好 hello world 世界</p>', { lang: 'en-US' });

        // 4 CJK ideographs + 2 Latin words
        expect(statsText(container)).toBe('Words: 6 | Characters: 14');
        editor.destroy();
    });

    it('falls back to English for a custom locale missing the status block', () => {
        const { container, editor } = createEditor('<p>Hi</p>', {
            lang: {
                toolbar: {},
                prompts: { linkUrl: '', imageUrl: '', videoUrl: '', linkDefault: '' }
            }
        });

        expect(modeText(container)).toBe('Visual Editor');
        expect(statsText(container)).toBe('Words: 1 | Characters: 2');
        editor.destroy();
    });

    it('reports an empty document as zero words and characters', () => {
        const { container, editor } = createEditor('', { lang: 'en-US' });

        expect(statsText(container)).toBe('Words: 0 | Characters: 0');
        editor.destroy();
    });
});

import { afterEach, describe, expect, it } from 'vitest';
import { InkflowEditor } from '../src/core/editor';
import type { InkflowOptions } from '../src/types';

function createEditor(
    html = '<p>Initial</p>',
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

describe('InkflowEditor public API', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('reports isEmpty for blank and non-blank content', () => {
        const { editor } = createEditor('');
        expect(editor.isEmpty()).toBe(true);

        editor.setHTML('<p>Hello</p>');
        expect(editor.isEmpty()).toBe(false);
        editor.destroy();
    });

    it('clear() empties the content', () => {
        const { editor } = createEditor('<p>Some text</p>');
        editor.clear();

        expect(editor.getHTML()).toBe('');
        expect(editor.isEmpty()).toBe(true);
        editor.destroy();
    });

    it('insertHTML sanitizes and inserts at the caret', () => {
        const { container, editor } = createEditor('<p>Start</p>');
        const body = container.querySelector<HTMLElement>('.inkflow-editor-body');
        const paragraph = body?.querySelector('p') as HTMLParagraphElement;

        const range = document.createRange();
        range.selectNodeContents(paragraph);
        range.collapse(false);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);

        editor.insertHTML('<strong>bold</strong><script>alert(1)</script>');

        expect(editor.getHTML()).toContain('<strong>bold</strong>');
        expect(editor.getHTML()).not.toContain('script');
        editor.destroy();
    });

    it('setReadOnly toggles editability and reports state', () => {
        const { container, editor } = createEditor('<p>Text</p>');
        const body = container.querySelector<HTMLElement>('.inkflow-editor-body');

        expect(editor.isReadOnly()).toBe(false);
        expect(body?.getAttribute('contenteditable')).toBe('true');

        editor.setReadOnly(true);
        expect(editor.isReadOnly()).toBe(true);
        expect(body?.getAttribute('contenteditable')).toBe('false');
        expect(container.querySelector('.inkflow-container.is-readonly')).not.toBeNull();

        editor.setReadOnly(false);
        expect(editor.isReadOnly()).toBe(false);
        expect(body?.getAttribute('contenteditable')).toBe('true');
        editor.destroy();
    });

    it('programmatic undo and redo move through history', () => {
        const { editor } = createEditor('<p>Initial</p>');

        editor.setHTML('<p>Changed</p>');
        editor.undo();
        expect(editor.getHTML()).toBe('<p>Initial</p>');

        editor.redo();
        expect(editor.getHTML()).toBe('<p>Changed</p>');
        editor.destroy();
    });

    it('focus and blur do not throw and target the editor surface', () => {
        const { container, editor } = createEditor('<p>Text</p>');
        const body = container.querySelector<HTMLElement>('.inkflow-editor-body');

        editor.focus();
        expect(document.activeElement).toBe(body);

        editor.blur();
        expect(document.activeElement).not.toBe(body);
        editor.destroy();
    });

    it('ignores API calls after destroy', () => {
        const { container, editor } = createEditor('<p>Text</p>');
        editor.destroy();

        expect(() => {
            editor.insertHTML('<p>x</p>');
            editor.clear();
            editor.setReadOnly(true);
            editor.undo();
            editor.redo();
            editor.focus();
            editor.blur();
        }).not.toThrow();
        expect(container.innerHTML).toBe('');
    });
});

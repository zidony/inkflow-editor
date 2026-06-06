import { afterEach, describe, expect, it, vi } from 'vitest';
import { InkflowEditor } from '../src/core/editor';

function createEditor(html = ''): InkflowEditor {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;
    return new InkflowEditor({ container, lang: 'en-US' });
}

describe('InkflowEditor output normalization', () => {
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('sanitizes HTML passed through setHTML', () => {
        const editor = createEditor();

        editor.setHTML('<p onclick="alert(1)">Safe<script>alert(1)</script></p>');

        expect(editor.getHTML()).toBe('<p>Safe</p>');
        editor.destroy();
    });

    it('standardizes bold and italic tags in output without dropping nested content', () => {
        const editor = createEditor('<p><b>Hello <i>Inkflow</i></b></p>');

        expect(editor.getHTML()).toBe('<p><strong>Hello <em>Inkflow</em></strong></p>');
        editor.destroy();
    });

    it('removes internal bookmarks from output', () => {
        const editor = createEditor(
            '<p>Text<span class="inkflow-bookmark" id="inkflow-bookmark-start"></span></p>'
        );

        expect(editor.getHTML()).toBe('<p>Text</p>');
        editor.destroy();
    });

    it('exports local emoji image nodes as Unicode emoji text', () => {
        const editor = createEditor(
            '<p>Hello <img class="inkflow-emoji" src="/emoji.svg" alt="😀" loading="lazy"></p>'
        );

        expect(editor.getHTML()).toBe('<p>Hello 😀</p>');
        editor.destroy();
    });

    it('removes empty inline formatting nodes from output', () => {
        const editor = createEditor('<p><strong></strong><span> </span><em>Text</em></p>');

        expect(editor.getHTML()).toBe('<p><em>Text</em></p>');
        editor.destroy();
    });

    it('sanitizes source mode HTML when reading through the public API', () => {
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p onclick="alert(1)"><b>Safe</b><script>alert(1)</script></p>';

        expect(editor.getHTML()).toBe('<p><strong>Safe</strong></p>');
        editor.destroy();
    });

    it('reads plain text from sanitized source mode HTML', () => {
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p>Hello <script>alert(1)</script><strong>source</strong></p>';

        expect(editor.getText()).toBe('Hello source');
        editor.destroy();
    });

    it('keeps source mode textarea in sync when setHTML is called', () => {
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }

        editor.setHTML('<p onclick="alert(1)"><b>Updated</b></p>');

        expect(sourceArea.value).toBe('<p><strong>Updated</strong></p>');
        expect(editor.getHTML()).toBe('<p><strong>Updated</strong></p>');
        editor.destroy();
    });

    it('normalizes source mode textarea when switching back to visual mode', () => {
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p onclick="alert(1)"><b>Updated</b><script>alert(1)</script></p>';

        sourceButton?.click();

        expect(sourceArea.value).toBe('<p><strong>Updated</strong></p>');
        expect(editor.getHTML()).toBe('<p><strong>Updated</strong></p>');
        editor.destroy();
    });

    it('emits sanitized source mode changes after textarea input', () => {
        vi.useFakeTimers();
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');
        const changeHandler = vi.fn();

        editor.on('change', changeHandler);
        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p onclick="alert(1)"><b>Changed</b><script>alert(1)</script></p>';
        sourceArea.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(500);

        expect(changeHandler).toHaveBeenLastCalledWith('<p><strong>Changed</strong></p>');
        editor.destroy();
    });

    it('keeps source mode undo and redo synchronized with the textarea', () => {
        vi.useFakeTimers();
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p>Changed</p>';
        sourceArea.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(500);

        sourceArea.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
        expect(sourceArea.value).toBe('<p>Initial</p>');

        sourceArea.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
        expect(sourceArea.value).toBe('<p>Changed</p>');
        editor.destroy();
    });

    it('flushes pending source edits before undo', () => {
        vi.useFakeTimers();
        const editor = createEditor('<p>Initial</p>');
        const sourceButton = document.querySelector<HTMLButtonElement>('[aria-label="Source Code"]');
        const sourceArea = document.querySelector<HTMLTextAreaElement>('.inkflow-source-area');

        sourceButton?.click();
        if (!sourceArea) {
            throw new Error('Source editor fixture was not created.');
        }
        sourceArea.value = '<p>Changed quickly</p>';
        sourceArea.dispatchEvent(new Event('input'));

        sourceArea.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));

        expect(sourceArea.value).toBe('<p>Initial</p>');
        sourceArea.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
        expect(sourceArea.value).toBe('<p>Changed quickly</p>');
        editor.destroy();
    });

    it('does not emit change when setHTML keeps the same normalized content', () => {
        const editor = createEditor('<p><b>Initial</b></p>');
        const changeHandler = vi.fn();

        editor.on('change', changeHandler);
        editor.setHTML('<p><b>Initial</b></p>');

        expect(changeHandler).not.toHaveBeenCalled();
        editor.destroy();
    });
});

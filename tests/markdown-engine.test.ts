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

/**
 * Places the caret at the end of the first paragraph's text node and fires the
 * spacebar keyup that drives the Markdown engine.
 */
function triggerSpaceAtEnd(): void {
    const body = document.querySelector<HTMLElement>('.inkflow-editor-body');
    const textNode = body?.querySelector('p')?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, (textNode.textContent || '').length);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    body?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
}

describe('Markdown engine (DOM-based rules)', () => {
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('converts **text** into a strong element', () => {
        const editor = createEditor('<p>**bold** </p>');
        triggerSpaceAtEnd();

        expect(editor.getHTML()).toContain('<strong>bold</strong>');
        editor.destroy();
    });

    it('converts __text__ into a strong element', () => {
        const editor = createEditor('<p>__bold__ </p>');
        triggerSpaceAtEnd();

        expect(editor.getHTML()).toContain('<strong>bold</strong>');
        editor.destroy();
    });

    it('converts *text* into an em element', () => {
        const editor = createEditor('<p>*italic* </p>');
        triggerSpaceAtEnd();

        expect(editor.getHTML()).toContain('<em>italic</em>');
        editor.destroy();
    });

    it('converts ~~text~~ into a del element', () => {
        const editor = createEditor('<p>~~gone~~ </p>');
        triggerSpaceAtEnd();

        expect(editor.getHTML()).toContain('<del>gone</del>');
        editor.destroy();
    });

    it('converts `text` into an inline code element', () => {
        const editor = createEditor('<p>`snippet` </p>');
        triggerSpaceAtEnd();

        expect(editor.getHTML()).toContain('<code>snippet</code>');
        editor.destroy();
    });

    it('does not transform inline markdown inside a code block', () => {
        const editor = createEditor('<pre><code>**bold** </code></pre>');
        const codeEl = document.querySelector<HTMLElement>('.inkflow-editor-body code');
        const textNode = codeEl?.firstChild as Text;
        const range = document.createRange();
        range.setStart(textNode, (textNode.textContent || '').length);
        range.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        document
            .querySelector<HTMLElement>('.inkflow-editor-body')
            ?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));

        expect(editor.getHTML()).not.toContain('<strong>');
        expect(editor.getHTML()).toContain('**bold**');
        editor.destroy();
    });

    it('converts a --- line into a horizontal rule', () => {
        const editor = createEditor('<p>---</p>');
        const body = document.querySelector<HTMLElement>('.inkflow-editor-body');
        const textNode = body?.querySelector('p')?.firstChild as Text;
        const range = document.createRange();
        range.setStart(textNode, 3);
        range.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        body?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));

        expect(editor.getHTML()).toContain('<hr>');
        editor.destroy();
    });

    it('converts a ``` line into a code block', () => {
        const editor = createEditor('<p>```</p>');
        const body = document.querySelector<HTMLElement>('.inkflow-editor-body');
        const textNode = body?.querySelector('p')?.firstChild as Text;
        const range = document.createRange();
        range.setStart(textNode, 3);
        range.collapse(true);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        body?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));

        expect(editor.getHTML()).toContain('<pre><code>');
        editor.destroy();
    });
});

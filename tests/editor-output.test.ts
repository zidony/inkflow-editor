import { afterEach, describe, expect, it } from 'vitest';
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
});

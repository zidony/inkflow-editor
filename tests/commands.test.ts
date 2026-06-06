import { beforeEach, describe, expect, it } from 'vitest';
import { CommandAdapter } from '../src/core/commands';

function createEditor(html = ''): HTMLElement {
    document.body.innerHTML = '<div id="editor" contenteditable="true"></div>';
    const editor = document.querySelector<HTMLElement>('#editor');
    if (!editor) {
        throw new Error('Editor fixture was not created.');
    }
    editor.innerHTML = html;
    return editor;
}

function selectText(textNode: Text, start: number, end: number): void {
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

function placeCaretAtEnd(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

describe('CommandAdapter', () => {
    beforeEach(() => {
        window.getSelection()?.removeAllRanges();
    });

    it('inserts HTML at the current selection and moves the caret after inserted content', () => {
        const editor = createEditor('<p>Hello world</p>');
        const textNode = editor.querySelector('p')?.firstChild as Text;
        selectText(textNode, 6, 11);

        const commands = new CommandAdapter(editor);
        commands.insertHTML('<strong>Inkflow</strong>');

        expect(editor.innerHTML).toBe('<p>Hello <strong>Inkflow</strong></p>');
        expect(window.getSelection()?.isCollapsed).toBe(true);
    });

    it('appends HTML when the active selection is outside the editor', () => {
        const editor = createEditor('<p>Initial</p>');
        document.body.appendChild(document.createElement('aside'));

        const commands = new CommandAdapter(editor);
        commands.insertHTML('<p>Appended</p>');

        expect(editor.innerHTML).toBe('<p>Initial</p><p>Appended</p>');
    });

    it('inserts plain text without parsing it as HTML', () => {
        const editor = createEditor('<p>Hello </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertText('<strong>text</strong>');

        expect(editor.innerHTML).toBe('<p>Hello &lt;strong&gt;text&lt;/strong&gt;</p>');
    });

    it('creates a link from the selected text', () => {
        const editor = createEditor('<p>Visit Inkflow</p>');
        const textNode = editor.querySelector('p')?.firstChild as Text;
        selectText(textNode, 6, 13);

        const commands = new CommandAdapter(editor);
        commands.createLink('https://example.com');

        const link = editor.querySelector('a');
        expect(editor.innerHTML).toBe(
            '<p>Visit <a href="https://example.com" rel="noopener noreferrer">Inkflow</a></p>'
        );
        expect(link?.textContent).toBe('Inkflow');
    });

    it('inserts an image element at the caret', () => {
        const editor = createEditor('<p>Before </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertImage('https://example.com/image.png');

        const image = editor.querySelector('img');
        expect(image?.getAttribute('src')).toBe('https://example.com/image.png');
        expect(image?.getAttribute('alt')).toBe('image');
    });

    it('inserts a video element at the caret', () => {
        const editor = createEditor('<p>Before </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertVideo('https://example.com/video.mp4');

        const video = editor.querySelector('video');
        expect(video?.getAttribute('src')).toBe('https://example.com/video.mp4');
        expect(video?.hasAttribute('controls')).toBe(true);
    });

    it('inserts an image upload placeholder without parsing HTML strings', () => {
        const editor = createEditor('<p>Before </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertImageUploadPlaceholder('upload-1', 'Uploading image...');

        const placeholder = editor.querySelector('#upload-1') as HTMLElement;
        expect(placeholder.className).toBe('inkflow-img-skeleton');
        expect(placeholder.contentEditable).toBe('false');
        expect(placeholder.textContent).toBe('Uploading image...');
        expect(editor.innerHTML).toBe(
            '<p>Before <span id="upload-1" class="inkflow-img-skeleton">Uploading image...</span>&nbsp;</p>'
        );
    });

    it('inserts a horizontal rule with a follow-up paragraph for continued typing', () => {
        const editor = createEditor('<p>Before</p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertHorizontalRule();

        expect(editor.innerHTML).toBe('<p>Before</p><hr><p><br></p>');
        expect(window.getSelection()?.isCollapsed).toBe(true);
        expect(editor.contains(window.getSelection()?.anchorNode || null)).toBe(true);
    });

    it('replaces an empty active block when inserting a horizontal rule', () => {
        const editor = createEditor('<p><br></p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertHorizontalRule();

        expect(editor.innerHTML).toBe('<hr><p><br></p>');
    });

    it('inserts a code block and places the caret inside the code element', () => {
        const editor = createEditor('<p>Before</p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertCodeBlock();

        const code = editor.querySelector('code');
        expect(editor.innerHTML).toBe(
            '<p>Before</p><pre><code>// Paste your code here...</code></pre><p><br></p>'
        );
        expect(window.getSelection()?.isCollapsed).toBe(true);
        expect(code?.contains(window.getSelection()?.anchorNode || null)).toBe(true);
    });

    it('inserts a table and places the caret in the first cell', () => {
        const editor = createEditor('<p>Before</p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertTable(2, 3);

        const cells = editor.querySelectorAll('td');
        expect(cells).toHaveLength(6);
        expect(editor.innerHTML).toBe(
            '<p>Before</p><table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><br></p>'
        );
        expect(cells[0].contains(window.getSelection()?.anchorNode || null)).toBe(true);
    });

    it('rejects invalid table dimensions', () => {
        const editor = createEditor('<p>Before</p>');
        const commands = new CommandAdapter(editor);

        expect(commands.insertTable(0, 3)).toBe(false);
        expect(commands.insertTable(2, -1)).toBe(false);
        expect(editor.innerHTML).toBe('<p>Before</p>');
    });
});

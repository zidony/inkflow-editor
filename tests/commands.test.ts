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
});

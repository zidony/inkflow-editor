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

    it('returns false when a legacy command is not supported', () => {
        const editor = createEditor('<p>Text</p>');
        const originalExecCommand = document.execCommand;
        document.execCommand = () => {
            throw new Error('unsupported command');
        };

        const commands = new CommandAdapter(editor);

        expect(commands.exec('bold')).toBe(false);
        document.execCommand = originalExecCommand;
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

    it('preserves newlines in pasted plain text as <br> elements', () => {
        const editor = createEditor('<p>Start </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertText('line1\nline2\r\nline3');

        expect(editor.innerHTML).toBe('<p>Start line1<br>line2<br>line3</p>');
    });

    it('keeps blank lines from multi-line plain text', () => {
        const editor = createEditor('<p></p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertText('a\n\nb');

        expect(editor.innerHTML).toBe('<p>a<br><br>b</p>');
    });

    it('rejects unsafe link URLs at the command layer', () => {
        const editor = createEditor('<p>Visit here</p>');
        const textNode = editor.querySelector('p')?.firstChild as Text;
        selectText(textNode, 6, 10);

        const commands = new CommandAdapter(editor);

        expect(commands.createLink('javascript:alert(1)')).toBe(false);
        expect(editor.querySelector('a')).toBeNull();
        expect(editor.innerHTML).toBe('<p>Visit here</p>');
    });

    it('rejects unsafe image and video URLs at the command layer', () => {
        const editor = createEditor('<p>Before </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);

        expect(commands.insertImage('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=')).toBe(false);
        expect(commands.insertVideo('javascript:alert(1)')).toBe(false);
        expect(editor.querySelector('img')).toBeNull();
        expect(editor.querySelector('video')).toBeNull();
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

    it('inserts an emoji image with trailing spacing', () => {
        const editor = createEditor('<p>Before </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.insertEmojiImage('😀', '/emoji.svg');

        const image = editor.querySelector('img');
        expect(image?.className).toBe('inkflow-emoji');
        expect(image?.getAttribute('alt')).toBe('😀');
        expect(image?.getAttribute('loading')).toBe('lazy');
        expect(image?.draggable).toBe(false);
        expect(editor.innerHTML).toBe(
            '<p>Before <img src="/emoji.svg" alt="😀" class="inkflow-emoji" loading="lazy" draggable="false">&nbsp;</p>'
        );
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

    it('wraps selected text in inline code', () => {
        const editor = createEditor('<p>Hello code</p>');
        const textNode = editor.querySelector('p')?.firstChild as Text;
        selectText(textNode, 6, 10);

        const commands = new CommandAdapter(editor);
        commands.wrapSelectionInInlineCode();

        expect(editor.innerHTML).toBe('<p>Hello <code>code</code></p>');
        expect(window.getSelection()?.isCollapsed).toBe(true);
    });

    it('inserts an empty inline code token at the caret', () => {
        const editor = createEditor('<p>Hello </p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        commands.wrapSelectionInInlineCode();

        const code = editor.querySelector('code');
        expect(code?.textContent).toBe('\u200B');
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

    it('updates an existing link href and unwraps it on unlink', () => {
        const editor = createEditor('<p><a href="https://old.com">site</a></p>');
        const anchor = editor.querySelector('a') as HTMLAnchorElement;
        placeCaretAtEnd(anchor);

        const commands = new CommandAdapter(editor);
        const active = commands.getActiveLink();
        expect(active).toBe(anchor);

        commands.updateLink(anchor, 'https://new.com');
        expect(editor.querySelector('a')?.getAttribute('href')).toBe('https://new.com');

        commands.unlink(editor.querySelector('a') as HTMLAnchorElement);
        expect(editor.querySelector('a')).toBeNull();
        expect(editor.textContent).toBe('site');
    });

    it('rejects unsafe URLs when updating a link', () => {
        const editor = createEditor('<p><a href="https://ok.com">site</a></p>');
        const anchor = editor.querySelector('a') as HTMLAnchorElement;

        const commands = new CommandAdapter(editor);
        expect(commands.updateLink(anchor, 'javascript:alert(1)')).toBe(false);
        expect(anchor.getAttribute('href')).toBe('https://ok.com');
    });

    function caretInFirstCell(editor: HTMLElement): void {
        const cell = editor.querySelector('td') as HTMLTableCellElement;
        placeCaretAtEnd(cell);
    }

    it('inserts a row after the active cell row', () => {
        const editor = createEditor(
            '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'
        );
        caretInFirstCell(editor);

        const commands = new CommandAdapter(editor);
        expect(commands.insertTableRow('after')).toBe(true);
        expect(editor.querySelectorAll('tr')).toHaveLength(2);
        expect(editor.querySelectorAll('tr')[1].children).toHaveLength(2);
    });

    it('inserts a column before the active cell column', () => {
        const editor = createEditor(
            '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'
        );
        const secondCell = editor.querySelectorAll('td')[1] as HTMLTableCellElement;
        placeCaretAtEnd(secondCell);

        const commands = new CommandAdapter(editor);
        expect(commands.insertTableColumn('before')).toBe(true);
        expect(editor.querySelectorAll('tr')[0].children).toHaveLength(3);
        expect(editor.querySelectorAll('tr')[1].children).toHaveLength(3);
    });

    it('deletes the active row but keeps the rest of the table', () => {
        const editor = createEditor(
            '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>'
        );
        caretInFirstCell(editor);

        const commands = new CommandAdapter(editor);
        expect(commands.deleteTableRow()).toBe(true);
        expect(editor.querySelectorAll('tr')).toHaveLength(1);
        expect(editor.querySelector('td')?.textContent).toBe('b');
    });

    it('removes the whole table when deleting the last row', () => {
        const editor = createEditor('<table><tbody><tr><td>a</td></tr></tbody></table>');
        caretInFirstCell(editor);

        const commands = new CommandAdapter(editor);
        expect(commands.deleteTableRow()).toBe(true);
        expect(editor.querySelector('table')).toBeNull();
    });

    it('removes the whole table when deleting the last column', () => {
        const editor = createEditor(
            '<table><tbody><tr><td>a</td></tr><tr><td>b</td></tr></tbody></table>'
        );
        caretInFirstCell(editor);

        const commands = new CommandAdapter(editor);
        expect(commands.deleteTableColumn()).toBe(true);
        expect(editor.querySelector('table')).toBeNull();
    });

    it('returns false for table ops when the caret is outside a table', () => {
        const editor = createEditor('<p>Not a table</p>');
        const paragraph = editor.querySelector('p') as HTMLParagraphElement;
        placeCaretAtEnd(paragraph);

        const commands = new CommandAdapter(editor);
        expect(commands.insertTableRow('after')).toBe(false);
        expect(commands.deleteTable()).toBe(false);
    });
});

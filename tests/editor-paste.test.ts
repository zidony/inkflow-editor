import { afterEach, describe, expect, it, vi } from 'vitest';
import { InkflowEditor } from '../src/core/editor';

function createEditor(html = ''): { container: HTMLElement; editor: InkflowEditor } {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;

    return {
        container,
        editor: new InkflowEditor({ container, lang: 'en-US' })
    };
}

function pasteIntoEditor(container: HTMLElement, data: { html?: string; text?: string }): void {
    const editorBody = container.querySelector<HTMLElement>('.inkflow-editor-body');
    if (!editorBody) {
        throw new Error('Editor body fixture was not created.');
    }

    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
            files: [],
            getData: vi.fn((type: string) => {
                if (type === 'text/html') return data.html || '';
                if (type === 'text/plain') return data.text || '';
                return '';
            })
        }
    });

    editorBody.dispatchEvent(pasteEvent);
}

describe('InkflowEditor paste sanitization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('sanitizes HTML clipboard content before inserting it into the editor', () => {
        const { container, editor } = createEditor();

        pasteIntoEditor(container, {
            html: [
                '<div class="MsoNormal" style="color:red" onclick="alert(1)">',
                '<span style="font-weight:700">Hello</span>',
                '<script>alert(1)</script>',
                '<a href="javascript:alert(1)" onclick="alert(2)">bad</a>',
                '</div>'
            ].join('')
        });

        expect(editor.getHTML()).toBe('<div><span>Hello</span><a>bad</a></div>');
        editor.destroy();
    });

    it('inserts plain-text clipboard content as text instead of HTML', () => {
        const { container, editor } = createEditor();

        pasteIntoEditor(container, {
            text: '<img src=x onerror=alert(1)>'
        });

        expect(editor.getText()).toBe('<img src=x onerror=alert(1)>');
        expect(editor.getHTML()).toBe('&lt;img src=x onerror=alert(1)&gt;');
        editor.destroy();
    });

    it('prefers sanitized HTML when both HTML and plain text clipboard data are present', () => {
        const { container, editor } = createEditor();

        pasteIntoEditor(container, {
            html: '<p><strong>Rich</strong> text</p>',
            text: 'Plain text'
        });

        expect(editor.getHTML()).toBe('<p><strong>Rich</strong> text</p>');
        editor.destroy();
    });

    it('removes unsafe pasted media URLs while preserving valid embedded media', () => {
        const { container, editor } = createEditor();

        pasteIntoEditor(container, {
            html: [
                '<p>',
                '<img src="javascript:alert(1)" alt="bad">',
                '<iframe src="https://example.com/embed" srcdoc="<script>alert(1)</script>"></iframe>',
                '</p>'
            ].join('')
        });

        expect(editor.getHTML()).toBe(
            '<p><img alt="bad"><iframe src="https://example.com/embed" sandbox="allow-scripts allow-presentation" loading="lazy"></iframe></p>'
        );
        editor.destroy();
    });
});

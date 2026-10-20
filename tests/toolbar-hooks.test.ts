import { afterEach, describe, expect, it, vi } from 'vitest';
import { InkflowEditor } from '../src/core/editor';
import type { InkflowOptions } from '../src/types';

function createEditor(
    options: Partial<Omit<InkflowOptions, 'container'>> = {}
): { container: HTMLElement; editor: InkflowEditor } {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }

    return {
        container,
        editor: new InkflowEditor({ container, lang: 'en-US', ...options })
    };
}

function queryToolbarButton(container: HTMLElement, label: string): HTMLButtonElement | null {
    return container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`);
}

/** Places a collapsed caret inside the editor body so insert handlers proceed. */
function placeCaretInEditor(container: HTMLElement): void {
    const editorBody = container.querySelector<HTMLElement>('.inkflow-editor-body');
    if (!editorBody) {
        throw new Error('Editor body fixture was not created.');
    }
    if (!editorBody.innerHTML.trim()) {
        editorBody.innerHTML = '<p>hello</p>';
    }

    const targetEl = editorBody.querySelector('a') ?? editorBody.querySelector('p') ?? editorBody;
    const textNode = targetEl.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, Math.min(2, textNode.textContent?.length ?? 0));
    range.collapse(true);

    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
}

describe('InkflowEditor insert hooks', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('inserts the image URL resolved by the hook', async () => {
        const onInsertImage = vi.fn().mockResolvedValue('https://example.com/pic.png');
        const { container, editor } = createEditor({ hooks: { onInsertImage } });

        placeCaretInEditor(container);
        queryToolbarButton(container, 'Insert Image')!.click();
        await vi.waitFor(() => expect(editor.getHTML()).toContain('<img'));

        expect(onInsertImage).toHaveBeenCalledOnce();
        expect(editor.getHTML()).toContain('src="https://example.com/pic.png"');
        editor.destroy();
    });

    it('treats a null-resolving hook as a cancellation', async () => {
        const onInsertImage = vi.fn().mockResolvedValue(null);
        const { container, editor } = createEditor({ hooks: { onInsertImage } });

        placeCaretInEditor(container);
        queryToolbarButton(container, 'Insert Image')!.click();
        await vi.waitFor(() => expect(onInsertImage).toHaveBeenCalledOnce());
        await Promise.resolve();

        expect(editor.getHTML()).not.toContain('<img');
        editor.destroy();
    });

    it('contains a rejected hook instead of leaking an unhandled rejection', async () => {
        const error = new Error('upload exploded');
        const onInsertImage = vi.fn().mockRejectedValue(error);
        const { container, editor } = createEditor({ hooks: { onInsertImage } });

        placeCaretInEditor(container);
        const errorEvents: CustomEvent[] = [];
        const emittedErrors: unknown[] = [];
        container.addEventListener('inkflow-hook-error', (event: Event) => {
            errorEvents.push(event as CustomEvent);
        });
        editor.on('hookError', detail => {
            emittedErrors.push(detail);
        });

        queryToolbarButton(container, 'Insert Image')!.click();
        await vi.waitFor(() => expect(onInsertImage).toHaveBeenCalledOnce());
        // Flush microtasks: without containment the rejection would surface here.
        await Promise.resolve();
        await Promise.resolve();

        expect(editor.getHTML()).not.toContain('<img');
        expect(errorEvents).toHaveLength(1);
        expect(errorEvents[0].detail).toMatchObject({ hook: 'onInsertImage', error });
        expect(emittedErrors).toEqual([{ hook: 'onInsertImage', error }]);
        editor.destroy();
    });

    it('contains a throwing link hook and leaves the existing link untouched', async () => {
        const onInsertLink = vi.fn().mockImplementation(() => {
            throw new Error('sync failure');
        });
        const { container, editor } = createEditor({ hooks: { onInsertLink } });

        editor.setHTML('<p><a href="https://example.com">link</a></p>');
        placeCaretInEditor(container);
        queryToolbarButton(container, 'Insert Link')!.click();
        await vi.waitFor(() => expect(onInsertLink).toHaveBeenCalledOnce());
        await Promise.resolve();

        expect(editor.getHTML()).toContain('href="https://example.com"');
        editor.destroy();
    });

    it('inserts a semantic attachment link when onInsertAttachment resolves', async () => {
        const onInsertAttachment = vi.fn().mockResolvedValue({
            url: 'https://example.com/files/report-2026.pdf',
            name: 'report-2026.pdf',
            size: '2.4 MB'
        });
        const { container, editor } = createEditor({ hooks: { onInsertAttachment } });

        placeCaretInEditor(container);
        queryToolbarButton(container, 'Insert Attachment')!.click();
        await vi.waitFor(() => expect(editor.getHTML()).toContain('class="inkflow-attachment"'));

        expect(onInsertAttachment).toHaveBeenCalledOnce();
        const html = editor.getHTML();
        expect(html).toContain('href="https://example.com/files/report-2026.pdf"');
        expect(html).toContain('download="report-2026.pdf"');
        expect(html).toContain('report-2026.pdf (2.4 MB)');

        // Verify round-trip sanitization preserves class and download attribute
        editor.setHTML(html);
        expect(editor.getHTML()).toContain('class="inkflow-attachment"');
        expect(editor.getHTML()).toContain('download="report-2026.pdf"');
        editor.destroy();
    });
});

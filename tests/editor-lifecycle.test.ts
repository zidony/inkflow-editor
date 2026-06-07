import { afterEach, describe, expect, it, vi } from 'vitest';
import { InkflowEditor } from '../src/core/editor';
import type { InkflowOptions } from '../src/types';

function createContainer(html = '<p>Initial</p>'): HTMLElement {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;
    return container;
}

function createEditor(
    html = '<p>Initial</p>',
    options: Partial<Omit<InkflowOptions, 'container'>> = {}
): { container: HTMLElement; editor: InkflowEditor } {
    const container = createContainer(html);
    const editor = new InkflowEditor({ container, lang: 'en-US', ...options });

    return { container, editor };
}

describe('InkflowEditor lifecycle', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.style.overflow = '';
        document.body.innerHTML = '';
    });

    it('mounts into the container and clears DOM on destroy', () => {
        const { container, editor } = createEditor();

        expect(container.querySelector('.inkflow-container')).not.toBeNull();
        expect(container.querySelector('.inkflow-editor-body')?.innerHTML).toBe('<p>Initial</p>');

        editor.destroy();

        expect(container.innerHTML).toBe('');
        expect(document.body.querySelector('.inkflow-container')).toBeNull();
    });

    it('does not emit ready after destroy clears the pending ready timer', () => {
        vi.useFakeTimers();
        const { editor } = createEditor();
        const readyHandler = vi.fn();

        editor.on('ready', readyHandler);
        editor.destroy();
        vi.runAllTimers();

        expect(readyHandler).not.toHaveBeenCalled();
    });

    it('restores body overflow and removes fullscreen DOM on destroy', () => {
        document.body.style.overflow = 'auto';
        const { container, editor } = createEditor();
        const fullscreenButton = container.querySelector<HTMLButtonElement>('[aria-label="Fullscreen"]');

        fullscreenButton?.click();

        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.querySelector('.inkflow-container.is-fullscreen')).not.toBeNull();
        expect(container.querySelector('.inkflow-container')).toBeNull();

        editor.destroy();

        expect(document.body.style.overflow).toBe('auto');
        expect(document.body.querySelector('.inkflow-container')).toBeNull();
        expect(container.innerHTML).toBe('');
    });

    it('clears status message timers during destroy', () => {
        vi.useFakeTimers();
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
        const { container, editor } = createEditor();

        editor.setHTML('<p>Updated</p>');
        editor.destroy();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(() => vi.runAllTimers()).not.toThrow();
        expect(container.innerHTML).toBe('');
    });

    it('removes toolbar document listeners on destroy', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        const removeSpy = vi.spyOn(document, 'removeEventListener');
        const { editor } = createEditor();
        const addedDocumentClick = addSpy.mock.calls.find(([eventName]) => eventName === 'click');

        editor.destroy();

        expect(addedDocumentClick).toBeDefined();
        expect(removeSpy.mock.calls.some(([eventName]) => eventName === 'click')).toBe(true);
    });

    it('can be destroyed more than once without reintroducing DOM side effects', () => {
        const { container, editor } = createEditor();

        editor.destroy();
        editor.destroy();
        editor.setHTML('<p>After destroy</p>');
        editor.saveHistoryNow();

        expect(container.innerHTML).toBe('');
        expect(document.body.querySelector('.inkflow-container')).toBeNull();
    });

    it('keeps separate editor instances isolated when one is destroyed', () => {
        document.body.innerHTML = '<div id="first"><p>First</p></div><div id="second"><p>Second</p></div>';
        const firstContainer = document.querySelector<HTMLElement>('#first');
        const secondContainer = document.querySelector<HTMLElement>('#second');

        if (!firstContainer || !secondContainer) {
            throw new Error('Multi-instance editor fixture was not created.');
        }

        const firstEditor = new InkflowEditor({ container: firstContainer, lang: 'en-US' });
        const secondEditor = new InkflowEditor({ container: secondContainer, lang: 'en-US' });

        firstEditor.destroy();

        expect(firstContainer.innerHTML).toBe('');
        expect(secondContainer.querySelector('.inkflow-container')).not.toBeNull();
        expect(secondEditor.getHTML()).toBe('<p>Second</p>');

        secondEditor.destroy();
    });

    it('removes active image resize document listeners on destroy', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        const removeSpy = vi.spyOn(document, 'removeEventListener');
        const { container, editor } = createEditor('<p><img src="https://example.com/image.png"></p>');
        const image = container.querySelector<HTMLImageElement>('.inkflow-editor-body img');
        const resizeHandle = container.querySelector<HTMLElement>('.inkflow-resizer-handle.se');

        if (!image || !resizeHandle) {
            throw new Error('Image resize fixture was not created.');
        }

        image.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(addSpy.mock.calls.some(([eventName]) => eventName === 'mousemove')).toBe(true);
        expect(addSpy.mock.calls.some(([eventName]) => eventName === 'mouseup')).toBe(true);

        editor.destroy();

        expect(removeSpy.mock.calls.some(([eventName]) => eventName === 'mousemove')).toBe(true);
        expect(removeSpy.mock.calls.some(([eventName]) => eventName === 'mouseup')).toBe(true);
    });

    it('ignores pending image upload resolution after destroy', async () => {
        let resolveUpload!: (url: string) => void;
        const uploadPromise = new Promise<string>(resolve => {
            resolveUpload = resolve;
        });
        const uploadHook = vi.fn(() => uploadPromise);
        const changeHandler = vi.fn();
        const { container, editor } = createEditor('<p>Initial</p>', {
            hooks: {
                onUploadImage: uploadHook
            }
        });
        const editorBody = container.querySelector<HTMLElement>('.inkflow-editor-body');

        if (!editorBody) {
            throw new Error('Editor body fixture was not created.');
        }

        editor.on('change', changeHandler);

        const file = new File(['image'], 'image.png', { type: 'image/png' });
        const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
        Object.defineProperty(pasteEvent, 'clipboardData', {
            value: {
                files: [file],
                getData: vi.fn(() => '')
            }
        });

        editorBody.dispatchEvent(pasteEvent);
        expect(uploadHook).toHaveBeenCalledWith(file);

        editor.destroy();
        resolveUpload('https://example.com/uploaded.png');
        await uploadPromise;
        await Promise.resolve();

        expect(changeHandler).not.toHaveBeenCalled();
        expect(container.innerHTML).toBe('');
    });
});

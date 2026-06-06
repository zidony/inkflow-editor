import { afterEach, describe, expect, it, vi } from 'vitest';
import { InkflowEditor } from '../src/core/editor';

function createContainer(html = '<p>Initial</p>'): HTMLElement {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;
    return container;
}

describe('InkflowEditor lifecycle', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        document.body.style.overflow = '';
        document.body.innerHTML = '';
    });

    it('mounts into the container and clears DOM on destroy', () => {
        const container = createContainer();
        const editor = new InkflowEditor({ container, lang: 'en-US' });

        expect(container.querySelector('.inkflow-container')).not.toBeNull();
        expect(container.querySelector('.inkflow-editor-body')?.innerHTML).toBe('<p>Initial</p>');

        editor.destroy();

        expect(container.innerHTML).toBe('');
        expect(document.body.querySelector('.inkflow-container')).toBeNull();
    });

    it('does not emit ready after destroy clears the pending ready timer', () => {
        vi.useFakeTimers();
        const container = createContainer();
        const editor = new InkflowEditor({ container, lang: 'en-US' });
        const readyHandler = vi.fn();

        editor.on('ready', readyHandler);
        editor.destroy();
        vi.runAllTimers();

        expect(readyHandler).not.toHaveBeenCalled();
    });

    it('restores body overflow and removes fullscreen DOM on destroy', () => {
        const container = createContainer();
        document.body.style.overflow = 'auto';
        const editor = new InkflowEditor({ container, lang: 'en-US' });
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
        const container = createContainer();
        const editor = new InkflowEditor({ container, lang: 'en-US' });

        editor.setHTML('<p>Updated</p>');
        editor.destroy();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(() => vi.runAllTimers()).not.toThrow();
        expect(container.innerHTML).toBe('');
    });

    it('removes toolbar document listeners on destroy', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        const removeSpy = vi.spyOn(document, 'removeEventListener');
        const container = createContainer();
        const editor = new InkflowEditor({ container, lang: 'en-US' });
        const addedDocumentClick = addSpy.mock.calls.find(([eventName]) => eventName === 'click');

        editor.destroy();

        expect(addedDocumentClick).toBeDefined();
        expect(removeSpy.mock.calls.some(([eventName]) => eventName === 'click')).toBe(true);
    });
});

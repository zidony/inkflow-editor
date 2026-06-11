import { afterEach, describe, expect, it } from 'vitest';
import { InkflowEditor } from '../src/core/editor';
import type { EmojiExtension, InkflowOptions } from '../src/types';

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

function getToolbarGroups(container: HTMLElement): string[][] {
    return Array.from(container.querySelectorAll<HTMLElement>('.inkflow-toolbar-group')).map(group =>
        Array.from(group.querySelectorAll<HTMLElement>('[aria-label]')).map(
            element => element.getAttribute('aria-label') || ''
        )
    );
}

function findToolbarGroupIndex(groups: string[][], labels: string[]): number {
    return groups.findIndex(group =>
        group.length === labels.length && group.every((label, index) => label === labels[index])
    );
}

describe('InkflowEditor toolbar options', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('uses the full toolbar preset by default', () => {
        const { container, editor } = createEditor();

        expect(queryToolbarButton(container, 'Insert Video')).not.toBeNull();
        expect(queryToolbarButton(container, 'Code Block')).not.toBeNull();
        expect(queryToolbarButton(container, 'Insert Table')).not.toBeNull();
        expect(queryToolbarButton(container, 'Divider')).not.toBeNull();
        expect(queryToolbarButton(container, 'Source Code')).not.toBeNull();
        expect(queryToolbarButton(container, 'Fullscreen')).not.toBeNull();

        editor.destroy();
    });

    it('places external resource insert actions in a dedicated group after block tools', () => {
        const { container, editor } = createEditor();
        const groups = getToolbarGroups(container);
        const blockGroupIndex = findToolbarGroupIndex(groups, [
            'Code Block',
            'Blockquote',
            'Insert Table',
            'Divider'
        ]);
        const resourceGroupIndex = findToolbarGroupIndex(groups, [
            'Insert Link',
            'Insert Image',
            'Insert Video'
        ]);

        expect(blockGroupIndex).toBeGreaterThan(-1);
        expect(resourceGroupIndex).toBeGreaterThan(-1);
        expect(blockGroupIndex).toBeLessThan(resourceGroupIndex);

        editor.destroy();
    });

    it('uses a compact common-action toolbar in basic mode', () => {
        const emoji: EmojiExtension = {
            mountPicker: () => {}
        };
        const { container, editor } = createEditor({ toolbarMode: 'basic', emoji });

        expect(queryToolbarButton(container, 'Bold')).not.toBeNull();
        expect(queryToolbarButton(container, 'Italic')).not.toBeNull();
        expect(queryToolbarButton(container, 'Underline')).not.toBeNull();
        expect(queryToolbarButton(container, 'Unordered List')).not.toBeNull();
        expect(queryToolbarButton(container, 'Ordered List')).not.toBeNull();
        expect(queryToolbarButton(container, 'Insert Link')).not.toBeNull();
        expect(queryToolbarButton(container, 'Insert Image')).not.toBeNull();
        expect(queryToolbarButton(container, 'Emoji')).not.toBeNull();
        expect(queryToolbarButton(container, 'Undo')).not.toBeNull();
        expect(queryToolbarButton(container, 'Redo')).not.toBeNull();

        expect(queryToolbarButton(container, 'Insert Video')).toBeNull();
        expect(queryToolbarButton(container, 'Code Block')).toBeNull();
        expect(queryToolbarButton(container, 'Insert Table')).toBeNull();
        expect(queryToolbarButton(container, 'Divider')).toBeNull();
        expect(queryToolbarButton(container, 'Source Code')).toBeNull();
        expect(queryToolbarButton(container, 'Fullscreen')).toBeNull();

        editor.destroy();
    });

    it('lets custom toolbar configuration override the toolbar preset', () => {
        const { container, editor } = createEditor({
            toolbarMode: 'basic',
            toolbar: [['bold'], ['sourceCode']]
        });

        expect(queryToolbarButton(container, 'Bold')).not.toBeNull();
        expect(queryToolbarButton(container, 'Source Code')).not.toBeNull();
        expect(queryToolbarButton(container, 'Italic')).toBeNull();
        expect(queryToolbarButton(container, 'Insert Image')).toBeNull();

        editor.destroy();
    });
});

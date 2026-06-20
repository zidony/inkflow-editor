import { afterEach, describe, expect, it } from 'vitest';
import { InkflowEditor } from '../src/core/editor';

function createEditor(html: string): { container: HTMLElement; editor: InkflowEditor } {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.querySelector<HTMLElement>('#root');
    if (!container) {
        throw new Error('Editor container fixture was not created.');
    }
    container.innerHTML = html;
    const editor = new InkflowEditor({ container, lang: 'en-US' });
    return { container, editor };
}

function placeCaretInFirstCell(container: HTMLElement): void {
    const cell = container.querySelector<HTMLTableCellElement>('.inkflow-editor-body td');
    if (!cell) throw new Error('Table cell fixture missing.');
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
}

function tableTools(container: HTMLElement): HTMLElement | null {
    return container.querySelector<HTMLElement>('.inkflow-table-tools');
}

describe('InkflowEditor table context tools', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('shows the table toolbar when the caret enters a table', () => {
        const { container, editor } = createEditor(
            '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'
        );

        expect(tableTools(container)?.style.display).toBe('none');

        placeCaretInFirstCell(container);
        const body = container.querySelector<HTMLElement>('.inkflow-editor-body');
        body?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

        expect(tableTools(container)?.style.display).toBe('flex');
        editor.destroy();
    });

    it('inserts a row via the toolbar button', () => {
        const { container, editor } = createEditor(
            '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>'
        );
        placeCaretInFirstCell(container);
        const body = container.querySelector<HTMLElement>('.inkflow-editor-body');
        body?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

        const rowBelow = container.querySelector<HTMLButtonElement>('[aria-label="Insert row below"]');
        rowBelow?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

        expect(container.querySelectorAll('.inkflow-editor-body tr')).toHaveLength(2);
        editor.destroy();
    });

    it('removes the table tools element on destroy', () => {
        const { container, editor } = createEditor(
            '<table><tbody><tr><td>a</td></tr></tbody></table>'
        );

        expect(tableTools(container)).not.toBeNull();
        editor.destroy();
        expect(tableTools(container)).toBeNull();
    });
});

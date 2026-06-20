import type { LocaleDict } from '../types/index';
import type { CommandAdapter } from '../core/commands';

type TableAction =
    | 'rowAbove'
    | 'rowBelow'
    | 'colLeft'
    | 'colRight'
    | 'deleteRow'
    | 'deleteCol'
    | 'deleteTable';

const ACTIONS: Array<{ key: TableAction; symbol: string }> = [
    { key: 'rowAbove', symbol: '↑+' },
    { key: 'rowBelow', symbol: '↓+' },
    { key: 'colLeft', symbol: '←+' },
    { key: 'colRight', symbol: '→+' },
    { key: 'deleteRow', symbol: '⊟' },
    { key: 'deleteCol', symbol: '⊞' },
    { key: 'deleteTable', symbol: '✕' }
];

/**
 * Floating contextual toolbar for table editing.
 * Appears above the table containing the caret and offers row/column
 * insertion and deletion. Positioned relative to the editor wrapper, mirroring
 * the image resizer overlay strategy.
 */
export class TableTools {
    private wrapper: HTMLElement;
    private editorArea: HTMLElement;
    private commands: CommandAdapter;
    private locale: LocaleDict;
    private onChange: () => void;

    private barEl: HTMLElement;
    private buttons: Map<TableAction, HTMLButtonElement> = new Map();

    constructor(
        wrapper: HTMLElement,
        editorArea: HTMLElement,
        commands: CommandAdapter,
        locale: LocaleDict,
        onChange: () => void
    ) {
        this.wrapper = wrapper;
        this.editorArea = editorArea;
        this.commands = commands;
        this.locale = locale;
        this.onChange = onChange;

        this.barEl = this.createBar();
        this.wrapper.appendChild(this.barEl);
    }

    private createBar(): HTMLElement {
        const bar = document.createElement('div');
        bar.className = 'inkflow-table-tools';
        bar.style.display = 'none';
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', this.locale.toolbar.tableTools || 'Table tools');

        ACTIONS.forEach(({ key, symbol }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'inkflow-table-tool-btn';
            btn.textContent = symbol;
            btn.title = this.locale.toolbar[key] || key;
            btn.setAttribute('aria-label', btn.title);

            // Use mousedown + preventDefault so the editor selection (the active
            // cell) is not lost before the command runs.
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                this.runAction(key);
            });

            this.buttons.set(key, btn);
            bar.appendChild(btn);
        });

        return bar;
    }

    private runAction(action: TableAction): void {
        let handled = false;
        switch (action) {
            case 'rowAbove':
                handled = this.commands.insertTableRow('before');
                break;
            case 'rowBelow':
                handled = this.commands.insertTableRow('after');
                break;
            case 'colLeft':
                handled = this.commands.insertTableColumn('before');
                break;
            case 'colRight':
                handled = this.commands.insertTableColumn('after');
                break;
            case 'deleteRow':
                handled = this.commands.deleteTableRow();
                break;
            case 'deleteCol':
                handled = this.commands.deleteTableColumn();
                break;
            case 'deleteTable':
                handled = this.commands.deleteTable();
                break;
        }

        if (handled) {
            this.onChange();
            this.update();
        }
    }

    /**
     * Shows the toolbar above the active table, or hides it when the caret
     * is not within a table.
     */
    public update(): void {
        const cell = this.commands.getActiveCell();
        const table = cell?.closest('table');

        if (!cell || !table || !this.editorArea.contains(table)) {
            this.hide();
            return;
        }

        const wrapperRect = this.wrapper.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        const editorRect = this.editorArea.getBoundingClientRect();

        // Hide if the table has scrolled out of the visible editor viewport.
        // Skip this check when the table has no measured size (e.g. layout-less
        // environments) so the toolbar still shows.
        if (
            tableRect.height > 0 &&
            (tableRect.bottom <= editorRect.top || tableRect.top >= editorRect.bottom)
        ) {
            this.hide();
            return;
        }

        this.barEl.style.display = 'flex';
        const top = tableRect.top - wrapperRect.top - this.barEl.offsetHeight - 4;
        this.barEl.style.top = `${Math.max(top, tableRect.top - wrapperRect.top)}px`;
        this.barEl.style.left = `${tableRect.left - wrapperRect.left}px`;
    }

    public hide(): void {
        this.barEl.style.display = 'none';
    }

    public destroy(): void {
        this.buttons.clear();
        this.barEl.remove();
    }
}

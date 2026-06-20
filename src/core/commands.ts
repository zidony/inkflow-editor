/**
 * Small command facade around browser editing APIs.
 * It keeps legacy execCommand usage centralized while high-risk commands move to DOM operations.
 */
import { sanitizeHref, sanitizeMediaUrl } from '../utils/security';

export class CommandAdapter {
    private editorArea: HTMLElement;

    constructor(editorArea: HTMLElement) {
        this.editorArea = editorArea;
    }

    public focus(): void {
        this.editorArea.focus();
    }

    public exec(command: string, value: string = ''): boolean {
        try {
            this.focus();
            return document.execCommand(command, false, value);
        } catch {
            return false;
        }
    }

    public insertHTML(html: string): boolean {
        const fragment = document.createRange().createContextualFragment(html);
        return this.insertFragment(fragment);
    }

    public insertText(text: string): boolean {
        if (!text.includes('\n') && !text.includes('\r')) {
            return this.insertNode(document.createTextNode(text));
        }

        // Preserve line breaks from plain-text paste by mapping each newline
        // to a <br>. Text is never parsed as HTML.
        const fragment = document.createDocumentFragment();
        const lines = text.split(/\r\n|\r|\n/);
        lines.forEach((line, index) => {
            if (index > 0) {
                fragment.appendChild(document.createElement('br'));
            }
            if (line) {
                fragment.appendChild(document.createTextNode(line));
            }
        });
        return this.insertFragment(fragment);
    }

    public formatBlock(value: string): boolean {
        return this.exec('formatBlock', value);
    }

    public createLink(url: string): boolean {
        const safeUrl = sanitizeHref(url);
        if (!safeUrl) return false;

        const selection = window.getSelection();
        const link = document.createElement('a');
        link.href = safeUrl;
        link.rel = 'noopener noreferrer';

        if (selection && selection.rangeCount > 0 && this.editorArea.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            link.textContent = selectedText || safeUrl;
            range.deleteContents();
            return this.insertNode(link, range);
        }

        link.textContent = safeUrl;
        return this.insertNode(link);
    }

    /**
     * Returns the anchor element containing the current selection, or null.
     */
    public getActiveLink(): HTMLAnchorElement | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const node = selection.anchorNode;
        if (!node || !this.editorArea.contains(node)) return null;

        const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
        const anchor = element?.closest<HTMLAnchorElement>('a');
        return anchor && this.editorArea.contains(anchor) ? anchor : null;
    }

    /**
     * Updates the href of the anchor at the current selection.
     */
    public updateLink(anchor: HTMLAnchorElement, url: string): boolean {
        const safeUrl = sanitizeHref(url);
        if (!safeUrl) return false;

        anchor.setAttribute('href', safeUrl);
        anchor.setAttribute('rel', 'noopener noreferrer');
        this.focus();
        return true;
    }

    /**
     * Unwraps an anchor element, keeping its text content in place.
     */
    public unlink(anchor: HTMLAnchorElement): boolean {
        const parent = anchor.parentNode;
        if (!parent) return false;

        const range = document.createRange();
        while (anchor.firstChild) {
            parent.insertBefore(anchor.firstChild, anchor);
        }
        // Select the unwrapped content so the caret stays where the link was.
        anchor.remove();
        this.focus();
        // Collapse selection to the parent to avoid a dangling range.
        const selection = window.getSelection();
        if (selection) {
            range.selectNodeContents(parent);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        return true;
    }

    public insertImage(url: string): boolean {
        const safeUrl = sanitizeMediaUrl(url, 'image');
        if (!safeUrl) return false;

        const image = document.createElement('img');
        image.src = safeUrl;
        image.alt = 'image';
        return this.insertNode(image);
    }

    public insertEmojiImage(emoji: string, src: string): boolean {
        const fragment = document.createDocumentFragment();
        const image = document.createElement('img');
        image.src = src;
        image.alt = emoji;
        image.className = 'inkflow-emoji';
        image.setAttribute('loading', 'lazy');
        image.draggable = false;

        fragment.appendChild(image);
        fragment.appendChild(document.createTextNode('\u00A0'));
        return this.insertFragment(fragment, image);
    }

    public insertVideo(url: string): boolean {
        const safeUrl = sanitizeMediaUrl(url, 'media');
        if (!safeUrl) return false;

        const video = document.createElement('video');
        video.src = safeUrl;
        video.controls = true;
        return this.insertNode(video);
    }

    public insertImageUploadPlaceholder(id: string, label: string = 'Image uploading...'): boolean {
        const fragment = document.createDocumentFragment();
        const placeholder = document.createElement('span');
        placeholder.id = id;
        placeholder.className = 'inkflow-img-skeleton';
        placeholder.contentEditable = 'false';
        placeholder.textContent = label;

        fragment.appendChild(placeholder);
        fragment.appendChild(document.createTextNode('\u00A0'));
        return this.insertFragment(fragment, placeholder);
    }

    public insertHorizontalRule(): boolean {
        const rule = document.createElement('hr');
        const paragraph = document.createElement('p');
        paragraph.appendChild(document.createElement('br'));

        this.insertBlockNodes([rule, paragraph]);
        this.focus();
        this.placeCaretAtStart(paragraph);
        return true;
    }

    public insertCodeBlock(placeholder: string = '// Paste your code here...'): boolean {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        const paragraph = document.createElement('p');

        code.textContent = placeholder;
        pre.appendChild(code);
        paragraph.appendChild(document.createElement('br'));

        this.insertBlockNodes([pre, paragraph]);
        this.focus();
        this.placeCaretAtEnd(code);
        return true;
    }

    public wrapSelectionInInlineCode(): boolean {
        const range = this.getActiveRange();
        if (!range) return false;

        const code = document.createElement('code');
        const selectedText = range.toString();
        code.textContent = selectedText || '\u200B';

        range.deleteContents();
        range.insertNode(code);
        this.focus();

        if (selectedText) {
            this.placeCaretAfter(code);
        } else {
            this.placeCaretAtEnd(code);
        }

        return true;
    }

    public insertTable(rows: number, cols: number): boolean {
        if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
            return false;
        }

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        const paragraph = document.createElement('p');
        let firstCell: HTMLTableCellElement | null = null;

        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const row = document.createElement('tr');
            for (let colIndex = 0; colIndex < cols; colIndex++) {
                const cell = document.createElement('td');
                cell.appendChild(document.createElement('br'));
                firstCell ??= cell;
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        paragraph.appendChild(document.createElement('br'));

        this.insertBlockNodes([table, paragraph]);
        this.focus();
        if (firstCell) {
            this.placeCaretAtStart(firstCell);
        }
        return true;
    }

    /**
     * Returns the table cell containing the current selection, or null.
     */
    public getActiveCell(): HTMLTableCellElement | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const node = selection.anchorNode;
        if (!node || !this.editorArea.contains(node)) return null;

        const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
        const cell = element?.closest<HTMLTableCellElement>('td,th');
        return cell && this.editorArea.contains(cell) ? cell : null;
    }

    private newCell(): HTMLTableCellElement {
        const cell = document.createElement('td');
        cell.appendChild(document.createElement('br'));
        return cell;
    }

    /**
     * Inserts a row relative to the active cell's row.
     * @param position 'before' or 'after' the current row.
     */
    public insertTableRow(position: 'before' | 'after' = 'after'): boolean {
        const cell = this.getActiveCell();
        const row = cell?.parentElement as HTMLTableRowElement | undefined;
        if (!cell || !row || row.tagName !== 'TR') return false;

        const colCount = row.children.length;
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
            newRow.appendChild(this.newCell());
        }

        if (position === 'before') {
            row.before(newRow);
        } else {
            row.after(newRow);
        }
        this.focus();
        this.placeCaretAtStart(newRow.firstElementChild || newRow);
        return true;
    }

    /**
     * Inserts a column relative to the active cell's column index.
     * @param position 'before' or 'after' the current column.
     */
    public insertTableColumn(position: 'before' | 'after' = 'after'): boolean {
        const cell = this.getActiveCell();
        const table = cell?.closest('table');
        if (!cell || !table) return false;

        const cellIndex = (cell as HTMLTableCellElement).cellIndex;
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach(row => {
            const reference = row.children[cellIndex];
            const newCell = this.newCell();
            if (reference) {
                if (position === 'before') {
                    reference.before(newCell);
                } else {
                    reference.after(newCell);
                }
            } else {
                row.appendChild(newCell);
            }
        });
        this.focus();
        return true;
    }

    /**
     * Deletes the active cell's row. Removes the whole table if it was the last row.
     */
    public deleteTableRow(): boolean {
        const cell = this.getActiveCell();
        const row = cell?.parentElement as HTMLTableRowElement | undefined;
        const table = cell?.closest('table');
        if (!cell || !row || !table) return false;

        const allRows = table.querySelectorAll('tr');
        if (allRows.length <= 1) {
            return this.deleteTable();
        }

        const nextRow = (row.nextElementSibling || row.previousElementSibling) as HTMLElement | null;
        row.remove();
        this.focus();
        if (nextRow) {
            this.placeCaretAtStart(nextRow.firstElementChild || nextRow);
        }
        return true;
    }

    /**
     * Deletes the active cell's column. Removes the whole table if it was the last column.
     */
    public deleteTableColumn(): boolean {
        const cell = this.getActiveCell();
        const table = cell?.closest('table');
        if (!cell || !table) return false;

        const cellIndex = (cell as HTMLTableCellElement).cellIndex;
        const rows = Array.from(table.querySelectorAll('tr'));
        const colCount = rows[0]?.children.length || 0;
        if (colCount <= 1) {
            return this.deleteTable();
        }

        rows.forEach(row => {
            const target = row.children[cellIndex];
            if (target) target.remove();
        });
        this.focus();
        return true;
    }

    /**
     * Removes the entire table containing the active cell.
     */
    public deleteTable(): boolean {
        const cell = this.getActiveCell();
        const table = cell?.closest('table');
        if (!table) return false;

        table.remove();
        this.focus();
        return true;
    }

    public queryState(command: string): boolean {
        try {
            return document.queryCommandState(command);
        } catch {
            return false;
        }
    }

    public queryValue(command: string): string {
        try {
            return String(document.queryCommandValue(command) || '');
        } catch {
            return '';
        }
    }

    private getActiveRange(): Range | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const containerElement =
            container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;

        return containerElement && this.editorArea.contains(containerElement) ? range : null;
    }

    private getClosestEditableBlock(node: Node): HTMLElement | null {
        const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
        const block = element?.closest<HTMLElement>('p,div,li,blockquote,h1,h2,h3,h4,h5,h6,pre');

        return block && this.editorArea.contains(block) && block !== this.editorArea ? block : null;
    }

    private isEmptyBlock(block: HTMLElement): boolean {
        return block.textContent?.replace(/\u00A0/g, ' ').trim() === '' && !block.querySelector('img,video,iframe,table');
    }

    private insertBlockNodes(nodes: Node[]): void {
        const range = this.getActiveRange();
        if (!range) {
            this.editorArea.append(...nodes);
            return;
        }

        range.deleteContents();

        const block = this.getClosestEditableBlock(range.commonAncestorContainer);
        if (block) {
            block.after(...nodes);
            if (this.isEmptyBlock(block)) {
                block.remove();
            }
            return;
        }

        const fragment = document.createDocumentFragment();
        fragment.append(...nodes);
        range.insertNode(fragment);
    }

    private insertFragment(fragment: DocumentFragment, caretNode?: Node): boolean {
        const range = this.getActiveRange();
        if (!range) {
            this.editorArea.appendChild(fragment);
            if (caretNode) {
                this.placeCaretAtStart(caretNode);
            } else {
                this.placeCaretAtEnd(this.editorArea);
            }
            this.focus();
            return true;
        }

        const lastNode = caretNode || fragment.lastChild;
        range.deleteContents();
        range.insertNode(fragment);

        if (lastNode) {
            this.placeCaretAfter(lastNode);
        }
        this.focus();
        return true;
    }

    private insertNode(node: Node, existingRange?: Range): boolean {
        const range = existingRange || this.getActiveRange();
        if (!range) {
            this.editorArea.appendChild(node);
            this.placeCaretAfter(node);
            this.focus();
            return true;
        }

        range.deleteContents();
        range.insertNode(node);
        this.placeCaretAfter(node);
        this.focus();
        return true;
    }

    private placeCaretAfter(node: Node): void {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    private placeCaretAtEnd(element: HTMLElement): void {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    private placeCaretAtStart(node: Node): void {
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(true);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}

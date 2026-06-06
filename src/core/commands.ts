/**
 * Small command facade around browser editing APIs.
 * It keeps legacy execCommand usage centralized while high-risk commands move to DOM operations.
 */
export class CommandAdapter {
    private editorArea: HTMLElement;

    constructor(editorArea: HTMLElement) {
        this.editorArea = editorArea;
    }

    public focus(): void {
        this.editorArea.focus();
    }

    public exec(command: string, value: string = ''): boolean {
        this.focus();
        return document.execCommand(command, false, value);
    }

    public insertHTML(html: string): boolean {
        const fragment = document.createRange().createContextualFragment(html);
        return this.insertFragment(fragment);
    }

    public insertText(text: string): boolean {
        return this.insertNode(document.createTextNode(text));
    }

    public formatBlock(value: string): boolean {
        return this.exec('formatBlock', value);
    }

    public createLink(url: string): boolean {
        const selection = window.getSelection();
        const link = document.createElement('a');
        link.href = url;
        link.rel = 'noopener noreferrer';

        if (selection && selection.rangeCount > 0 && this.editorArea.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            link.textContent = selectedText || url;
            range.deleteContents();
            return this.insertNode(link, range);
        }

        link.textContent = url;
        return this.insertNode(link);
    }

    public insertImage(url: string): boolean {
        const image = document.createElement('img');
        image.src = url;
        image.alt = 'image';
        return this.insertNode(image);
    }

    public insertVideo(url: string): boolean {
        const video = document.createElement('video');
        video.src = url;
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

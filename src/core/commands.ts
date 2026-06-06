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

    private insertFragment(fragment: DocumentFragment): boolean {
        const range = this.getActiveRange();
        if (!range) {
            this.editorArea.appendChild(fragment);
            this.placeCaretAtEnd(this.editorArea);
            this.focus();
            return true;
        }

        const lastNode = fragment.lastChild;
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
}

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
        return this.exec('insertHTML', html);
    }

    public insertText(text: string): boolean {
        return this.exec('insertText', text);
    }

    public formatBlock(value: string): boolean {
        return this.exec('formatBlock', value);
    }

    public createLink(url: string): boolean {
        return this.exec('createLink', url);
    }

    public insertImage(url: string): boolean {
        return this.exec('insertImage', url);
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
}

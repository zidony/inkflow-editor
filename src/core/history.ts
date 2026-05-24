/**
 * History Manager
 * Manages the undo/redo stack for the editor's HTML content.
 */
export class HistoryManager {
    private stack: string[] = [];
    private currentIndex: number = -1;
    private readonly MAX_HISTORY_LENGTH = 50;

    /**
     * Initializes a new history manager with an optional initial state.
     * @param initialHtml The starting HTML state of the editor.
     */
    constructor(initialHtml: string = '') {
        this.saveSnapshot(initialHtml);
    }

    /**
     * Pushes a new HTML snapshot into the history stack.
     * Overwrites any future redo states if a new edit occurs after an undo.
     * @param html The current HTML state of the editor.
     */
    public saveSnapshot(html: string): void {
        if (this.currentIndex >= 0 && this.stack[this.currentIndex] === html) {
            return;
        }

        if (this.currentIndex < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.currentIndex + 1);
        }

        this.stack.push(html);

        if (this.stack.length > this.MAX_HISTORY_LENGTH) {
            this.stack.shift();
        } else {
            this.currentIndex++;
        }
    }

    /**
     * Retrieves the previous HTML snapshot (Undo).
     * @returns The previous HTML string, or null if no history exists.
     */
    public undo(): string | null {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.stack[this.currentIndex];
        }
        return null;
    }

    /**
     * Retrieves the next HTML snapshot (Redo).
     * @returns The next HTML string, or null if at the latest state.
     */
    public redo(): string | null {
        if (this.currentIndex < this.stack.length - 1) {
            this.currentIndex++;
            return this.stack[this.currentIndex];
        }
        return null;
    }
}

/**
 * History Manager
 * Manages the undo/redo stack for the editor's HTML content.
 */
export class HistoryManager {
    private stack: string[] = [];
    private currentIndex: number = -1;
    private readonly MAX_HISTORY_LENGTH = 50;
    private readonly MAX_HISTORY_BYTES = 5 * 1024 * 1024; // 5MB total memory limit
    private totalBytes = 0;

    /**
     * Initializes a new history manager with an optional initial state.
     * @param initialHtml The starting HTML state of the editor.
     */
    constructor(initialHtml: string = '') {
        this.saveSnapshot(initialHtml);
    }

    /**
     * Rough memory footprint of a snapshot (JS strings are UTF-16, ~2 bytes/char).
     */
    private byteSizeOf(html: string): number {
        return html.length * 2;
    }

    /**
     * Pushes a new HTML snapshot into the history stack.
     * Overwrites any future redo states if a new edit occurs after an undo.
     * Includes memory management to prevent heap overflow on massive documents.
     * @param html The current HTML state of the editor.
     * @returns True when a new snapshot is added; false when it is unchanged.
     */
    public saveSnapshot(html: string): boolean {
        if (this.currentIndex >= 0 && this.stack[this.currentIndex] === html) {
            return false;
        }

        // Drop any redo states ahead of the cursor, reclaiming their bytes.
        if (this.currentIndex < this.stack.length - 1) {
            for (let i = this.currentIndex + 1; i < this.stack.length; i++) {
                this.totalBytes -= this.byteSizeOf(this.stack[i]);
            }
            this.stack = this.stack.slice(0, this.currentIndex + 1);
        }

        this.stack.push(html);
        this.totalBytes += this.byteSizeOf(html);
        this.currentIndex++;

        // Prune from the front if the stack exceeds max length or memory.
        // Byte accounting is incremental, so each prune is O(1).
        while (
            (this.stack.length > this.MAX_HISTORY_LENGTH ||
                this.totalBytes > this.MAX_HISTORY_BYTES) &&
            this.stack.length > 1
        ) {
            const removed = this.stack.shift() as string;
            this.totalBytes -= this.byteSizeOf(removed);
            this.currentIndex--;
        }

        return true;
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

/**
 * History Manager
 * Manages the undo/redo stack for the editor's HTML content.
 */
export declare class HistoryManager {
    private stack;
    private currentIndex;
    private readonly MAX_HISTORY_LENGTH;
    private readonly MAX_HISTORY_BYTES;
    /**
     * Initializes a new history manager with an optional initial state.
     * @param initialHtml The starting HTML state of the editor.
     */
    constructor(initialHtml?: string);
    /**
     * Calculates the rough memory footprint of the current history stack.
     */
    private getStackByteSize;
    /**
     * Pushes a new HTML snapshot into the history stack.
     * Overwrites any future redo states if a new edit occurs after an undo.
     * Includes memory management to prevent heap overflow on massive documents.
     * @param html The current HTML state of the editor.
     */
    saveSnapshot(html: string): void;
    /**
     * Retrieves the previous HTML snapshot (Undo).
     * @returns The previous HTML string, or null if no history exists.
     */
    undo(): string | null;
    /**
     * Retrieves the next HTML snapshot (Redo).
     * @returns The next HTML string, or null if at the latest state.
     */
    redo(): string | null;
}

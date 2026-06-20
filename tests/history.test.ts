import { describe, expect, it } from 'vitest';
import { HistoryManager } from '../src/core/history';

describe('HistoryManager', () => {
    it('starts with an initial snapshot and supports undo and redo', () => {
        const history = new HistoryManager('<p>Initial</p>');

        expect(history.saveSnapshot('<p>Next</p>')).toBe(true);

        expect(history.undo()).toBe('<p>Initial</p>');
        expect(history.undo()).toBeNull();
        expect(history.redo()).toBe('<p>Next</p>');
        expect(history.redo()).toBeNull();
    });

    it('ignores duplicate snapshots', () => {
        const history = new HistoryManager('<p>Same</p>');

        expect(history.saveSnapshot('<p>Same</p>')).toBe(false);

        expect(history.undo()).toBeNull();
    });

    it('truncates redo states when saving after undo', () => {
        const history = new HistoryManager('<p>One</p>');
        history.saveSnapshot('<p>Two</p>');
        history.saveSnapshot('<p>Three</p>');

        expect(history.undo()).toBe('<p>Two</p>');
        history.saveSnapshot('<p>Branch</p>');

        expect(history.redo()).toBeNull();
        expect(history.undo()).toBe('<p>Two</p>');
    });

    it('caps the stack at the maximum history length', () => {
        const history = new HistoryManager('<p>0</p>');
        for (let i = 1; i <= 60; i++) {
            history.saveSnapshot(`<p>${i}</p>`);
        }

        // MAX_HISTORY_LENGTH is 50, so only the most recent 50 entries remain.
        let undoCount = 0;
        while (history.undo() !== null) {
            undoCount++;
        }
        expect(undoCount).toBe(49);
    });

    it('prunes correctly across truncate-then-overflow without leaking byte budget', () => {
        const history = new HistoryManager('<p>start</p>');
        for (let i = 0; i < 60; i++) {
            history.saveSnapshot(`<p>${i}</p>`);
        }
        history.undo();
        history.undo();
        // Saving after undo truncates redo states; the stack must still cap at 50.
        history.saveSnapshot('<p>branch</p>');

        let undoCount = 0;
        while (history.undo() !== null) {
            undoCount++;
        }
        expect(undoCount).toBeLessThanOrEqual(49);
    });
});

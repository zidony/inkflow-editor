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
});

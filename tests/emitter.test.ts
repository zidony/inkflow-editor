import { afterEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from '../src/core/emitter';

describe('EventEmitter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('subscribes and emits events with arguments', () => {
        const emitter = new EventEmitter();
        const handler = vi.fn();

        emitter.on('change', handler);
        emitter.emit('change', '<p>HTML</p>', 1);

        expect(handler).toHaveBeenCalledWith('<p>HTML</p>', 1);
    });

    it('removes a subscribed handler', () => {
        const emitter = new EventEmitter();
        const handler = vi.fn();

        emitter.on('change', handler);
        emitter.off('change', handler);
        emitter.emit('change');

        expect(handler).not.toHaveBeenCalled();
    });

    it('continues notifying handlers when one handler throws', () => {
        const emitter = new EventEmitter();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const healthyHandler = vi.fn();

        emitter.on('change', () => {
            throw new Error('broken handler');
        });
        emitter.on('change', healthyHandler);
        emitter.emit('change');

        expect(errorSpy).toHaveBeenCalledOnce();
        expect(healthyHandler).toHaveBeenCalledOnce();
    });

    it('clears all handlers', () => {
        const emitter = new EventEmitter();
        const handler = vi.fn();

        emitter.on('change', handler);
        emitter.clear();
        emitter.emit('change');

        expect(handler).not.toHaveBeenCalled();
    });
});

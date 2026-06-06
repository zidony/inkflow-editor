type EventHandler = (...args: unknown[]) => void;

/**
 * A lightweight Pub/Sub Event Emitter for managing editor lifecycle and action events.
 */
export class EventEmitter {
    private events: Map<string, Set<EventHandler>> = new Map();

    /**
     * Subscribe to an event.
     * @param event The event name.
     * @param handler The callback function.
     */
    public on(event: string, handler: EventHandler): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(handler);
    }

    /**
     * Unsubscribe from an event.
     * @param event The event name.
     * @param handler The callback function to remove.
     */
    public off(event: string, handler: EventHandler): void {
        if (this.events.has(event)) {
            this.events.get(event)!.delete(handler);
        }
    }

    /**
     * Emit an event, calling all registered handlers.
     * @param event The event name.
     * @param args Arguments to pass to the handlers.
     */
    public emit(event: string, ...args: unknown[]): void {
        if (this.events.has(event)) {
            for (const handler of this.events.get(event)!) {
                try {
                    handler(...args);
                } catch (e) {
                    console.error(`[EventEmitter] Error in handler for event '${event}':`, e);
                }
            }
        }
    }

    /**
     * Clear all event listeners.
     */
    public clear(): void {
        this.events.clear();
    }
}

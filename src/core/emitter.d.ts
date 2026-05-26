type EventHandler = (...args: any[]) => void;
/**
 * A lightweight Pub/Sub Event Emitter for managing editor lifecycle and action events.
 */
export declare class EventEmitter {
    private events;
    /**
     * Subscribe to an event.
     * @param event The event name.
     * @param handler The callback function.
     */
    on(event: string, handler: EventHandler): void;
    /**
     * Unsubscribe from an event.
     * @param event The event name.
     * @param handler The callback function to remove.
     */
    off(event: string, handler: EventHandler): void;
    /**
     * Emit an event, calling all registered handlers.
     * @param event The event name.
     * @param args Arguments to pass to the handlers.
     */
    emit(event: string, ...args: any[]): void;
    /**
     * Clear all event listeners.
     */
    clear(): void;
}
export {};

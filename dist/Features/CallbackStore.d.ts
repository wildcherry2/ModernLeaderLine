/** Simple base class to add, remove, and trigger callbacks. */
export declare abstract class CallbackStore<Args extends any[]> {
    /** Add a callback. */
    addCallback(cb: ((...args: Args) => any)): void;
    /** Remove a callback. */
    removeCallback(cb: ((...args: Args) => any)): void;
    /** Iteratively invoke all callbacks with {@link args}. */
    trigger(...args: Args): void;
    /** Dispose all callbacks. */
    dispose(): void;
    /** Whether or not any callbacks are registered. */
    get hasCallbacks(): number;
    private _set;
}

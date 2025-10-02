/** Simple base class to add, remove, and trigger callbacks. */
export abstract class CallbackStore<Args extends any[]> {

    /** Add a callback. */
    addCallback(cb: ((...args: Args) => any)) { 
        this._set ??= new Set();
        this._set.add(cb); 
    }

    /** Remove a callback. */
    removeCallback(cb: ((...args: Args) => any)) { 
        this._set?.delete(cb);
        if(!this.hasCallbacks) delete this._set;
    }

    /** Iteratively invoke all callbacks with {@link args}. */
    trigger(...args: Args) { this._set?.forEach(cb => cb(...args)); }

    /** Dispose all callbacks. */
    dispose() { this._set.clear(); }

    /** Whether or not any callbacks are registered. */
    get hasCallbacks() { return this._set && this._set.size; }
    private _set: Set<((...args: Args) => any)>;
}
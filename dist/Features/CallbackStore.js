/** Simple base class to add, remove, and trigger callbacks. */
export class CallbackStore {
    /** Add a callback. */
    addCallback(cb) {
        this._set ??= new Set();
        this._set.add(cb);
    }
    /** Remove a callback. */
    removeCallback(cb) {
        this._set?.delete(cb);
        if (!this.hasCallbacks)
            delete this._set;
    }
    /** Iteratively invoke all callbacks with {@link args}. */
    trigger(...args) { this._set?.forEach(cb => cb(...args)); }
    /** Dispose all callbacks. */
    dispose() { this._set.clear(); }
    /** Whether or not any callbacks are registered. */
    get hasCallbacks() { return this._set && this._set.size; }
    _set;
}
//# sourceMappingURL=CallbackStore.js.map
/** Mixin that can be applied to any {@link ElementBase} child class that adds callbacks for when certain attributes are changed. */
export function attributeObserverMixin(ctor) {
    if ('addAttributeChangedCallback' in ctor.prototype)
        return ctor; // if already mixed in, return the ctor as-is.
    /**
     * Mixin implementation.
     *
     * Uses a single {@link MutationObserver} to observe all attribute changes.
     */
    class AttributeObserverMixinClass extends ctor {
        addAttributeChangedCallback(attribute_name, callback, once, call_now) {
            if (!attribute_name || !callback)
                return;
            const map = once ? this.__attribute_observer_data.once_callbacks : this.__attribute_observer_data.callbacks;
            const set = map.get(attribute_name) || map.set(attribute_name, new Set()).get(attribute_name);
            set.add(callback);
            if (call_now) {
                callback(this.getAttribute(attribute_name), undefined, attribute_name, this);
            }
            if (!this.__attribute_observer_data.currently_observing.includes(attribute_name))
                this.__attribute_observer_observe_attribute(attribute_name);
        }
        removeAttributeChangedCallback(attribute_name, callback, once) {
            if (!attribute_name || !callback)
                return;
            const map = once ? this.__attribute_observer_data.once_callbacks : this.__attribute_observer_data.callbacks;
            const set = map.get(attribute_name);
            if (!set)
                return;
            set.delete(callback);
            if (!set.size) {
                map.delete(attribute_name);
                if ((once ? this.__attribute_observer_data.callbacks : this.__attribute_observer_data.once_callbacks).has(attribute_name))
                    return;
                this.__attribute_observer_unobserve_attribute(attribute_name);
            }
        }
        /** Helper to start observing an attribute, if it's not being observed already. */
        __attribute_observer_observe_attribute(attribute_name) {
            const idx = this.__attribute_observer_data.currently_observing.indexOf(attribute_name);
            if (idx !== -1)
                return;
            this.__attribute_observer_data.currently_observing.push(attribute_name);
            this.__attribute_observer_data.observer.disconnect();
            this.__attribute_observer_data.observer.observe(this, {
                attributeFilter: this.__attribute_observer_data.currently_observing,
                attributeOldValue: true,
                attributes: true,
            });
        }
        /** Helper to stop observing an attribute, does not check if callbacks are registered (responsibility of {@link removeAttributeChangedCallback}). */
        __attribute_observer_unobserve_attribute(attribute_name) {
            const idx = this.__attribute_observer_data.currently_observing.indexOf(attribute_name);
            if (idx === -1)
                return;
            this.__attribute_observer_data.currently_observing.splice(idx, 1);
            this.__attribute_observer_data.observer.disconnect();
            if (!this.__attribute_observer_data.currently_observing.length)
                return;
            this.__attribute_observer_data.observer.observe(this, {
                attributeFilter: this.__attribute_observer_data.currently_observing,
                attributeOldValue: true,
                attributes: true,
            });
        }
        /** {@link MutationCallback} that's called when an attribute changes. If a changed attribute has callbacks, they are invoked. */
        __attribute_changed_cb = (entries) => {
            entries.forEach(entry => {
                const name = entry.attributeName;
                const attr_val = this.getAttribute(name);
                const cbs = this.__attribute_observer_data.callbacks.get(name);
                const once_cbs = this.__attribute_observer_data.once_callbacks.get(name);
                cbs?.forEach(cb => cb(attr_val, entry.oldValue, name, this));
                if (once_cbs) {
                    once_cbs.forEach(cb => cb(attr_val, entry.oldValue, name, this));
                    this.__attribute_observer_data.once_callbacks.delete(name);
                }
                if (!cbs)
                    this.__attribute_observer_unobserve_attribute(name);
            });
        };
        /** Helper object to track observed attributes and their callbacks. */
        __attribute_observer_data = {
            observer: new MutationObserver(this.__attribute_changed_cb), // the observer
            callbacks: new Map(), // map of attribute, set<callback> pairs that aren't invoked once
            once_callbacks: new Map(), // map of attribute, set<callback> pairs that are invoked once
            // attributes being currently observed, stored here to avoid 2 calls to map.keys and merging the results. 
            // use array instead of set since checking for an attribute's existence is done with callbacks/once_callbacks and insertions have overhead with sets
            currently_observing: []
        };
    }
    return AttributeObserverMixinClass;
}
export function attributeProperty(value_or_options, context) {
    if (isContext(context)) {
        const normalized = normalizeDecoratorArgs(String(context.name), value_or_options, context);
        return invokeResolvedAttrPropDecorator(value_or_options, context, normalized);
    }
    return (value, context) => attributeProperty(value, context);
}
/** Helper which sets up an {@link attributeProperty} as the {@link opts} specify in the {@link context}'s initializer. */
function invokeResolvedAttrPropDecorator(value, context, opts) {
    let initializer;
    context.addInitializer(function () {
        switch (opts.type) {
            // handle boolean reflected attributes
            case 'boolean': {
                // 'initializer' methods in converter objects run once to initialize values and attribute changed listeners.
                // They might be called immediately if the field is initialized to a value (where is_init is true) or 
                // lazily after the first 'get' or 'set' with the property (where is_init is false).
                initializer = (is_init) => {
                    if (!is_init) {
                        const nv = this.hasAttribute(opts.name);
                        value.set.call(this, nv);
                        opts.reaction?.call(this, nv, undefined, opts.name);
                    }
                    this.addAttributeChangedCallback(opts.name, (_nv, _ov, attr_name) => {
                        const nv = this.hasAttribute(attr_name);
                        const old = value.get.call(this);
                        value.set.call(this, nv);
                        opts.reaction?.call(this, nv, old, attr_name);
                    });
                    initializer = undefined;
                };
                break;
            }
            // handle numerical type reflected attributes
            case 'number': {
                initializer = (is_init) => {
                    if (!is_init) {
                        let parsed;
                        try {
                            parsed = parseInt(this.getAttribute(opts.name));
                        }
                        catch { }
                        if (parsed !== undefined) {
                            value.set.call(this, parsed);
                            opts.reaction?.call(this, parsed, undefined, opts.name);
                        }
                    }
                    this.addAttributeChangedCallback(opts.name, nv => {
                        let parsed;
                        try {
                            parsed = parseInt(nv);
                        }
                        catch {
                            return;
                        }
                        const old = value.get.call(this);
                        value.set.call(this, parsed);
                        opts.reaction?.call(this, parsed, old, opts.name);
                    });
                    initializer = undefined;
                };
                break;
            }
            // handle custom converter or string type
            default: {
                // if custom converter provided, use it
                if (opts.converter) {
                    initializer = (is_init) => {
                        if (!is_init) {
                            let parsed;
                            try {
                                parsed = opts.converter.fromAttribute(this.getAttribute(opts.name), '', opts.name);
                            }
                            catch { }
                            if (parsed !== undefined) {
                                const old = value.get.call(this);
                                value.set.call(this, parsed);
                                opts.reaction?.call(this, parsed, old, opts.name);
                            }
                        }
                        this.addAttributeChangedCallback(opts.name, nv => {
                            let parsed;
                            try {
                                parsed = parseInt(nv);
                            }
                            catch {
                                return;
                            }
                            const old = value.get.call(this);
                            value.set.call(this, parsed);
                            opts.reaction?.call(this, nv, old, opts.name);
                        });
                        initializer = undefined;
                    };
                    break;
                }
                // otherwise, assume the type of the field is a string
                else {
                    initializer = (is_init) => {
                        if (!is_init) {
                            const current = this.getAttribute(opts.name);
                            if (current !== null) {
                                value.set.call(this, current);
                                opts.reaction?.call(this, current, undefined, opts.name);
                            }
                        }
                        this.addAttributeChangedCallback(opts.name, (nv, ov) => {
                            value.set.call(this, nv);
                            opts.reaction?.call(this, nv, ov, opts.name);
                        });
                        initializer = undefined;
                    };
                }
            }
        }
    });
    return {
        get() {
            initializer?.();
            return value.get.call(this);
        },
        set(value) {
            initializer?.();
            // setting the attribute invokes attribute change listener setup in initializer, avoiding echoes
            this.setAttribute(opts.name, opts.converter?.toAttribute(value) ?? value.toString());
        },
        init(value) {
            if (value === undefined)
                return value; // if the field isn't initialized to anything, don't bother initializing yet
            this.setAttribute(opts.name, opts.converter?.toAttribute(value) ?? value.toString()); // otherwise, set the attribute to the field value before initializing
            initializer?.(true); // pass 'true' to avoid an unneeded conversion from attribute to value.
            return value;
        },
    };
}
/** Helper that determines if {@link ctx} is an {@link ClassAccessorDecoratorContext}. */
function isContext(ctx) {
    return ctx && 'kind' in ctx;
}
/** Takes arguments from {@link attributeProperty} and converts them to a consistent {@link AttrPropNormalizedOptions}. */
function normalizeDecoratorArgs(ctx_name, ...args) {
    if (!args[0] || 'kind' in args[1])
        return {
            name: String(ctx_name).toLowerCase().replaceAll('_', '-'),
            reflection: 'attr-prop'
        };
    const ret = {};
    ret.name = args[0].name || String(ctx_name).toLowerCase().replaceAll('_', '-');
    ret.reflection = args[0].reflection || 'attr-prop';
    ret.type = args[0].type;
    ret.converter = args[0].converter;
    ret.reaction = args[0].reaction;
    return ret;
}
//# sourceMappingURL=AttributeObserver.js.map
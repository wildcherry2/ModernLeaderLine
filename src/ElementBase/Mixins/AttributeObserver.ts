/** Interface for mixin that can be applied to any {@link ElementBase} child class that adds callbacks for when certain attributes are changed. */
export interface AttributeObserverMixin extends HTMLElement {
    /**
     * Add a callback to be invoked when an attribute's value changes.
     * @param attribute_name The name of the attribute.
     * @param callback The callback to execute.
     * @param once Whether this callback should only be executed once (self-removes after first invocation).
     * @param call_now Whether this callback should be executed now, with the current value of the attribute.
     */
    addAttributeChangedCallback(attribute_name: string, callback: TAttributeObserverCallback<this>, once?: boolean, call_now?: boolean): void;

    /**
     * Remove a callback that's listening for specific attribute changes.
     * @param attribute_name The name of the attribute.
     * @param callback The callback that was added.
     * @param once Whether this was registered as a callback to be executed once.
     */
    removeAttributeChangedCallback(attribute_name: string, callback: TAttributeObserverCallback<this>, once?: boolean): void;
}

/** Helper type to help with type deduction when this mixin is used. */
export type AttributeObservableCtor = (abstract new(...args: any[]) => HTMLElement);

/** Callback type for attribute change listeners.*/
export type TAttributeObserverCallback<T> = (new_value: string, old_value: string, attribute_name: string, target: T) => any;

/** Mixin that can be applied to any {@link ElementBase} child class that adds callbacks for when certain attributes are changed. */
export function attributeObserverMixin<T extends AttributeObservableCtor>(ctor: T) {
    if('addAttributeChangedCallback' in ctor.prototype) return ctor as typeof AttributeObserverMixinClass; // if already mixed in, return the ctor as-is.

    /** 
     * Mixin implementation. 
     * 
     * Uses a single {@link MutationObserver} to observe all attribute changes.
     */
    abstract class AttributeObserverMixinClass extends ctor implements AttributeObserverMixin {
        addAttributeChangedCallback(attribute_name: string, callback: TAttributeObserverCallback<this>, once?: boolean, call_now?: boolean): void {
            if(!attribute_name || !callback) return;
            const map = once ? this.__attribute_observer_data.once_callbacks : this.__attribute_observer_data.callbacks;
            const set = map.get(attribute_name) || map.set(attribute_name, new Set()).get(attribute_name);
            set.add(callback);
            if(call_now) { callback(this.getAttribute(attribute_name), undefined, attribute_name, this); }
            if(!this.__attribute_observer_data.currently_observing.includes(attribute_name)) this.__attribute_observer_observe_attribute(attribute_name);
        }

        removeAttributeChangedCallback(attribute_name: string, callback: TAttributeObserverCallback<this>, once?: boolean): void {
            if(!attribute_name || !callback) return;
            const map = once ? this.__attribute_observer_data.once_callbacks : this.__attribute_observer_data.callbacks;
            const set = map.get(attribute_name);
            if(!set) return;
            set.delete(callback);
            if(!set.size) {
                map.delete(attribute_name);
                if((once ? this.__attribute_observer_data.callbacks : this.__attribute_observer_data.once_callbacks).has(attribute_name)) return;
                this.__attribute_observer_unobserve_attribute(attribute_name);
            }
        }

        /** Helper to start observing an attribute, if it's not being observed already. */
        __attribute_observer_observe_attribute(attribute_name: string) {
            const idx = this.__attribute_observer_data.currently_observing.indexOf(attribute_name);
            if(idx !== -1) return;
            this.__attribute_observer_data.currently_observing.push(attribute_name);
            this.__attribute_observer_data.observer.disconnect();
            this.__attribute_observer_data.observer.observe(this, {
                attributeFilter: this.__attribute_observer_data.currently_observing,
                attributeOldValue: true,
                attributes: true,
            })
        }

        /** Helper to stop observing an attribute, does not check if callbacks are registered (responsibility of {@link removeAttributeChangedCallback}). */
        __attribute_observer_unobserve_attribute(attribute_name: string) {
            const idx = this.__attribute_observer_data.currently_observing.indexOf(attribute_name);
            if(idx === -1) return;
            this.__attribute_observer_data.currently_observing.splice(idx, 1);
            this.__attribute_observer_data.observer.disconnect();
            if(!this.__attribute_observer_data.currently_observing.length) return;
            this.__attribute_observer_data.observer.observe(this, {
                attributeFilter: this.__attribute_observer_data.currently_observing,
                attributeOldValue: true,
                attributes: true,
            })
        }

        /** {@link MutationCallback} that's called when an attribute changes. If a changed attribute has callbacks, they are invoked. */
        __attribute_changed_cb = (entries: MutationRecord[]) => {
            entries.forEach(entry => {
                const name = entry.attributeName;
                const attr_val = this.getAttribute(name);
                const cbs = this.__attribute_observer_data.callbacks.get(name);
                const once_cbs = this.__attribute_observer_data.once_callbacks.get(name);
                cbs?.forEach(cb => cb(attr_val, entry.oldValue, name, this));
                if(once_cbs) {
                    once_cbs.forEach(cb => cb(attr_val, entry.oldValue, name, this));
                    this.__attribute_observer_data.once_callbacks.delete(name);
                }
                if(!cbs) this.__attribute_observer_unobserve_attribute(name);
            })
        }

        /** Helper object to track observed attributes and their callbacks. */
        __attribute_observer_data = {
            observer: new MutationObserver(this.__attribute_changed_cb),                // the observer
            callbacks: new Map<string, Set<TAttributeObserverCallback<this>>>(),        // map of attribute, set<callback> pairs that aren't invoked once
            once_callbacks: new Map<string, Set<TAttributeObserverCallback<this>>>(),   // map of attribute, set<callback> pairs that are invoked once
            // attributes being currently observed, stored here to avoid 2 calls to map.keys and merging the results. 
            // use array instead of set since checking for an attribute's existence is done with callbacks/once_callbacks and insertions have overhead with sets
            currently_observing: [] as string[]                                         
        }

    }

    return AttributeObserverMixinClass;
}

/** Type of reflected property change callback */
export type AttributePropertyReaction<ThisType, T = string> = (this: ThisType, new_value: T, old_value: T, attribute_name: string) => void;

/** 
 * Type of directionality of reflected attribute property (attr-prop is unidirectional from attribute to property).
 * NOTE: currently, only bidirectional is supported and setting 'attr-prop' uses bidirectional behavior.
 */
export type AttributePropertyReflectionKey = 'attr-prop' | 'bidirectional';

/** Factory type for {@link attributeProperty} decorator. */
export type AttributePropertyDecoratorFactory<T extends AttributeObserverMixin, V> = (value: ClassAccessorDecoratorTarget<T, V>, context: ClassAccessorDecoratorContext<T, V>) => ClassAccessorDecoratorResult<T, V>;

/** Interface for custom property converter. */
export interface AttributePropertyConverter<T> {
    fromAttribute(new_value: string, old_value: string, attribute_name: string): T;
    toAttribute(value: T): string;
}

/** Mapping for default converters. */
export interface AttributePropertyDefaultConverters {
    'boolean': boolean
    'number': number
}

/** {@link attributeProperty} options type using a default converter. */
export interface AttributePropertyOptions<ThisType extends AttributeObserverMixin, K extends keyof AttributePropertyDefaultConverters> {
    /** Name of corresponding attribute. Defaults to lowercased name of field with underscores replaced with dashes. */
    name?: string;

    /** Default converter to use, can be inferred. */
    type: K;

    /** Directionality choice. */
    reflection?: AttributePropertyReflectionKey;

    /** Callback to invoke when attribute changes. Will be invoked as a member function ('this' is the {@link AttributeObserverMixin} element). */
    reaction?: AttributePropertyReaction<ThisType, AttributePropertyDefaultConverters[K]>
}

/** {@link attributeProperty} options type with custom converter. The generic 'T' is the type of the field. */
export interface AttributePropertyOptionsWithConverter<ThisType extends AttributeObserverMixin, T> {
    /** Name of corresponding attribute. Defaults to lowercased name of field with underscores replaced with dashes. */
    name?: string;

    /** Custom converter of type {@link AttributePropertyConverter} to use. */
    converter: AttributePropertyConverter<T>;

    /** Directionality choice. */
    reflection?: AttributePropertyReflectionKey;

    /** Callback to invoke when attribute changes. Will be invoked as a member function ('this' is the {@link AttributeObserverMixin} element). */
    reaction?: AttributePropertyReaction<ThisType, T>;
}

/** {@link attributeProperty} options type with no converter. This assumes the field is a 'string' type. */
export interface AttributePropertyOptionsNoConverter<ThisType extends AttributeObserverMixin> {

    /** Name of corresponding attribute. Defaults to lowercased name of field with underscores replaced with dashes. */
    name?: string;

    /** Directionality choice. */
    reflection?: AttributePropertyReflectionKey;

    /** Callback to invoke when attribute changes. Will be invoked as a member function ('this' is the {@link AttributeObserverMixin} element). */
    reaction?: AttributePropertyReaction<ThisType>;
}

/** Type of 'normalized' {@link attributeProperty} options that can represent any of the possible option types with defaults filled in where needed. */
interface AttrPropNormalizedOptions<ThisType extends AttributeObserverMixin> {
    name: string;
    type?: keyof AttributePropertyDefaultConverters;
    converter?: AttributePropertyConverter<any>;
    reflection: AttributePropertyReflectionKey;
    reaction?: AttributePropertyReaction<ThisType, any>;
}

/**
 * Field accessor decorator that uses the {@link AttributeObserverMixin} to bind a field to an attribute in either a uni- or bi-directional fashion.
 * @param options Options to use when initializing the decorator (optional).
 */
export function attributeProperty<T extends AttributeObserverMixin, K extends keyof AttributePropertyDefaultConverters>(options: AttributePropertyOptions<T, K>): AttributePropertyDecoratorFactory<T, AttributePropertyDefaultConverters[K]>;
export function attributeProperty<T extends AttributeObserverMixin, V>(options: AttributePropertyOptionsWithConverter<T, V>): AttributePropertyDecoratorFactory<T, V>;
export function attributeProperty<T extends AttributeObserverMixin>(options?: AttributePropertyOptionsNoConverter<T>): AttributePropertyDecoratorFactory<T, string>;
export function attributeProperty<T extends AttributeObserverMixin>(value: ClassAccessorDecoratorTarget<T, string>, context: ClassAccessorDecoratorContext<T, string>): ClassAccessorDecoratorResult<T, string>;
export function attributeProperty<T extends AttributeObserverMixin, V>(value_or_options?: unknown, context?: ClassAccessorDecoratorContext<T,V>) {
    if(isContext(context)) {
        const normalized = normalizeDecoratorArgs(String(context.name), value_or_options, context);
        return invokeResolvedAttrPropDecorator(value_or_options as any, context, normalized);
    }

    return (value: ClassAccessorDecoratorTarget<T, V>, context: ClassAccessorDecoratorContext<T, V>) => attributeProperty(value as any, context as any)

}

/** Helper which sets up an {@link attributeProperty} as the {@link opts} specify in the {@link context}'s initializer. */
function invokeResolvedAttrPropDecorator<T extends AttributeObserverMixin, V>(value: ClassAccessorDecoratorTarget<T, V>, context: ClassAccessorDecoratorContext<T, V>, opts: AttrPropNormalizedOptions<T>): ClassAccessorDecoratorResult<T, V> {
    let initializer: (is_init?: boolean) => void;
    context.addInitializer(function(){
        switch(opts.type) {
            // handle boolean reflected attributes
            case 'boolean': {
                // 'initializer' methods in converter objects run once to initialize values and attribute changed listeners.
                // They might be called immediately if the field is initialized to a value (where is_init is true) or 
                // lazily after the first 'get' or 'set' with the property (where is_init is false).
                initializer = (is_init) => { 
                    if(!is_init) {
                        const nv = this.hasAttribute(opts.name);
                        value.set.call(this, nv as V);
                        opts.reaction?.call(this, nv, undefined, opts.name);
                    }
                    this.addAttributeChangedCallback(opts.name, (_nv, _ov, attr_name) => {
                        const nv = this.hasAttribute(attr_name);
                        const old = value.get.call(this);
                        value.set.call(this, nv as V);
                        opts.reaction?.call(this,nv, old, attr_name);
                    });
                    initializer = undefined;
                }
                break;
            }

            // handle numerical type reflected attributes
            case 'number': {
                initializer = (is_init) => {
                    if(!is_init) {
                        let parsed: number;
                        try { parsed = parseInt(this.getAttribute(opts.name)) }
                        catch{}
                        if(parsed !== undefined) {
                            value.set.call(this, parsed as V);
                            opts.reaction?.call(this, parsed, undefined, opts.name);
                        }
                    }
                    this.addAttributeChangedCallback(opts.name, nv => {
                        let parsed: number;
                        try { parsed = parseInt(nv) }
                        catch{ return; }
                        const old = value.get.call(this);
                        value.set.call(this, parsed as V);
                        opts.reaction?.call(this, parsed, old, opts.name);
                    });
                    initializer = undefined;
                }
                break;
            }

            // handle custom converter or string type
            default: {

                // if custom converter provided, use it
                if(opts.converter) {
                    initializer = (is_init) => {
                        if(!is_init) {
                            let parsed: any;
                            try { parsed = opts.converter.fromAttribute(this.getAttribute(opts.name), '', opts.name) }
                            catch{}
                            if(parsed !== undefined) {
                                const old = value.get.call(this);
                                value.set.call(this, parsed);
                                opts.reaction?.call(this, parsed, old, opts.name);
                            }
                        }
                        this.addAttributeChangedCallback(opts.name, nv => {
                            let parsed: number;
                            try { parsed = parseInt(nv) }
                            catch{ return; }
                            const old = value.get.call(this);
                            value.set.call(this, parsed as V);
                            opts.reaction?.call(this, nv, old, opts.name);
                        });
                        initializer = undefined;
                    }
                    break;
                }

                // otherwise, assume the type of the field is a string
                else {
                    initializer = (is_init) => {
                        if(!is_init) {
                            const current = this.getAttribute(opts.name);
                            if(current !== null) {
                                value.set.call(this, current as V);
                                opts.reaction?.call(this, current, undefined, opts.name);
                            }
                        }
                        this.addAttributeChangedCallback(opts.name, (nv, ov) => {
                            value.set.call(this, nv as V);
                            opts.reaction?.call(this, nv, ov, opts.name);
                        });
                        initializer = undefined;
                    }
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
            if(value === undefined) return value;                                                   // if the field isn't initialized to anything, don't bother initializing yet
            this.setAttribute(opts.name, opts.converter?.toAttribute(value) ?? value.toString());   // otherwise, set the attribute to the field value before initializing
            initializer?.(true); // pass 'true' to avoid an unneeded conversion from attribute to value.
            return value;
        },
    }
}

/** Helper that determines if {@link ctx} is an {@link ClassAccessorDecoratorContext}. */
function isContext<T, V>(ctx: any): ctx is ClassAccessorDecoratorContext<T,V> {
    return ctx && 'kind' in ctx;
}

/** Takes arguments from {@link attributeProperty} and converts them to a consistent {@link AttrPropNormalizedOptions}. */
function normalizeDecoratorArgs<T extends AttributeObserverMixin> (ctx_name: string, ...args: any[]): AttrPropNormalizedOptions<T> {
    if(!args[0] || 'kind' in args[1]) return {
        name: String(ctx_name).toLowerCase().replaceAll('_', '-'),
        reflection: 'attr-prop'
    }

    const ret: Partial<AttrPropNormalizedOptions<T>> = {}
    ret.name = args[0].name || String(ctx_name).toLowerCase().replaceAll('_', '-');
    ret.reflection = args[0].reflection || 'attr-prop';
    ret.type = args[0].type;
    ret.converter = args[0].converter;
    ret.reaction = args[0].reaction;
    return ret as AttrPropNormalizedOptions<T>;
}
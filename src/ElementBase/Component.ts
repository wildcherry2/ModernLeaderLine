/** Abstract base class for a custom element with basic support for lifecycle callbacks and style/template loading. */
export abstract class ElementBase extends HTMLElement {
    /**
     * Constructor for {@link ElementBase}.
     * @param use_shadow Whether or not to use a shadow root.
     * @param shadow_options The options to use with the shadow root.
     */
    constructor(protected readonly use_shadow = true, shadow_options: ShadowRootInit = {'mode': 'open'}) {
        super();
        if(use_shadow) this.attachShadow(shadow_options);
        customElements.upgrade(this);
        const template = document.getElementById(this.tagName.toLowerCase()) as HTMLTemplateElement; // Template is generated from @customElement decorator
        if(!template) throw new Error(`Error constructing element with template id "${this.tagName.toLowerCase()}"! Template element could not be found.`);
        if(!(template instanceof HTMLTemplateElement)) throw new Error(`Error constructing element with template id "${this.tagName.toLowerCase()}"! Element type is not a template (tagName = "${(template as Element).tagName}")`)
        if(!('constructedStylesheet' in template)) return;

        // Attach the style sheet and elements from the template under the shadow root, if one is being used, or as children otherwise.
        if(use_shadow) {
            this.shadowRoot.adoptedStyleSheets.push(template['constructedStylesheet'] as any);
            this.shadowRoot.appendChild(template.content.cloneNode(true))
        }
        else {
            const ss = template['constructedStylesheet'] as CSSStyleSheet;
            const style_elem = this.appendChild(document.createElement('style'));
            for(let idx = 0; idx < ss.cssRules.length; ++idx) {
                style_elem.innerHTML += ss.cssRules.item(idx).cssText;
            }
            this.appendChild(template.content.cloneNode(true))
        }
    }

    /** Lifecycle callback for connection; invokes {@link onConnected}. */
    protected connectedCallback(): void {
        this.lifecycle_info.is_disconnecting = false;
        this.onConnected();
    }

    /** 
     * Lifecycle callback for disconnection.
     * 
     * Invokes disconnected callbacks if connected callbacks were called in {@link onConnected}.
     */
    protected disconnectedCallback(): void {
        this.lifecycle_info.is_disconnecting = true;
        if(this.lifecycle_info.connected_callbacks_called) {
            this.lifecycle_info.callbacks.disconnected.forEach(cb => cb(this, 'disconnected'));
            this.lifecycle_info.connected_callbacks_called = false;
        }
    }

    /** 
     * Add a lifecycle callback. Lifecycle callbacks are never automatically removed, unless the runtime destroys this element.
     * 
     * If the type is 'connected' and the connected callbacks have already been called, the callback is immediately invoked.
     * Either way, the callback is registered to be called when the lifecycle event designated by 'type' occurs.
     * 
     * @param type The type of lifecycle event to listen for.
     * @param callback The callback to be invoked on the lifecycle event.
     */
    addLifecycleCallback(type: TLifecycleCallbackTargetAction, callback: TLifecycleCallback<this>) {
        type === 'connected' ? this.lifecycle_info.callbacks.connected.add(callback) : this.lifecycle_info.callbacks.disconnected.add(callback);
        if(type === 'connected' && this.lifecycle_info.connected_callbacks_called) callback(this, type);
    }

    /**
     * Remove a lifecycle callback. Lifecycle callbacks are never automatically removed, unless the runtime destroys this element.
     * @param type The type of lifecycle event to remove.
     * @param callback The callback to be removed.
     */
    removeLifecycleCallback(type: TLifecycleCallbackTargetAction, callback: TLifecycleCallback<this>) {
        type === 'connected' ? this.lifecycle_info.callbacks.connected.delete(callback) : this.lifecycle_info.callbacks.disconnected.delete(callback);
    }

    /** 
     * Used by \@childRef decorator to create a weak IChildRef or strong reference to a child element in the template.
     * @param type Whether this should return a weak IChildRef or strong reference.
     * @param selector The selector of the child element.
     */
    protected createChildRef<T extends Element = Element>(type: 'weak', selector: string): IChildRef<T>;
    protected createChildRef<T extends Element = Element>(type: 'strong', selector: string): T;
    protected createChildRef<T extends Element = Element>(type: 'weak' | 'strong', selector: string) {
        if(type === 'weak') { return new ChildRefFromElementBase(selector, this); }
        return (this.shadowRoot ?? this).querySelector<T>(selector);
    }

    /** 
     * The inner HTML of this element's shadow root (or the element, if root is not being used). 
     * 
     * Implement in child classes of {@link ElementBase} to add a custom template. 
     * @returns The raw HTML string of the template this element uses.
     */
    static getTemplate(): string { return ''; }

    /**
     * The CSS style to be applied to this element's shadow root (or first child, if root is not being used).
     * @returns The raw CSS string of the template this element uses.
     */
    static getStyle(): string { return ''; }


    /**
     * Called by {@link connectedCallback}.
     * 
     * Waits for this element to be added to the DOM (since {@link connectedCallback} isn't necessarily called when the element
     * is fully ready and attached to the DOM) and invokes added connected callbacks.
     */
    private async onConnected() {
        while(!this.parentNode && !this.lifecycle_info.is_disconnecting) await new Promise(resolve => setTimeout(resolve, 0));
        if(!this.lifecycle_info.is_disconnecting) {
            this.lifecycle_info.callbacks.connected.forEach(cb => cb(this, 'connected'));
            this.lifecycle_info.connected_callbacks_called = true;
        }
    }

    /** Helper object to track lifecycle state and hold externally-added callbacks. */
    private lifecycle_info = {
        is_disconnecting: false,
        connected_callbacks_called: false,
        callbacks: {
            connected: new Set<TLifecycleCallback<this>>(),
            disconnected: new Set<TLifecycleCallback<this>>(),
        }
    }
}

/** Factory type for @customElement decorator. */
export type TElementBaseCustomElementDecoratorFactory<T extends typeof ElementBase> = (cls: T, context: ClassDecoratorContext<T>) => void;

/** Factory type for @childRef decorator. */
export type TElementBaseChildRefDecoratorFactory<T extends Element> = (value: ClassAccessorDecoratorTarget<ElementBase, T>, context: ClassAccessorDecoratorContext<ElementBase, T>) => ClassAccessorDecoratorResult<ElementBase, T>;

/** Lifecycle callback types. See {@link ElementBase.addLifecycleCallback} and {@link ElementBase.removeLifecycleCallback}. */
export type TLifecycleCallbackTargetAction = 'connected' | 'disconnected'

/** Lifecycle callback lambda type. See {@link ElementBase.addLifecycleCallback} and {@link ElementBase.removeLifecycleCallback}. */
export type TLifecycleCallback<Derived extends ElementBase> = (target: Derived, action: TLifecycleCallbackTargetAction) => void;

/** 
 * @childRef type when {@link ElementBase.createChildRef} is called with 'type' = 'weak';
 * 
 * Basically a {@link WeakRef} with the corresponding selector with {@link IChildRef.deref} 
 * being an alias for {@link IChildRef.get} that makes this compatible for {@link WeakRef}
 * types.
 */
export interface IChildRef<T extends Element> {
    /** Same as {@link IChildRef.deref}; gets the weakly referenced element. */
    get(): T;

    /** Same as {@link IChildRef.get}; gets the weakly referenced element. */
    deref(): T;

    /** The selector used to find the element that makes the {@link IChildRef}. */
    readonly selector: string;
}

/** 
 * Private implementation of {@link IChildRef} that gets the target referenced element from an {@link ElementBase} instance with a selector.
 * 
 * Stores a weak reference to the owner since it's only needed when initializing the reference, which is lazy-initialized when {@link IChildRef.get}
 * or {@link IChildRef.deref} is called. This is to avoid an unnecessary selector query if the @childRef is never used.
 */
class ChildRefFromElementBase<T extends Element> implements IChildRef<T> {
    /**
     * Constructor for {@link ChildRefFromElementBase}.
     * @param selector The selector of the child element.
     * @param owner The {@link ElementBase} to query from.
     */
    constructor(readonly selector: string, owner: ElementBase){
        this._weak_owner = new WeakRef(owner);
    }

    /**
     * Initializes the {@link _weak_target}, if it hasn't been already, then
     * returns the element or undefined if it doesn't exist anymore.
     * @returns The referenced element or undefined if it doesn't exist anymore.
     */
    readonly get = (): T => {
        this._weak_target ??= this.initTarget();
        return this._weak_target.deref();
    }

    /** Alias for {@link ChildRefFromElementBase.get}. */
    readonly deref = this.get;

    private _weak_target: WeakRef<T>;
    private _weak_owner: WeakRef<ElementBase>;

    /** Initializes the target element with the selector passed in the constructor. */
    private initTarget() {
        if(this._weak_target) return this._weak_target;
        const owner = this._weak_owner.deref();
        if(owner == undefined) throw new Error("Can't initialize a @childRef with garbage-collected owner!");
        this._weak_target = new WeakRef((owner.shadowRoot ?? owner).querySelector(this.selector));
        return this._weak_target;
    }
}
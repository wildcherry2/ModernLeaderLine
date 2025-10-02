/** Abstract base class for a custom element with basic support for lifecycle callbacks and style/template loading. */
export class ElementBase extends HTMLElement {
    use_shadow;
    /**
     * Constructor for {@link ElementBase}.
     * @param use_shadow Whether or not to use a shadow root.
     * @param shadow_options The options to use with the shadow root.
     */
    constructor(use_shadow = true, shadow_options = { 'mode': 'open' }) {
        super();
        this.use_shadow = use_shadow;
        if (use_shadow)
            this.attachShadow(shadow_options);
        customElements.upgrade(this);
        const template = document.getElementById(this.tagName.toLowerCase()); // Template is generated from @customElement decorator
        if (!template)
            throw new Error(`Error constructing element with template id "${this.tagName.toLowerCase()}"! Template element could not be found.`);
        if (!(template instanceof HTMLTemplateElement))
            throw new Error(`Error constructing element with template id "${this.tagName.toLowerCase()}"! Element type is not a template (tagName = "${template.tagName}")`);
        if (!('constructedStylesheet' in template))
            return;
        // Attach the style sheet and elements from the template under the shadow root, if one is being used, or as children otherwise.
        if (use_shadow) {
            this.shadowRoot.adoptedStyleSheets.push(template['constructedStylesheet']);
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
        else {
            const ss = template['constructedStylesheet'];
            const style_elem = this.appendChild(document.createElement('style'));
            for (let idx = 0; idx < ss.cssRules.length; ++idx) {
                style_elem.innerHTML += ss.cssRules.item(idx).cssText;
            }
            this.appendChild(template.content.cloneNode(true));
        }
    }
    /** Lifecycle callback for connection; invokes {@link onConnected}. */
    connectedCallback() {
        this.lifecycle_info.is_disconnecting = false;
        this.onConnected();
    }
    /**
     * Lifecycle callback for disconnection.
     *
     * Invokes disconnected callbacks if connected callbacks were called in {@link onConnected}.
     */
    disconnectedCallback() {
        this.lifecycle_info.is_disconnecting = true;
        if (this.lifecycle_info.connected_callbacks_called) {
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
    addLifecycleCallback(type, callback) {
        type === 'connected' ? this.lifecycle_info.callbacks.connected.add(callback) : this.lifecycle_info.callbacks.disconnected.add(callback);
        if (type === 'connected' && this.lifecycle_info.connected_callbacks_called)
            callback(this, type);
    }
    /**
     * Remove a lifecycle callback. Lifecycle callbacks are never automatically removed, unless the runtime destroys this element.
     * @param type The type of lifecycle event to remove.
     * @param callback The callback to be removed.
     */
    removeLifecycleCallback(type, callback) {
        type === 'connected' ? this.lifecycle_info.callbacks.connected.delete(callback) : this.lifecycle_info.callbacks.disconnected.delete(callback);
    }
    createChildRef(type, selector) {
        if (type === 'weak') {
            return new ChildRefFromElementBase(selector, this);
        }
        return (this.shadowRoot ?? this).querySelector(selector);
    }
    /**
     * The inner HTML of this element's shadow root (or the element, if root is not being used).
     *
     * Implement in child classes of {@link ElementBase} to add a custom template.
     * @returns The raw HTML string of the template this element uses.
     */
    static getTemplate() { return ''; }
    /**
     * The CSS style to be applied to this element's shadow root (or first child, if root is not being used).
     * @returns The raw CSS string of the template this element uses.
     */
    static getStyle() { return ''; }
    /**
     * Called by {@link connectedCallback}.
     *
     * Waits for this element to be added to the DOM (since {@link connectedCallback} isn't necessarily called when the element
     * is fully ready and attached to the DOM) and invokes added connected callbacks.
     */
    async onConnected() {
        while (!this.parentNode && !this.lifecycle_info.is_disconnecting)
            await new Promise(resolve => setTimeout(resolve, 0));
        if (!this.lifecycle_info.is_disconnecting) {
            this.lifecycle_info.callbacks.connected.forEach(cb => cb(this, 'connected'));
            this.lifecycle_info.connected_callbacks_called = true;
        }
    }
    /** Helper object to track lifecycle state and hold externally-added callbacks. */
    lifecycle_info = {
        is_disconnecting: false,
        connected_callbacks_called: false,
        callbacks: {
            connected: new Set(),
            disconnected: new Set(),
        }
    };
}
/**
 * Private implementation of {@link IChildRef} that gets the target referenced element from an {@link ElementBase} instance with a selector.
 *
 * Stores a weak reference to the owner since it's only needed when initializing the reference, which is lazy-initialized when {@link IChildRef.get}
 * or {@link IChildRef.deref} is called. This is to avoid an unnecessary selector query if the @childRef is never used.
 */
class ChildRefFromElementBase {
    selector;
    /**
     * Constructor for {@link ChildRefFromElementBase}.
     * @param selector The selector of the child element.
     * @param owner The {@link ElementBase} to query from.
     */
    constructor(selector, owner) {
        this.selector = selector;
        this._weak_owner = new WeakRef(owner);
    }
    /**
     * Initializes the {@link _weak_target}, if it hasn't been already, then
     * returns the element or undefined if it doesn't exist anymore.
     * @returns The referenced element or undefined if it doesn't exist anymore.
     */
    get = () => {
        this._weak_target ??= this.initTarget();
        return this._weak_target.deref();
    };
    /** Alias for {@link ChildRefFromElementBase.get}. */
    deref = this.get;
    _weak_target;
    _weak_owner;
    /** Initializes the target element with the selector passed in the constructor. */
    initTarget() {
        if (this._weak_target)
            return this._weak_target;
        const owner = this._weak_owner.deref();
        if (owner == undefined)
            throw new Error("Can't initialize a @childRef with garbage-collected owner!");
        this._weak_target = new WeakRef((owner.shadowRoot ?? owner).querySelector(this.selector));
        return this._weak_target;
    }
}
//# sourceMappingURL=Component.js.map
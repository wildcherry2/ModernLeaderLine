/** Abstract base class for a custom element with basic support for lifecycle callbacks and style/template loading. */
export declare abstract class ElementBase extends HTMLElement {
    protected readonly use_shadow: boolean;
    /**
     * Constructor for {@link ElementBase}.
     * @param use_shadow Whether or not to use a shadow root.
     * @param shadow_options The options to use with the shadow root.
     */
    constructor(use_shadow?: boolean, shadow_options?: ShadowRootInit);
    /** Lifecycle callback for connection; invokes {@link onConnected}. */
    protected connectedCallback(): void;
    /**
     * Lifecycle callback for disconnection.
     *
     * Invokes disconnected callbacks if connected callbacks were called in {@link onConnected}.
     */
    protected disconnectedCallback(): void;
    /**
     * Add a lifecycle callback. Lifecycle callbacks are never automatically removed, unless the runtime destroys this element.
     *
     * If the type is 'connected' and the connected callbacks have already been called, the callback is immediately invoked.
     * Either way, the callback is registered to be called when the lifecycle event designated by 'type' occurs.
     *
     * @param type The type of lifecycle event to listen for.
     * @param callback The callback to be invoked on the lifecycle event.
     */
    addLifecycleCallback(type: TLifecycleCallbackTargetAction, callback: TLifecycleCallback<this>): void;
    /**
     * Remove a lifecycle callback. Lifecycle callbacks are never automatically removed, unless the runtime destroys this element.
     * @param type The type of lifecycle event to remove.
     * @param callback The callback to be removed.
     */
    removeLifecycleCallback(type: TLifecycleCallbackTargetAction, callback: TLifecycleCallback<this>): void;
    /**
     * Used by \@childRef decorator to create a weak IChildRef or strong reference to a child element in the template.
     * @param type Whether this should return a weak IChildRef or strong reference.
     * @param selector The selector of the child element.
     */
    protected createChildRef<T extends Element = Element>(type: 'weak', selector: string): IChildRef<T>;
    protected createChildRef<T extends Element = Element>(type: 'strong', selector: string): T;
    /**
     * The inner HTML of this element's shadow root (or the element, if root is not being used).
     *
     * Implement in child classes of {@link ElementBase} to add a custom template.
     * @returns The raw HTML string of the template this element uses.
     */
    static getTemplate(): string;
    /**
     * The CSS style to be applied to this element's shadow root (or first child, if root is not being used).
     * @returns The raw CSS string of the template this element uses.
     */
    static getStyle(): string;
    /**
     * Called by {@link connectedCallback}.
     *
     * Waits for this element to be added to the DOM (since {@link connectedCallback} isn't necessarily called when the element
     * is fully ready and attached to the DOM) and invokes added connected callbacks.
     */
    private onConnected;
    /** Helper object to track lifecycle state and hold externally-added callbacks. */
    private lifecycle_info;
}
/** Factory type for @customElement decorator. */
export type TElementBaseCustomElementDecoratorFactory<T extends typeof ElementBase> = (cls: T, context: ClassDecoratorContext<T>) => void;
/** Factory type for @childRef decorator. */
export type TElementBaseChildRefDecoratorFactory<T extends Element> = (value: ClassAccessorDecoratorTarget<ElementBase, T>, context: ClassAccessorDecoratorContext<ElementBase, T>) => ClassAccessorDecoratorResult<ElementBase, T>;
/** Lifecycle callback types. See {@link ElementBase.addLifecycleCallback} and {@link ElementBase.removeLifecycleCallback}. */
export type TLifecycleCallbackTargetAction = 'connected' | 'disconnected';
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

/**
 * Inspired from https://toruskit.com/blog/how-to-get-element-bounds-without-reflow, allows getting the bounding rectangle of
 * an element without forcing a layout pass using an {@link IntersectionObserver}.
 *
 * NOTE: requires Promise.withResolvers (may need a polyfill for older browsers/browser versions since this is considered relatively new).
 * NOTE: do NOT use with an {@link IntersectionObserver} polyfill. It'll work, but won't be faster.
 */
declare class FastBounds<T extends FastBoundable> {
    /** Constructor for {@link FastBounds}. Assignes helper methods and fields to {@link element} to async'ly get the bounding rectangle */
    constructor(element: T);
    /** Dispose of helper methods and fields. */
    dispose(): void;
    /**
     * Observer callback. Since it uses the same observer for each {@link FastBoundsElement}, and only
     * {@link FastBoundsElement} are registered with the observer, each entry corresponds to a
     * {@link FastBoundsElement} which has pending resolver methods stored in its helper field
     * {@link FastBoundsElement._pending_rect_resolvers}. Each resolver is calaled with the stored
     * rect from {@link IntersectionObserverEntry.boundingClientRect}.
     */
    private static observer;
    private element;
}
/** Any {@link Element} can be made into a {@link FastBoundsElement}. */
export type FastBoundable = Element;
/** An {@link Element} with helper fields and methods to get the bounding client rect without forcing a layout pass. */
export type FastBoundsElement<T extends FastBoundable> = T & {
    /** Cache of pending 'resolver' methods */
    _pending_rect_resolvers: ((rect: DOMRect) => any)[];
    features: {
        fast_bounds: FastBounds<T>;
    };
    getBoundingClientRectAsync(): Promise<DOMRect>;
    updateLastBoundingClientRect(): void;
};
export type { FastBounds };
export declare function makeFastBoundsElement<T extends FastBoundable>(element: T): asserts element is FastBoundsElement<T>;
declare global {
    interface PromiseConstructor {
        withResolvers<T>(): {
            promise: Promise<T>;
            resolve: (obj: T) => void;
            reject: () => void;
        };
    }
}

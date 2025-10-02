/**
 * Inspired from https://toruskit.com/blog/how-to-get-element-bounds-without-reflow, allows getting the bounding rectangle of
 * an element without forcing a layout pass using an {@link IntersectionObserver}.
 *
 * NOTE: requires Promise.withResolvers (may need a polyfill for older browsers/browser versions since this is considered relatively new).
 * NOTE: do NOT use with an {@link IntersectionObserver} polyfill. It'll work, but won't be faster.
 */
class FastBounds {
    /** Constructor for {@link FastBounds}. Assignes helper methods and fields to {@link element} to async'ly get the bounding rectangle */
    constructor(element) {
        element['_pending_rect_resolvers'] = [];
        element['updateLastBoundingClientRect'] = () => { FastBounds.observer.observe(this.element); };
        element['getBoundingClientRectAsync'] = () => {
            const { promise, resolve } = Promise.withResolvers();
            this.element._pending_rect_resolvers.push(resolve);
            FastBounds.observer.observe(this.element); // this is the trick, it immediately invokes (or schedules) the callback with the cached bounding rect
            return promise;
        };
        this.element = element;
    }
    /** Dispose of helper methods and fields. */
    dispose() {
        FastBounds.observer.unobserve(this.element);
        delete this.element.getBoundingClientRectAsync;
        delete this.element.updateLastBoundingClientRect;
        delete this.element._pending_rect_resolvers;
        delete this.element.features.fast_bounds;
        delete this.element;
    }
    /**
     * Observer callback. Since it uses the same observer for each {@link FastBoundsElement}, and only
     * {@link FastBoundsElement} are registered with the observer, each entry corresponds to a
     * {@link FastBoundsElement} which has pending resolver methods stored in its helper field
     * {@link FastBoundsElement._pending_rect_resolvers}. Each resolver is calaled with the stored
     * rect from {@link IntersectionObserverEntry.boundingClientRect}.
     */
    static observer = new IntersectionObserver(entries => entries.forEach(entry => {
        const t = entry.target;
        const r = DOMRect.fromRect(entry.boundingClientRect);
        if (t._pending_rect_resolvers?.length) {
            const resolvers = t._pending_rect_resolvers;
            t._pending_rect_resolvers = [];
            resolvers.forEach(res => res(r));
        }
        this.observer.unobserve(t);
    }));
    element;
}
export function makeFastBoundsElement(element) {
    element['features'] ??= {};
    element['features']['fast_bounds'] ??= new FastBounds(element);
}
//# sourceMappingURL=FastBounds.js.map
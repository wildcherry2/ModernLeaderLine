export {};
declare global {
    interface DOMRectReadOnly {
        /** Calculates the intersection rectangle with the {@link other_rect}. */
        getIntersectionRect(other_rect: DOMRectReadOnly): DOMRect;
        /** Tests whether or not this rectangle intersects with the {@link other_rect}. */
        intersectsRect(other_rect: DOMRectReadOnly): boolean;
        /** Tests whether or not this rectangle contains (or is equal to) the {@link other_rect}. */
        containsRect(other_rect: DOMRectReadOnly): boolean;
        /** Returns the area of this rectangle. */
        getArea(): number;
        /** Returns the center of this rectangle. */
        getCenter(): DOMPoint;
        /** Tests whether or not the {@link point} lies within this rectangle (inclusive of the rectangle's edges). */
        containsPoint(point: {
            x: number;
            y: number;
        }): boolean;
        /** Tests whether or not the {@link point} lies would lie within this rectangle after a translation by {@link tx} and {@link ty}. */
        containsPointPostTranslate(tx: number, ty: number, point: {
            x: number;
            y: number;
        }): boolean;
        /** Tests whether or not the {@link rect} would be equal to or contained by this rectangle after a translation by {@link tx} and {@link ty}. */
        containsRectPostTranslate(tx: number, ty: number, rect: DOMRectReadOnly): boolean;
    }
}

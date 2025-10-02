export {}

/** Simple function that patches {@link DOMRectReadOnly} (and by extension, {@link DOMRect}) to have various useful geometry functions. */
function patchDRRO() {
    DOMRectReadOnly.prototype.getIntersectionRect = function(this: DOMRectReadOnly, other_rect: DOMRectReadOnly) {
        const x4 = Math.max(this.x, other_rect.x); // left
        const x2 = Math.min(this.right, other_rect.right); // right
        if(x4 > x2) return new DOMRect(0,0,0,0);
        const y4 = Math.min(this.bottom, other_rect.bottom); // bottom
        const y2 = Math.max(this.y, other_rect.y); // top
        if(y4 < y2) return new DOMRect(0,0,0,0);
        return new DOMRect(x4, y2, Math.abs(x2 - x4), Math.abs(y2 - y4));
    }
    DOMRectReadOnly.prototype.intersectsRect = function(this: DOMRectReadOnly, other_rect: DOMRectReadOnly) {
        const ir = this.getIntersectionRect(other_rect);
        return (ir.getArea() !== 0);
    }
    DOMRectReadOnly.prototype.containsRect = function(this: DOMRectReadOnly, other_rect: DOMRectReadOnly) {
        if(this.getArea() <= other_rect.getArea() || this.width < other_rect.width || this.height < other_rect.height) return false;
        const ir = this.getIntersectionRect(other_rect);
        return (other_rect.x === ir.x && other_rect.y === ir.y && other_rect.width === ir.width && other_rect.height === ir.height)
    }
    DOMRectReadOnly.prototype.getArea = function(this: DOMRectReadOnly) { return (this.width * this.height); }
    DOMRectReadOnly.prototype.getCenter = function(this: DOMRectReadOnly) { return new DOMPoint(this.x + (this.width / 2), this.y + (this.height / 2)); }
    DOMRectReadOnly.prototype.containsPoint = function(this: DOMRectReadOnly, point: {x: number, y: number}) {
        return point.x >= this.x && point.x <= this.right && point.y >= this.y && point.y <= this.bottom;
    }
    DOMRectReadOnly.prototype.containsPointPostTranslate = function(this: DOMRectReadOnly, tx: number, ty: number, point: {x: number, y: number}) { 
        return point.x >= (this.x + tx) && point.x <= (this.right + tx) && point.y >= (this.y + ty) && point.y <= (this.bottom + ty);
    }
    DOMRectReadOnly.prototype.containsRectPostTranslate = function(this: DOMRectReadOnly, tx: number, ty: number, rect: DOMRectReadOnly) {
        return this.containsRect(new DOMRect(rect.x + tx, rect.y + ty, rect.width, rect.height));
    }
}

if(!('getIntersectionRect' in DOMRectReadOnly.prototype)) patchDRRO();

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
        containsPoint(point: {x: number, y: number}): boolean;

        /** Tests whether or not the {@link point} lies would lie within this rectangle after a translation by {@link tx} and {@link ty}. */
        containsPointPostTranslate(tx: number, ty: number, point: {x: number, y: number}): boolean;

        /** Tests whether or not the {@link rect} would be equal to or contained by this rectangle after a translation by {@link tx} and {@link ty}. */
        containsRectPostTranslate(tx: number, ty: number, rect: DOMRectReadOnly): boolean;
    }
}
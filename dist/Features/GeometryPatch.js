/** Simple function that patches {@link DOMRectReadOnly} (and by extension, {@link DOMRect}) to have various useful geometry functions. */
function patchDRRO() {
    DOMRectReadOnly.prototype.getIntersectionRect = function (other_rect) {
        const x4 = Math.max(this.x, other_rect.x); // left
        const x2 = Math.min(this.right, other_rect.right); // right
        if (x4 > x2)
            return new DOMRect(0, 0, 0, 0);
        const y4 = Math.min(this.bottom, other_rect.bottom); // bottom
        const y2 = Math.max(this.y, other_rect.y); // top
        if (y4 < y2)
            return new DOMRect(0, 0, 0, 0);
        return new DOMRect(x4, y2, Math.abs(x2 - x4), Math.abs(y2 - y4));
    };
    DOMRectReadOnly.prototype.intersectsRect = function (other_rect) {
        const ir = this.getIntersectionRect(other_rect);
        return (ir.getArea() !== 0);
    };
    DOMRectReadOnly.prototype.containsRect = function (other_rect) {
        if (this.getArea() <= other_rect.getArea() || this.width < other_rect.width || this.height < other_rect.height)
            return false;
        const ir = this.getIntersectionRect(other_rect);
        return (other_rect.x === ir.x && other_rect.y === ir.y && other_rect.width === ir.width && other_rect.height === ir.height);
    };
    DOMRectReadOnly.prototype.getArea = function () { return (this.width * this.height); };
    DOMRectReadOnly.prototype.getCenter = function () { return new DOMPoint(this.x + (this.width / 2), this.y + (this.height / 2)); };
    DOMRectReadOnly.prototype.containsPoint = function (point) {
        return point.x >= this.x && point.x <= this.right && point.y >= this.y && point.y <= this.bottom;
    };
    DOMRectReadOnly.prototype.containsPointPostTranslate = function (tx, ty, point) {
        return point.x >= (this.x + tx) && point.x <= (this.right + tx) && point.y >= (this.y + ty) && point.y <= (this.bottom + ty);
    };
    DOMRectReadOnly.prototype.containsRectPostTranslate = function (tx, ty, rect) {
        return this.containsRect(new DOMRect(rect.x + tx, rect.y + ty, rect.width, rect.height));
    };
}
if (!('getIntersectionRect' in DOMRectReadOnly.prototype))
    patchDRRO();
export {};
//# sourceMappingURL=GeometryPatch.js.map
import { makeFastBoundsElement } from "../Features";
import { DefaultDashAnimationConfig, DefaultDashConfig, DefaultStyleConfig, ThreeHundredSixtyDegrees } from "./Constants";
/**
 * Private implementation for {@link LeaderLine}.
 */
class LeaderLineImplementation {
    host;
    /**
     * Constructor for {@link LeaderLineImplementation}.
     * Queries and listens for source/target attribute changes and applies the current style configuration
     * to the SVG elements.
     */
    constructor(host) {
        this.host = host;
        host.addAttributeChangedCallback('source-selector', nv => {
            const elem = nv && document.body.querySelector(nv);
            this.source = elem;
        }, false, true);
        host.addAttributeChangedCallback('target-selector', nv => {
            const elem = nv && document.body.querySelector(nv);
            this.target = elem;
        }, false, true);
        this.applyStyleConfig();
    }
    /**
     * Get the source element for the {@link LeaderLine}.
     */
    get source() { return this._source; }
    /**
     * Set the source element for the {@link LeaderLine}.
     *
     * Invokes {@link assignNewReference} to assign, validate, and position the {@link LeaderLine} if the source
     * and target are set.
     */
    set source(src) {
        src ||= null;
        if (src === this._source)
            return;
        if (src === this._target)
            throw new TypeError("leader-line source can't be the same as its target!");
        this.assignNewReference(src, 'source');
    }
    /**
     * Get the target element for the {@link LeaderLine}.
     */
    get target() { return this._target; }
    /**
     * Set the target element for the {@link LeaderLine}.
     *
     * Invokes {@link assignNewReference} to assign, validate, and position the {@link LeaderLine} if the source
     * and target are set.
     */
    set target(trg) {
        trg ||= null;
        if (trg === this._target)
            return;
        if (trg === this._source)
            throw new TypeError("leader-line target can't be the same as its source!");
        this.assignNewReference(trg, 'target');
    }
    /**
     * Get if this {@link LeaderLine} is hidden.
     * @returns True if hidden, false otherwise.
     */
    get hidden() { return this._hidden; }
    /**
     * Get if both target and source are set.
     * @returns True if both target and source are set, false otherwise.
     */
    get referencesSet() { return !!(this._source && this._target); }
    /**
     * Async method to update the geometry of the {@link LeaderLine}.
     *
     * Called when the geometry of the source or target changes for any reason, as indicated by the consumer.
     * Uses {@link FastBoundsElement} to get the bounding rects without layouts.
     * Runs like this:
     *  1.  If {@link position} has already been called, as indicated by the {@link _positioning} flag, early out. This is needed because the method is async.
     *  2.  Set the {@link _positioning} flag.
     *  3.  If the references ({@link source} and {@link target}) aren't set for any reason, this line shouldn't be visible because it's not pointing to anything, so guarantee that it's hidden and return.
     *  4.  Asynchronously get the bounding rects of the {@link source} and {@link target} using {@link FastBoundsElement} methods.
     *  5.  If the rectangles intersect, don't bother trying to draw a line, so guarantee is's hidden and return.
     *  6.  Call {@link getSocketFromRects} to get the appropriate sockets (endpoints) to draw the line between.
     *  7.  Dispatch {@link LeaderLinePositionEvent} and return if preventDefault was called (the default action is to reposition).
     *  8.  Call {@link drawLine} to update the {@link LeaderLine.path} data, using the {@link getSocketCoordsFromRect} to get the coordinates of the sockets.
     *  9.  Unset {@link _positioning} flag.
     */
    async position() {
        if (this._positioning)
            return;
        this._positioning = true;
        if (!this.referencesSet)
            return this.hide(true);
        const [src_rect, dest_rect] = await Promise.all([this._source.getBoundingClientRectAsync(), this._target.getBoundingClientRectAsync()]);
        if (src_rect.intersectsRect(dest_rect))
            return this.hide(true);
        let src_center, dest_center;
        [this._source.leader_line_socket, this._target.leader_line_socket, src_center, dest_center] = LeaderLineImplementation.getSocketFromRects(src_rect, dest_rect);
        if (!dispatchEvent(this.host, 'leader-line-position', { source: this._source, target: this._target, source_geometry: src_rect, target_geometry: dest_rect })) {
            this._positioning = false;
            return;
        }
        this.drawLine(LeaderLineImplementation.getSocketCoordsFromRect(src_rect, this._source.leader_line_socket, src_center), LeaderLineImplementation.getSocketCoordsFromRect(dest_rect, this._target.leader_line_socket, dest_center));
        this._positioning = false;
    }
    /**
     * Show the {@link LeaderLine} if it's hidden.
     *
     * We use the {@link _hidden} flag instead of comparing style.display strings because it's faster
     * and doesn't risk causing a layout from reading a style property.
     */
    show() {
        if (!this._hidden)
            return;
        this.host.style.display = 'contents';
        this._hidden = false;
    }
    /**
     * Hide the {@link LeaderLine} if it's showing.
     * @param unset_positioning Whether to set {@link _positioning} to false; this should only be true if {@link position}
     * is calling this method and it wants to return after hiding.
     */
    hide(unset_positioning) {
        if (unset_positioning)
            this._positioning = false;
        if (this._hidden)
            return;
        this.host.style.display = 'none';
        this._hidden = true;
    }
    /**
     * Updates the {@link LeaderLine.path} command to draw an arrow line between the points.
     * Runs like this:
     *  1.  Get the new {@link bounding_rect} of the overall SVG by using the source and target points + some extra height/width for the thickness of the line and arrow head (marker).
     *  2.  Dispatch a {@link LeaderLineDrawEvent}; if preventDefault is called, return.
     *      This also gives a chance for parent elements (or other listeners) to apply any additional transforms to the points/rect.
     *  3.  Set the {@link LeaderLine.path}'s 'd' attribute to the draw command returned by {@link getPathCommand}.
     *  4.  Match the {@link LeaderLine.svg}'s dimensions to the calculated {@link bounding_rect}.
     *  5.  Guarantee that the {@link LeaderLine} is showing.
     *
     * @param src The source point of the line (starting point).
     * @param dest The ending point of the line (ending point).
     */
    drawLine(src, dest) {
        const bounding_rect = new DOMRect(Math.min(src.x, dest.x), Math.min(src.y, dest.y), Math.abs(dest.x - src.x), Math.abs(dest.y - src.y));
        const offset = this._style.arrowhead_thickness + this._style.line_thickness, TwoOffset = 2 * offset;
        bounding_rect.x -= offset;
        bounding_rect.y -= offset;
        bounding_rect.width += TwoOffset;
        bounding_rect.height += TwoOffset; // need to account for text height?
        if (!dispatchEvent(this.host, 'leader-line-draw', { start: src, end: dest, rect: bounding_rect }))
            return;
        this.host.path.setAttribute('d', this.getPathCommand(src, dest));
        this.host.svg.style.left = `${bounding_rect.left}px`;
        this.host.svg.style.top = `${bounding_rect.top}px`;
        this.host.svg.setAttribute('width', `${bounding_rect.width}px`);
        this.host.svg.setAttribute('height', `${bounding_rect.height}px`);
        this.host.svg.setAttribute('viewBox', `${bounding_rect.left} ${bounding_rect.top} ${bounding_rect.width} ${bounding_rect.height}`);
        this.show();
    }
    /**
     * Computes the draw command for the {@link LeaderLine.path} with the current {@link LeaderLineStyleConfiguration.curve} option,
     * accounting for the thickness of the line.
     * @param start The starting point.
     * @param end The ending point.
     * @returns The draw command.
     */
    getPathCommand(start, end) {
        if (this._source && this._source.leader_line_socket !== undefined) {
            if (this._source.leader_line_socket === 0 /* ESocket.left */)
                start.x += (this._style.line_thickness / 2);
            else if (this._source.leader_line_socket === 1 /* ESocket.top */)
                start.y += (this._style.line_thickness / 2);
            else if (this._source.leader_line_socket === 2 /* ESocket.right */)
                start.x -= (this._style.line_thickness / 2);
            else
                start.y -= (this._style.line_thickness / 2);
        }
        switch (this._style.curve) {
            case "linear": {
                return `M ${start.x},${start.y} L ${end.x},${end.y}`;
            }
        }
    }
    /**
     * @returns The current {@link LeaderLineStyleConfiguration}.
     */
    getStyleConfig() { return this._style; }
    /**
     * Updates the current {@link LeaderLineStyleConfiguration} with the new values in {@link config}.
     * @param config The partial {@link LeaderLineStyleConfiguration} to update the the style with.
     */
    setStyleConfig(config) {
        this._style = { ...this._style, ...config };
        LeaderLineImplementation.resolveStyleConfig(this._style);
        this.applyStyleConfig();
    }
    /**
     * Helper to dispatch a {@link LeaderLineValidateEvent}.
     * @returns True if preventDefault was not called, false otherwise.
     */
    validate() { return dispatchEvent(this.host, 'leader-line-validate', { source: this._source, target: this._target }); }
    /**
     * Helper to return which sockets should be used to connect a line from the {@link src} rect to the {@link dest} rect.
     * Effectively uses the angle of the line formed by connecting the center points of the rectangles and compares them to the
     * angles of the diagonals of the rect we're calculating the socket for such that {@link ESocket.right} is returned if the
     * angle is between 315 (exclusive) degrees and 45 degrees (inclusive), {@link ESocket.top} is returned, if the angle is
     * between 45 degrees (exclusive) and 135 degrees (inclusive) {@link ESocket.top} is returned, etc.
     * @param src The source's bounding rect.
     * @param dest The destination's bounding rect.
     * @returns A tuple containing the socket the {@link src} and {@link dest} rect should use, and the centers of both rectangles for reference or reuse.
     */
    static getSocketFromRects(src, dest) {
        const src_center = src.getCenter(), dest_center = dest.getCenter();
        const src_angle = this.getAngle(src_center, dest_center), dest_angle = this.getAngle(dest_center, src_center);
        const src_corners = this.getCornerAngles(src, src_center), dest_corners = this.getCornerAngles(dest, dest_center);
        return [this.getSocketFromCornerAngle(src_angle, src_corners), this.getSocketFromCornerAngle(dest_angle, dest_corners), src_center, dest_center];
    }
    /**
     * Helper to return the horizontal angle formed between the origin and vertex.
     * @param origin The origin point.
     * @param vert The vertex point.
     * @returns The angle in radians, [0, 2pi]
     */
    static getAngle(origin, vert) {
        let angle = Math.atan2(-(vert.y - origin.y), vert.x - origin.x);
        if (angle < 0)
            angle += ThreeHundredSixtyDegrees;
        return angle;
    }
    /**
     * Helper to get the corner angles of the rect (TODO this is always 45, 135, 225, 315 in radians right?)
     * @param rect
     * @param center
     * @returns
     */
    static getCornerAngles(rect, center = rect.getCenter()) {
        const va = this.getAngle(center, { x: rect.right, y: rect.top });
        const ha = Math.PI - (2 * va);
        return {
            top_right: va,
            top_left: va + ha,
            bottom_left: Math.PI + va,
            bottom_right: Math.PI + va + ha
        };
    }
    /**
     * Helper to get the {@link ESocket} from the angle (which is passed in as relative to some bounding rect) and the angles of the rect's corners.
     * @param incident The angle to use to get the {@link ESocket} value.
     * @param corners The {@link CornerAngles} to use.
     * @returns The {@link ESocket} that should be used with the given angle.
     */
    static getSocketFromCornerAngle(incident, corners) {
        if (incident <= corners.top_right || incident > corners.bottom_right)
            return 2 /* ESocket.right */;
        if (incident <= corners.top_left && incident > corners.top_right)
            return 1 /* ESocket.top */;
        if (incident <= corners.bottom_left && incident > corners.top_left)
            return 0 /* ESocket.left */;
        return 3 /* ESocket.bottom */;
    }
    /**
     * Helper to get the {@link Point2D} of a {@link ESocket} relative to the passed in {@link rect}.
     * @param rect The reference bounding rect.
     * @param socket The reference {@link ESocket}.
     * @param center The center of the {@link rect}; recalculated if it's not passed in.
     * @returns The {@link Point2D} of the {@link ESocket}.
     */
    static getSocketCoordsFromRect(rect, socket, center = rect.getCenter()) {
        if (socket === 0 /* ESocket.left */)
            center.x -= (rect.width / 2);
        else if (socket === 1 /* ESocket.top */)
            center.y -= (rect.height / 2);
        else if (socket === 2 /* ESocket.right */)
            center.x += (rect.width / 2);
        else
            center.y += (rect.height / 2);
        return center;
    }
    _source = null;
    _target = null;
    _hidden = true;
    _positioning = false;
    _style = DefaultStyleConfig;
    _anim;
    _text;
    /**
     * Applies the current {@link LeaderLineStyleConfiguration} to the SVG elements.
     */
    applyStyleConfig() {
        const { path, marker } = this.host;
        path.setAttribute('stroke', this._style.color);
        path.setAttribute('fill', this._style.color);
        path.setAttribute('stroke-width', this._style.line_thickness.toString());
        marker.setAttribute('markerWidth', this._style.arrowhead_thickness.toString());
        marker.setAttribute('markerHeight', this._style.arrowhead_thickness.toString());
        if (this._style.dashed) { // if this was set to true in passed in config, it would be resolved to a default object and never be a boolean, so the boolean case doesn't have to be handled.
            const dash_config = this._style.dashed;
            path.setAttribute('stroke-dasharray', dash_config.dash_length.toString());
            path.setAttribute('stroke-dashoffset', dash_config.start_offset.toString());
            if (dash_config.animate) { // if this was set to true in passed in config, it would be resolved to a default object and never be a boolean, so the boolean case doesn't have to be handled.
                const anim_config = dash_config.animate;
                if (!this._anim) {
                    this._anim = path.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'animate'));
                    this._anim.setAttribute('attributeName', 'stroke-dashoffset');
                }
                this._anim.setAttribute('dur', anim_config.duration);
                this._anim.setAttribute('calcMode', anim_config.timing);
                this._anim.setAttribute('repeatCount', anim_config.repeat);
                this._anim.setAttribute('values', `${dash_config.dash_length * 2};0`);
            }
            else
                this.removeAnimation();
        }
        else {
            this.host.path.toggleAttribute('stroke-dasharray', false);
            this.host.path.toggleAttribute('stroke-dashoffset', false);
            this.removeAnimation();
        }
        if (this._style.text?.length) {
            let tpath;
            if (!this._text) {
                this._text = this.host.svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
                tpath = this._text.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'textPath'));
                tpath.setAttribute('href', '#path');
                tpath.setAttribute('startOffset', '50%');
            }
            tpath ??= this._text.firstElementChild;
            tpath.textContent = this._style.text;
            tpath.setAttribute('fill', this._style.color);
        }
        else {
            this._text?.remove();
            this._text = undefined;
        }
    }
    /**
     * Helper to remove a {@link LeaderLine.path} animation.
     */
    removeAnimation() {
        this._anim?.remove();
        this._anim = undefined;
    }
    /**
     * Handles assigning a new source or destination element.
     *
     * Whenever a new reference is set, its made into a {@link FastBoundsElement} (if it isn't already).
     *
     * If a source and target are set and it passes a {@link LeaderLineValidateEvent} without preventing default, then it calls {@link position}.
     * @param ref The element to try to assign.
     * @param type Whether {@link ref} is a source or target.
     */
    assignNewReference(ref, type) {
        const _ty = '_' + type;
        const old = this[_ty];
        ref && makeFastBoundsElement(ref);
        if (!dispatchEvent(this.host, 'leader-line-ref-change', { addedRef: ref, referenceType: type, removedRef: old }))
            return this.hide();
        this[_ty] = ref;
        if (!ref)
            return this.hide();
        this._source && this._target && this.validate() && this.position();
    }
    /**
     * Resolves the passed in {@link config} such that boolean 'true' values for properties that accept them are resolved to usable style objects.
     * @param config The {@link LeaderLineStyleConfiguration} to resolve.
     */
    static resolveStyleConfig(config) {
        if (config.dashed) {
            if (typeof config.dashed === 'boolean')
                config.dashed = DefaultDashConfig;
            else {
                config.dashed = { ...DefaultDashConfig, ...config.dashed };
                if (config.dashed.animate) {
                    if (typeof config.dashed.animate === 'boolean')
                        config.dashed.animate = DefaultDashAnimationConfig;
                    else
                        config.dashed.animate = { ...DefaultDashAnimationConfig, ...config.dashed.animate };
                }
            }
        }
    }
}
/**
 * Helper to dispatch an event in the {@link LeaderLineEventMap}.
 * @param host The {@link LeaderLine} to dispatch from.
 * @param type The exact event to dispatch.
 * @param detail The corresponding detail of the event, as specified in the {@link LeaderLineEventMap}.
 * @returns True if preventDefault was not called, false otherwise.
 */
function dispatchEvent(host, type, detail) {
    detail['line'] = host;
    return host.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: detail
    }));
}
/**
 * Factory method for implementation.
 * @param host The host {@link LeaderLine} element.
 */
export function makeLeaderLineImplementation(host) {
    host.features ??= {};
    host.features.implementation ??= new LeaderLineImplementation(host);
}
//# sourceMappingURL=Implementation.js.map
import type { LeaderLine } from "./Component";
import { ESocket } from "./Constants";
import type { CornerAngles, LeaderLineReference, LeaderLineStyleConfiguration, Point2D } from "./Types";
/**
 * Private implementation for {@link LeaderLine}.
 */
declare class LeaderLineImplementation {
    host: LeaderLine;
    /**
     * Constructor for {@link LeaderLineImplementation}.
     * Queries and listens for source/target attribute changes and applies the current style configuration
     * to the SVG elements.
     */
    constructor(host: LeaderLine);
    /**
     * Get the source element for the {@link LeaderLine}.
     */
    get source(): LeaderLineReference;
    /**
     * Set the source element for the {@link LeaderLine}.
     *
     * Invokes {@link assignNewReference} to assign, validate, and position the {@link LeaderLine} if the source
     * and target are set.
     */
    set source(src: Element);
    /**
     * Get the target element for the {@link LeaderLine}.
     */
    get target(): LeaderLineReference;
    /**
     * Set the target element for the {@link LeaderLine}.
     *
     * Invokes {@link assignNewReference} to assign, validate, and position the {@link LeaderLine} if the source
     * and target are set.
     */
    set target(trg: Element);
    /**
     * Get if this {@link LeaderLine} is hidden.
     * @returns True if hidden, false otherwise.
     */
    get hidden(): boolean;
    /**
     * Get if both target and source are set.
     * @returns True if both target and source are set, false otherwise.
     */
    get referencesSet(): boolean;
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
    position(): Promise<void>;
    /**
     * Show the {@link LeaderLine} if it's hidden.
     *
     * We use the {@link _hidden} flag instead of comparing style.display strings because it's faster
     * and doesn't risk causing a layout from reading a style property.
     */
    show(): void;
    /**
     * Hide the {@link LeaderLine} if it's showing.
     * @param unset_positioning Whether to set {@link _positioning} to false; this should only be true if {@link position}
     * is calling this method and it wants to return after hiding.
     */
    hide(unset_positioning?: boolean): void;
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
    drawLine(src: Point2D, dest: Point2D): void;
    /**
     * Computes the draw command for the {@link LeaderLine.path} with the current {@link LeaderLineStyleConfiguration.curve} option,
     * accounting for the thickness of the line.
     * @param start The starting point.
     * @param end The ending point.
     * @returns The draw command.
     */
    getPathCommand(start: Point2D, end: Point2D): string;
    /**
     * @returns The current {@link LeaderLineStyleConfiguration}.
     */
    getStyleConfig(): Readonly<LeaderLineStyleConfiguration>;
    /**
     * Updates the current {@link LeaderLineStyleConfiguration} with the new values in {@link config}.
     * @param config The partial {@link LeaderLineStyleConfiguration} to update the the style with.
     */
    setStyleConfig(config: Partial<Readonly<LeaderLineStyleConfiguration>>): void;
    /**
     * Helper to dispatch a {@link LeaderLineValidateEvent}.
     * @returns True if preventDefault was not called, false otherwise.
     */
    validate(): boolean;
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
    static getSocketFromRects(src: DOMRect, dest: DOMRect): [src_socket: ESocket, dest_socket: ESocket, src_center: Point2D, dest_center: Point2D];
    /**
     * Helper to return the horizontal angle formed between the origin and vertex.
     * @param origin The origin point.
     * @param vert The vertex point.
     * @returns The angle in radians, [0, 2pi]
     */
    static getAngle(origin: Point2D, vert: Point2D): number;
    /**
     * Helper to get the corner angles of the rect (TODO this is always 45, 135, 225, 315 in radians right?)
     * @param rect
     * @param center
     * @returns
     */
    static getCornerAngles(rect: DOMRect, center?: DOMPoint): CornerAngles;
    /**
     * Helper to get the {@link ESocket} from the angle (which is passed in as relative to some bounding rect) and the angles of the rect's corners.
     * @param incident The angle to use to get the {@link ESocket} value.
     * @param corners The {@link CornerAngles} to use.
     * @returns The {@link ESocket} that should be used with the given angle.
     */
    static getSocketFromCornerAngle(incident: number, corners: CornerAngles): ESocket;
    /**
     * Helper to get the {@link Point2D} of a {@link ESocket} relative to the passed in {@link rect}.
     * @param rect The reference bounding rect.
     * @param socket The reference {@link ESocket}.
     * @param center The center of the {@link rect}; recalculated if it's not passed in.
     * @returns The {@link Point2D} of the {@link ESocket}.
     */
    static getSocketCoordsFromRect(rect: DOMRect, socket: ESocket, center?: Point2D): Point2D;
    private _source;
    private _target;
    private _hidden;
    private _positioning;
    private _style;
    private _anim;
    private _text;
    /**
     * Applies the current {@link LeaderLineStyleConfiguration} to the SVG elements.
     */
    private applyStyleConfig;
    /**
     * Helper to remove a {@link LeaderLine.path} animation.
     */
    private removeAnimation;
    /**
     * Handles assigning a new source or destination element.
     *
     * Whenever a new reference is set, its made into a {@link FastBoundsElement} (if it isn't already).
     *
     * If a source and target are set and it passes a {@link LeaderLineValidateEvent} without preventing default, then it calls {@link position}.
     * @param ref The element to try to assign.
     * @param type Whether {@link ref} is a source or target.
     */
    private assignNewReference;
    /**
     * Resolves the passed in {@link config} such that boolean 'true' values for properties that accept them are resolved to usable style objects.
     * @param config The {@link LeaderLineStyleConfiguration} to resolve.
     */
    private static resolveStyleConfig;
}
export type { LeaderLineImplementation };
/**
 * Factory method for implementation.
 * @param host The host {@link LeaderLine} element.
 */
export declare function makeLeaderLineImplementation(host: LeaderLine): void;

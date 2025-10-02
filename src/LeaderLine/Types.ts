import type { FastBoundsElement } from "../Features";
import type { LeaderLine } from "./Component";
import type { ESocket } from "./Constants";
import type { DataType } from 'csstype';

/**
 * Type of an element that's been converted to a reference used to draw {@link LeaderLine}s.
 */
export type LeaderLineReference = FastBoundsElement<Element> & {
    leader_line_socket?: ESocket;
}

/**
 * Interface for object used to describe a {@link LeaderLine}'s style.
 */
export interface LeaderLineStyleConfiguration {
    /** Fill color for the {@link LeaderLine}. */
    color: DataType.Color | `rgba(${number},${number},${number},${number})`;

    /** Thickness of the {@link LeaderLine.path}, in pixels. */
    line_thickness: number;

    /** Thickness of the {@link LeaderLine.marker}, in pixels. */
    arrowhead_thickness: number;

    /** Curve type of the {@link LeaderLine.path}. */
    curve: "linear";

    /** 
     * If boolean, describes whether or not the {@link LeaderLine.path} is dashed; uses DefaultDashConfig if true, not dashed otherwise.
     * If it's a {@link LeaderLineDashConfig}, describes the style of the dashes in the {@link LeaderLine.path}.
     */
    dashed?: boolean | LeaderLineDashConfig;

    /** Text to attach to the {@link LeaderLine}. */
    text?: string;
}

/** Basic object type for holding a coordinate pair. */
export interface Point2D { x: number, y: number }

/** Helper type to hold the angles of each corner (TODO maybe unneeded) */
export interface CornerAngles {
    top_right: number,
    top_left: number,
    bottom_left: number,
    bottom_right: number
}

/** Interface for object that describes how the dashes look for a {@link LeaderLine.path}. */
export interface LeaderLineDashConfig {
    /** Length of each dash, in pixels. */
    dash_length?: number;

    /** Initial offset of the first dash, in pixels. */
    start_offset?: number;

    /**
     * If boolean, describes whether or not the dashed {@link LeaderLine.path} is animated, uses DefaultDashAnimationConfig if true, not animated otherwise.
     * If it's a {@link LeaderLineDashAnimationConfig}, describes the animation of the dashes.
     */
    animate?: boolean | LeaderLineDashAnimationConfig;
}

/** Interface for object that describes how a dashed {@link LeaderLine.path} is animated. */
export interface LeaderLineDashAnimationConfig {
    /** Duration of animation iteration. */
    duration?: `${number}${'s'}`;

    /** Timing of the animation. */
    timing?: 'discrete' | 'linear' | 'paced' | 'spline';

    /** The number of times the animation repeats, or 'indefinite' if it goes on forever. */
    repeat?: 'indefinite' | `${number}`
}

/** 
 * Event dispatched before the {@link LeaderLine} redraws.
 * 
 * Allows modifications to relevant geometry to account for transforms.
*/
export interface LeaderLineDrawEventDetails {
    readonly start: Point2D;
    readonly end: Point2D;
    readonly rect: DOMRect;
    readonly line: LeaderLine;
}

/**
 * Event dispatched before {@link LeaderLine} repositions.
 */
export interface LeaderLinePositionEventDetails {
    readonly source: LeaderLineReference;
    readonly source_geometry: DOMRectReadOnly;
    readonly target: LeaderLineReference;
    readonly target_geometry: DOMRectReadOnly;
    readonly line: LeaderLine;
}

/**
 * Event dispatched after a new reference (source or target) is assigned.
 * TODO combine logically with ref change event
 * 
 * The {@link source} and {@link target} fields hold the current source and target.
 * The event is not coalesced (so, for instance, if you assign a source and target 
 * declaratively, a {@link LeaderLineValidateEvent} will be dispatched once before
 * the source is assigned with an undefined target, then it will be dispatched again
 * before the target is assigned with both the source and target defined, assuming
 * the declared selectors match an element).
 */
export interface LeaderLineValidateEventDetails {
    readonly source?: LeaderLineReference;
    readonly target?: LeaderLineReference;
    readonly line: LeaderLine;
}

export interface LeaderLineReferenceChangeEventDetails {
    readonly addedRef: LeaderLineReference | undefined;
    readonly removedRef: LeaderLineReference | undefined;
    readonly referenceType: 'source' | 'target';
    readonly line: LeaderLine;
}

export type LeaderLinePositionEvent = CustomEvent<LeaderLinePositionEventDetails>;
export type LeaderLineValidateEvent = CustomEvent<LeaderLineValidateEventDetails>;
export type LeaderLineDrawEvent = CustomEvent<LeaderLineDrawEventDetails>;
export type LeaderLineReferenceChangeEvent = CustomEvent<LeaderLineReferenceChangeEventDetails>;

export interface LeaderLineEventMap {
    "leader-line-draw": LeaderLineDrawEvent;
    "leader-line-position": LeaderLinePositionEvent;
    "leader-line-ref-change": LeaderLineReferenceChangeEvent;
    "leader-line-validate": LeaderLineValidateEvent;
}
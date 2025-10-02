import { ElementBase, attributeObserverMixin, attributeProperty, childRef, customElement } from "../ElementBase";
import { makeLeaderLineImplementation, type LeaderLineImplementation } from "./Implementation";
import type { LeaderLineDrawEvent, LeaderLineEventMap, LeaderLinePositionEvent, LeaderLineReferenceChangeEvent, LeaderLineStyleConfiguration, LeaderLineValidateEvent, Point2D } from "./Types";
import "../Features/GeometryPatch";

/**
 * Custom element that draws a styled SVG line with an arrowhead between two elements. 
 * You must use 'import "LeaderLine"' without importing any specific exports from this
 * library for the custom element to initialize properly.
 */
@customElement
export class LeaderLine extends attributeObserverMixin(ElementBase) {
    /**
     * Default constructor for {@link LeaderLine}. 
     */
    constructor() {
        super();
        makeLeaderLineImplementation(this);
    }

    /**
     * Reflected attribute property for the attribute 'source-selector' that allows declarative setting of 'source' element for the {@link LeaderLine}.
     * 
     * Programmatically the same as setting the {@link source} to 'document.querySelector(source_selector)'.
     * 
     * Since there are two ways to set the source element (this setter and through {@link source}),
     * whichever setter is called most recently is the one used.
     */
    @attributeProperty({name: 'source-selector'}) accessor source_selector: string;

    /**
     * Reflected attribute property for the attribute 'target-selector' that allows declarative setting of 'target' element for the {@link LeaderLine}.
     * 
     * Programmatically the same as setting the {@link target} to 'document.querySelector(target_selector)'.
     * 
     * Since there are two ways to set the source element (this setter and through {@link target}),
     * whichever setter is called most recently is the one used.
     */
    @attributeProperty({name: 'target-selector'}) accessor target_selector: string;

    /**
     * Accessor to get the SVG root element that wraps the path and markers of the {@link LeaderLine}.
     */
    @childRef accessor svg: SVGSVGElement;

    /**
     * Accessor to get the path SVG element that is drawn between elements.
     */
    @childRef accessor path: SVGPathElement;

    /**
     * Accessor to get the marker (arrowhead) SVG element that is drawn at the end of the path.
     */
    @childRef accessor marker: SVGMarkerElement;

    /** 
     * Accessor to get the path of the marker SVG element.
    */
    @childRef accessor marker_path: SVGPathElement;

    /**
     * Getter for the current source element.
     * @returns Source {@link Element}.
     */
    get source() { return this.features.implementation.source; }

    /**
     * Setter for the current source element.
     * 
     * Since there are two ways to set the source element (this setter and through {@link source_selector}),
     * whichever setter is called most recently is the one used.
     * @param src The new source {@link Element}.
     */
    set source(src: Element) { this.features.implementation.source = src; }

    /** 
     * Getter for the current target element.
     * @returns Target {@link Element}.
    */
    get target() { return this.features.implementation.target; }

    /**
     * Setter for the current target element.
     * 
     * Since there are two ways to set the target element (this setter and through {@link target_selector}),
     * whichever setter is called most recently is the one used.
     * @param trg The new target {@link Element}.
     */
    set target(trg: Element) { this.features.implementation.target = trg; }

    /**
     * Asynchronously reposition the {@link LeaderLine} according to the current position of the {@link source}
     * and {@link target} elements. 
     * 
     * This should be called when the position or size of the source or target element changes, including transforms. 
     * Use observers such as {@link MutationObserver}, {@link IntersectionObserver}, or {@link ResizeObserver} if these changes aren't easily tracked.
     * @returns A {@link Promise<void>} for when the position is complete.
     */
    position() { return this.features.implementation.position(); }

    /**
     * Forcefully shows the {@link LeaderLine}, regardless of whether or not there's a line to be drawn. 
     */
    show() { return this.features.implementation.show(); }

    /**
     * Forcefully hides the {@link LeaderLine}, regardless of whether or not there's a line to be drawn.
     */
    hide() { return this.features.implementation.hide(); }

    /**
     * @returns The current {@link LeaderLineStyleConfiguration}.
     */
    getStyleConfig() { return this.features.implementation.getStyleConfig(); }

    /** 
     * Sets the current {@link LeaderLineStyleConfiguration}.
     * 
     * Assumes a default when not specified (see {@link DefaultStyleConfig}).
    */
    setStyleConfig(style: Partial<Readonly<LeaderLineStyleConfiguration>>) { return this.features.implementation.setStyleConfig(style); }

    /**
     * Forces a {@link LeaderLineValidateEvent} to be dispatched and returns the result of the dispatch. 
     * 
     * The only reason this event should be triggered in this way is to alert parent elements 
     * of this {@link LeaderLine}'s existence and react to it, though a {@link MutationObserver} would be more proper. 
     * See {@link LeaderLineValidateEvent} for other cases where this event is dispatched.
     * @returns True if preventDefault was not called in the event dispatch, false otherwise.
     */
    isValid() { return this.features.implementation.validate(); }
    
    static getStyle() {
        return /*css*/`
            :host { 
                display: none;
                z-index: -1;
            }
            :host, svg {
                position: absolute;
                pointer-events: none;
            }

            #path {
                marker-end: url(#marker);
                pointer-events: auto;
            }

            :host([disable-pointer]) #path {
                pointer-events: none;
            }

            svg textPath {
                text-anchor: middle;
                dominant-baseline: text-after-edge;
            }
        `
    }

    static getTemplate() {
        return /*html*/`
            <svg id="svg">
                <path id="path"></path>
                <marker
                    id="marker"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" stroke="context-stroke" fill="context-fill" id="marker_path"/>
                </marker>
            </svg>
        `
    }

    declare features: {
        implementation: LeaderLineImplementation;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "leader-line": LeaderLine;
    }

    interface GlobalEventHandlersEventMap extends LeaderLineEventMap {}
}
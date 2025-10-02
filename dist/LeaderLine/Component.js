var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { ElementBase, attributeObserverMixin, attributeProperty, childRef, customElement } from "../ElementBase";
import { makeLeaderLineImplementation } from "./Implementation";
import "../Features/GeometryPatch";
/**
 * Custom element that draws a styled SVG line with an arrowhead between two elements.
 * You must use 'import "LeaderLine"' without importing any specific exports from this
 * library for the custom element to initialize properly.
 */
let LeaderLine = (() => {
    let _classDecorators = [customElement];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = attributeObserverMixin(ElementBase);
    let _source_selector_decorators;
    let _source_selector_initializers = [];
    let _source_selector_extraInitializers = [];
    let _target_selector_decorators;
    let _target_selector_initializers = [];
    let _target_selector_extraInitializers = [];
    let _svg_decorators;
    let _svg_initializers = [];
    let _svg_extraInitializers = [];
    let _path_decorators;
    let _path_initializers = [];
    let _path_extraInitializers = [];
    let _marker_decorators;
    let _marker_initializers = [];
    let _marker_extraInitializers = [];
    let _marker_path_decorators;
    let _marker_path_initializers = [];
    let _marker_path_extraInitializers = [];
    var LeaderLine = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _source_selector_decorators = [attributeProperty({ name: 'source-selector' })];
            _target_selector_decorators = [attributeProperty({ name: 'target-selector' })];
            _svg_decorators = [childRef];
            _path_decorators = [childRef];
            _marker_decorators = [childRef];
            _marker_path_decorators = [childRef];
            __esDecorate(this, null, _source_selector_decorators, { kind: "accessor", name: "source_selector", static: false, private: false, access: { has: obj => "source_selector" in obj, get: obj => obj.source_selector, set: (obj, value) => { obj.source_selector = value; } }, metadata: _metadata }, _source_selector_initializers, _source_selector_extraInitializers);
            __esDecorate(this, null, _target_selector_decorators, { kind: "accessor", name: "target_selector", static: false, private: false, access: { has: obj => "target_selector" in obj, get: obj => obj.target_selector, set: (obj, value) => { obj.target_selector = value; } }, metadata: _metadata }, _target_selector_initializers, _target_selector_extraInitializers);
            __esDecorate(this, null, _svg_decorators, { kind: "accessor", name: "svg", static: false, private: false, access: { has: obj => "svg" in obj, get: obj => obj.svg, set: (obj, value) => { obj.svg = value; } }, metadata: _metadata }, _svg_initializers, _svg_extraInitializers);
            __esDecorate(this, null, _path_decorators, { kind: "accessor", name: "path", static: false, private: false, access: { has: obj => "path" in obj, get: obj => obj.path, set: (obj, value) => { obj.path = value; } }, metadata: _metadata }, _path_initializers, _path_extraInitializers);
            __esDecorate(this, null, _marker_decorators, { kind: "accessor", name: "marker", static: false, private: false, access: { has: obj => "marker" in obj, get: obj => obj.marker, set: (obj, value) => { obj.marker = value; } }, metadata: _metadata }, _marker_initializers, _marker_extraInitializers);
            __esDecorate(this, null, _marker_path_decorators, { kind: "accessor", name: "marker_path", static: false, private: false, access: { has: obj => "marker_path" in obj, get: obj => obj.marker_path, set: (obj, value) => { obj.marker_path = value; } }, metadata: _metadata }, _marker_path_initializers, _marker_path_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LeaderLine = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Default constructor for {@link LeaderLine}.
         */
        constructor() {
            super();
            __runInitializers(this, _marker_path_extraInitializers);
            makeLeaderLineImplementation(this);
        }
        #source_selector_accessor_storage = __runInitializers(this, _source_selector_initializers, void 0);
        /**
         * Reflected attribute property for the attribute 'source-selector' that allows declarative setting of 'source' element for the {@link LeaderLine}.
         *
         * Programmatically the same as setting the {@link source} to 'document.querySelector(source_selector)'.
         *
         * Since there are two ways to set the source element (this setter and through {@link source}),
         * whichever setter is called most recently is the one used.
         */
        get source_selector() { return this.#source_selector_accessor_storage; }
        set source_selector(value) { this.#source_selector_accessor_storage = value; }
        #target_selector_accessor_storage = (__runInitializers(this, _source_selector_extraInitializers), __runInitializers(this, _target_selector_initializers, void 0));
        /**
         * Reflected attribute property for the attribute 'target-selector' that allows declarative setting of 'target' element for the {@link LeaderLine}.
         *
         * Programmatically the same as setting the {@link target} to 'document.querySelector(target_selector)'.
         *
         * Since there are two ways to set the source element (this setter and through {@link target}),
         * whichever setter is called most recently is the one used.
         */
        get target_selector() { return this.#target_selector_accessor_storage; }
        set target_selector(value) { this.#target_selector_accessor_storage = value; }
        #svg_accessor_storage = (__runInitializers(this, _target_selector_extraInitializers), __runInitializers(this, _svg_initializers, void 0));
        /**
         * Accessor to get the SVG root element that wraps the path and markers of the {@link LeaderLine}.
         */
        get svg() { return this.#svg_accessor_storage; }
        set svg(value) { this.#svg_accessor_storage = value; }
        #path_accessor_storage = (__runInitializers(this, _svg_extraInitializers), __runInitializers(this, _path_initializers, void 0));
        /**
         * Accessor to get the path SVG element that is drawn between elements.
         */
        get path() { return this.#path_accessor_storage; }
        set path(value) { this.#path_accessor_storage = value; }
        #marker_accessor_storage = (__runInitializers(this, _path_extraInitializers), __runInitializers(this, _marker_initializers, void 0));
        /**
         * Accessor to get the marker (arrowhead) SVG element that is drawn at the end of the path.
         */
        get marker() { return this.#marker_accessor_storage; }
        set marker(value) { this.#marker_accessor_storage = value; }
        #marker_path_accessor_storage = (__runInitializers(this, _marker_extraInitializers), __runInitializers(this, _marker_path_initializers, void 0));
        /**
         * Accessor to get the path of the marker SVG element.
        */
        get marker_path() { return this.#marker_path_accessor_storage; }
        set marker_path(value) { this.#marker_path_accessor_storage = value; }
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
        set source(src) { this.features.implementation.source = src; }
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
        set target(trg) { this.features.implementation.target = trg; }
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
        setStyleConfig(style) { return this.features.implementation.setStyleConfig(style); }
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
            return /*css*/ `
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
        `;
        }
        static getTemplate() {
            return /*html*/ `
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
        `;
        }
    };
    return LeaderLine = _classThis;
})();
export { LeaderLine };
//# sourceMappingURL=Component.js.map
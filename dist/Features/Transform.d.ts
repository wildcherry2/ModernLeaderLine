import { CallbackStore } from "./CallbackStore";
import { type FrameSyncable, type FrameSyncedElement } from "./FrameSync";
/** Feature class that writes and potentially batches transformations updates to an Element. */
declare class Transform<T extends Transformable> extends CallbackStore<[]> {
    /** Constructor that makes {@link element} into a {@link TransformableElement}. */
    constructor(element: T);
    /** Get the 'x' translation value. */
    get tx(): number;
    /** Get the 'y' translation value. */
    get ty(): number;
    /** Get the 'x' scale value. */
    get sx(): number;
    /** Get the 'y' scale value. */
    get sy(): number;
    /** The {@link TransformableElement} this feature is linked to. */
    readonly element: TransformableElement<T>;
    /**
     * Set the 'x' and 'y' translation value on the {@link element}'s transform.
     * @param x The new 'x' translation value.
     * @param y The new 'y' translation value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    setTranslate(x: number, y: number, nosync?: boolean): void;
    /**
     * Adds 'x' and 'y' to the current translation value.
     * @param x The amount to add to the 'x' translation value.
     * @param y The amount to add to the 'y' translation value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    translateBy(x: number, y: number, nosync?: boolean): void;
    /**
     * Set the 'x' and 'y' scale value on the {@link element}'s transform.
     * @param x The new 'x' scale value.
     * @param y The new 'y' scale value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    setScale(x: number, y: number, nosync?: boolean): void;
    /**
     * Adds 'x' and 'y' to the current scale value.
     * @param x The amount to add to the 'x' scale value.
     * @param y The amount to add to the 'y' scale value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    scaleBy(x: number, y: number, nosync?: boolean): void;
    /**
     * Adds 'x' and 'y' to the current scale value about a certain point.
     * @param x The amount to add to the 'x' scale value.
     * @param y The amount to add to the 'y' scale value.
     * @param cx The 'x' coordinate of the point to scale about.
     * @param cy The 'y' coordinate of the point to scale about.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    scaleByAboutPoint(x: number, y: number, cx: number, cy: number, nosync?: boolean): void;
    /**
     * Async updates the {@link element}'s transform value to the value stored in this object.
     * @param force Whether to forcefully enqueue a task to update the transform, regardless of whether an update has already been queued.
     */
    syncTransform(force?: boolean): void;
    /**
     * @returns The string to be appied to the {@link element}'s style.transform attribute.
     */
    getTransformString(): string;
    /**
     * The callback that updates the {@link element}'s style.transform attribute and triggers any listeners for this feature.
     */
    protected syncTransformCallback: () => void;
    protected m: DOMMatrix;
    protected isSyncing: boolean;
}
/** An object is {@link Transformable} if it's {@link FrameSyncable} and has a 'style' property of type {@link CSSStyleDeclaration} (basically, extended from {@link Element}). */
export type Transformable = FrameSyncable;
/** An object is a {@link TransformableElement} if it has {@link Transform} and {@link FrameSyncedElement} features. */
export type TransformableElement<T extends Transformable> = T & {
    features: {
        transform: Transform<T>;
    };
} & FrameSyncedElement<T>;
export type { Transform };
/** Factory function to make a {@link Transformable} object into a {@link TransformableElement}. */
export declare function makeTransformable<T extends Transformable>(element: T): asserts element is TransformableElement<T>;
/**
 * Factory function to make a {@link Transformable} object into a {@link TransformableElement} by proxy.
 *
 * This means that a {@link host} element holds the {@link Transform} feature object on behalf of another {@link target} element.
 */
export declare function makeTransformableProxy<T extends Transformable, N extends Transformable>(host: N, target: T): asserts host is TransformableElement<N>;

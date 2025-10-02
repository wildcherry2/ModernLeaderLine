import { CallbackStore } from "./CallbackStore";
import { makeFrameSyncable, type FrameSyncable, type FrameSyncedElement } from "./FrameSync";

/** Feature class that writes and potentially batches transformations updates to an Element. */
class Transform<T extends Transformable> extends CallbackStore<[]>{

    /** Constructor that makes {@link element} into a {@link TransformableElement}. */
    constructor(element: T) {
        super();
        makeFrameSyncable(element);
        this.element = element as TransformableElement<T>;
    }

    /** Get the 'x' translation value. */
    get tx() { return this.m.e; }

    /** Get the 'y' translation value. */
    get ty() { return this.m.f; }

    /** Get the 'x' scale value. */
    get sx() { return this.m.a; }

    /** Get the 'y' scale value. */
    get sy() { return this.m.d; }

    /** The {@link TransformableElement} this feature is linked to. */
    readonly element: TransformableElement<T>;

    /**
     * Set the 'x' and 'y' translation value on the {@link element}'s transform.
     * @param x The new 'x' translation value.
     * @param y The new 'y' translation value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    setTranslate(x: number, y: number, nosync?: boolean) {
        this.m.e = x;
        this.m.f = y;
        nosync || this.syncTransform();
    }

    /**
     * Adds 'x' and 'y' to the current translation value.
     * @param x The amount to add to the 'x' translation value.
     * @param y The amount to add to the 'y' translation value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value). 
     */
    translateBy(x: number, y: number, nosync?: boolean) {
        this.m.e += x;
        this.m.f += y;
        nosync || this.syncTransform();
    }

    /**
     * Set the 'x' and 'y' scale value on the {@link element}'s transform.
     * @param x The new 'x' scale value.
     * @param y The new 'y' scale value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value).
     */
    setScale(x: number, y: number, nosync?: boolean) {
        this.m.a = x;
        this.m.d = y;
        nosync || this.syncTransform();
    }

    /**
     * Adds 'x' and 'y' to the current scale value.
     * @param x The amount to add to the 'x' scale value.
     * @param y The amount to add to the 'y' scale value.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value). 
     */
    scaleBy(x: number, y: number, nosync?: boolean) {
        this.m.a += x;
        this.m.d += y;
        nosync || this.syncTransform();
    }

    /**
     * Adds 'x' and 'y' to the current scale value about a certain point.
     * @param x The amount to add to the 'x' scale value.
     * @param y The amount to add to the 'y' scale value.
     * @param cx The 'x' coordinate of the point to scale about.
     * @param cy The 'y' coordinate of the point to scale about.
     * @param nosync If true, doesn't set the {@link element}'s transform value ({@link syncTransform} needs to be called
     * in a future call or another method that takes a 'nosync' parameter needs to be set to false to update the transform value). 
     */
    scaleByAboutPoint(x: number, y: number, cx: number, cy: number, nosync?: boolean) {
        const nsx = this.m.a + x, nsy = this.m.d + y;
        const msx = this.m.a / nsx, msy = this.m.d / nsy;
        this.m.scaleSelf(msx, msy, 1, cx, cy);
        nosync || this.syncTransform();
    }

    /**
     * Async updates the {@link element}'s transform value to the value stored in this object.
     * @param force Whether to forcefully enqueue a task to update the transform, regardless of whether an update has already been queued.
     */
    syncTransform(force?: boolean) { 
        if(!force && this.isSyncing) return;
        this.isSyncing = true;
        this.element.features.frame_sync.pushTask(this.syncTransformCallback);
    }

    /**
     * @returns The string to be appied to the {@link element}'s style.transform attribute.
     */
    getTransformString() { return this.m.toString(); }

    /** 
     * The callback that updates the {@link element}'s style.transform attribute and triggers any listeners for this feature. 
     */
    protected syncTransformCallback = () => {
        this.element.style.transform = this.m.toString();
        this.trigger();
        this.isSyncing = false;
    }

    protected m = new DOMMatrix();
    protected isSyncing = false;
}

/** An object is {@link Transformable} if it's {@link FrameSyncable} and has a 'style' property of type {@link CSSStyleDeclaration} (basically, extended from {@link Element}). */
export type Transformable = FrameSyncable;

/** An object is a {@link TransformableElement} if it has {@link Transform} and {@link FrameSyncedElement} features. */
export type TransformableElement<T extends Transformable> = T & { features: { transform: Transform<T> } } & FrameSyncedElement<T>;
export type { Transform };

/** Factory function to make a {@link Transformable} object into a {@link TransformableElement}. */
export function makeTransformable<T extends Transformable>(element: T): asserts element is TransformableElement<T> {
    element['features'] ??= {};
    element['features']['transform'] ??= new Transform(element);
}

/** 
 * Factory function to make a {@link Transformable} object into a {@link TransformableElement} by proxy.
 * 
 * This means that a {@link host} element holds the {@link Transform} feature object on behalf of another {@link target} element.
 */
export function makeTransformableProxy<T extends Transformable, N extends Transformable>(host: N, target: T): asserts host is TransformableElement<N> {
    host['features'] ??= {};
    host['features']['transform'] ??= new Transform(target);
}
/** Uses {@link requestAnimationFrame} to run tasks in sync with the framerate. */
declare class FrameSync<T extends FrameSyncable> {
    readonly element: T;
    constructor(element: T);
    /**
     * Push a callback to be executed on the next animation frame.
     * @param task The callback to be executed.
     * @param ensure_unique Whether to check to make sure {@link task} isn't already queued.
     */
    pushTask(task: FrameSyncTask, ensure_unique?: boolean): void;
    /**
     * Remove a callback from executing on the next animation frame.
     * @param task The callback to remove.
     * @param ensure_cleared Whether to check to make sure all copies of {@link task} are removed.
     */
    removeTask(task: FrameSyncTask, ensure_cleared?: boolean): any;
    /** Whether there's any processing tasks at the moment. */
    get isProcessing(): boolean;
    /** The {@link FrameRequestCallback} to be used to execute the queue of tasks. */
    private static onFrame;
    private static queue;
    private static frame;
}
export type FrameSyncable = Element & {
    style: CSSStyleDeclaration;
};
export type FrameSyncTask = (time: DOMHighResTimeStamp) => void;
export type { FrameSync };
export type FrameSyncedElement<T extends FrameSyncable> = T & {
    features: {
        frame_sync: FrameSync<T>;
    };
};
/** Factory function to make {@link element} a {@link FrameSyncedElement}. */
export declare function makeFrameSyncable<T extends FrameSyncable>(element: T): asserts element is FrameSyncedElement<T>;

/** Uses {@link requestAnimationFrame} to run tasks in sync with the framerate. */
class FrameSync<T extends FrameSyncable> {
    constructor(readonly element: T) {}
    
    /**
     * Push a callback to be executed on the next animation frame.
     * @param task The callback to be executed.
     * @param ensure_unique Whether to check to make sure {@link task} isn't already queued.
     */
    pushTask(task: FrameSyncTask, ensure_unique?: boolean) {
        if(!ensure_unique || !FrameSync.queue.includes(task)) {
            FrameSync.queue.push(task);
            FrameSync.frame ||= requestAnimationFrame(FrameSync.onFrame);
        }
    }
    
    /**
     * Remove a callback from executing on the next animation frame.
     * @param task The callback to remove.
     * @param ensure_cleared Whether to check to make sure all copies of {@link task} are removed.
     */
    removeTask(task: FrameSyncTask, ensure_cleared?: boolean) {
        const idx = FrameSync.queue.indexOf(task);
        if(idx === -1) return;
        FrameSync.queue.splice(idx, 1);
        if(ensure_cleared) return this.removeTask(task, true);
    }

    /** Whether there's any processing tasks at the moment. */
    get isProcessing() { return FrameSync.frame !== 0; }

    /** The {@link FrameRequestCallback} to be used to execute the queue of tasks. */
    private static onFrame = (ts: DOMHighResTimeStamp) => {
        if(!this.queue.length) { this.frame = 0; return; }
        while(this.queue.length) {
            this.queue.pop()(ts);
        }
        this.frame = requestAnimationFrame(this.onFrame);
    }

    private static queue: FrameSyncTask[] = [];
    private static frame = 0;
}

export type FrameSyncable = Element & { style: CSSStyleDeclaration }
export type FrameSyncTask = (time: DOMHighResTimeStamp) => void;
export type { FrameSync };
export type FrameSyncedElement<T extends FrameSyncable> = T & { features: { frame_sync: FrameSync<T> } }

/** Factory function to make {@link element} a {@link FrameSyncedElement}. */
export function makeFrameSyncable<T extends FrameSyncable>(element: T): asserts element is FrameSyncedElement<T> {
    element['features'] ??= {};
    element['features']['frame_sync'] ??= new FrameSync(element);
}
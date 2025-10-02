/** Uses {@link requestAnimationFrame} to run tasks in sync with the framerate. */
class FrameSync {
    element;
    constructor(element) {
        this.element = element;
    }
    /**
     * Push a callback to be executed on the next animation frame.
     * @param task The callback to be executed.
     * @param ensure_unique Whether to check to make sure {@link task} isn't already queued.
     */
    pushTask(task, ensure_unique) {
        if (!ensure_unique || !FrameSync.queue.includes(task)) {
            FrameSync.queue.push(task);
            FrameSync.frame ||= requestAnimationFrame(FrameSync.onFrame);
        }
    }
    /**
     * Remove a callback from executing on the next animation frame.
     * @param task The callback to remove.
     * @param ensure_cleared Whether to check to make sure all copies of {@link task} are removed.
     */
    removeTask(task, ensure_cleared) {
        const idx = FrameSync.queue.indexOf(task);
        if (idx === -1)
            return;
        FrameSync.queue.splice(idx, 1);
        if (ensure_cleared)
            return this.removeTask(task, true);
    }
    /** Whether there's any processing tasks at the moment. */
    get isProcessing() { return FrameSync.frame !== 0; }
    /** The {@link FrameRequestCallback} to be used to execute the queue of tasks. */
    static onFrame = (ts) => {
        if (!this.queue.length) {
            this.frame = 0;
            return;
        }
        while (this.queue.length) {
            this.queue.pop()(ts);
        }
        this.frame = requestAnimationFrame(this.onFrame);
    };
    static queue = [];
    static frame = 0;
}
/** Factory function to make {@link element} a {@link FrameSyncedElement}. */
export function makeFrameSyncable(element) {
    element['features'] ??= {};
    element['features']['frame_sync'] ??= new FrameSync(element);
}
//# sourceMappingURL=FrameSync.js.map
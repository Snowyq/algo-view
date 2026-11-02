/* One rAF loop for every sprite, running only while something subscribes. */

type Tick = (now: number) => void;

const subscribers = new Set<Tick>();
let frameId: number | null = null;

function loop(now: number): void {
    subscribers.forEach((tick) => tick(now));
    frameId = subscribers.size > 0 ? requestAnimationFrame(loop) : null;
}

export function subscribeTick(tick: Tick): () => void {
    subscribers.add(tick);
    if (frameId === null) frameId = requestAnimationFrame(loop);
    return () => {
        subscribers.delete(tick);
        if (subscribers.size === 0 && frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    };
}

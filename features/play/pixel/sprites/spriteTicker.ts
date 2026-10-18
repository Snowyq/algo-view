/*
 * One requestAnimationFrame loop for every sprite on the page. It runs
 * only while at least one visible sprite is subscribed, and the browser
 * pauses it for hidden tabs.
 */

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

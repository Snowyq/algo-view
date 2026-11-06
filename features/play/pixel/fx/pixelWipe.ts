import { cssVar, mountCanvas } from "./dom";

/* Pixel dissolve: a canvas over the host fills or clears in square blocks. */

type WipeMode = "cover" | "reveal";

type WipeOptions = {
    mode: WipeMode;
    /** CSS color or custom property name (e.g. "--bg"). */
    color?: string;
    block?: number;
    duration?: number;
    /** Discrete frames over the duration. */
    frames?: number;
    /** Keep the overlay after a cover (caller removes the element). */
    keep?: boolean;
    /** Block order: random, or the 4x4 Bayer dither the CSS px-dither keyframes use. */
    pattern?: "random" | "bayer";
};

const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
];

/* Lowest Bayer thresholds first; ties shuffled so frames don't sweep left to right. */
function bayerOrder(cols: number, rows: number): Uint32Array {
    const random = shuffled(cols * rows);
    const order = Array.from(random).sort((a, b) => {
        const ta = BAYER[Math.floor(a / cols) % 4][(a % cols) % 4];
        const tb = BAYER[Math.floor(b / cols) % 4][(b % cols) % 4];
        return ta - tb;
    });
    return Uint32Array.from(order);
}

function shuffled(count: number): Uint32Array {
    const order = new Uint32Array(count);
    for (let i = 0; i < count; i += 1) order[i] = i;
    for (let i = count - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
    }
    return order;
}

export function pixelWipe(
    host: HTMLElement,
    {
        mode,
        color = "--bg",
        block = 16,
        duration = 360,
        frames = 7,
        keep = false,
        pattern = "random",
    }: WipeOptions
): { done: Promise<void>; cancel: () => void } {
    const width = host.offsetWidth;
    const height = host.offsetHeight;
    if (width === 0 || height === 0) {
        return { done: Promise.resolve(), cancel: () => undefined };
    }

    const canvas = mountCanvas(host, {
        inset: "0",
        imageRendering: "pixelated",
        zIndex: "20",
    });
    const ctx = canvas.getContext("2d");
    const fill = color.startsWith("--")
        ? cssVar(host, color, "#15120f")
        : color;
    // a host resized mid-wipe gets a fresh block grid at the same progress
    let cols = 0;
    let rows = 0;
    let total = 0;
    let order: Uint32Array = new Uint32Array(0);
    let drawn = 0;
    let frameId = 0;
    let cancelled = false;

    const paintCell = (index: number): void => {
        if (!ctx) return;
        const cell = order[index];
        const x = cell % cols;
        const y = Math.floor(cell / cols);
        if (mode === "cover") ctx.fillRect(x, y, 1, 1);
        else ctx.clearRect(x, y, 1, 1);
    };

    const layout = (w: number, h: number): void => {
        const nextCols = Math.ceil(w / block);
        const nextRows = Math.ceil(h / block);
        if (nextCols === cols && nextRows === rows) return;
        const fraction = total > 0 ? drawn / total : 0;
        cols = nextCols;
        rows = nextRows;
        total = cols * rows;
        order = pattern === "bayer" ? bayerOrder(cols, rows) : shuffled(total);
        canvas.width = cols;
        canvas.height = rows;
        canvas.style.width = `${cols * block}px`;
        canvas.style.height = `${rows * block}px`;
        if (!ctx) return;
        ctx.fillStyle = fill;
        if (mode === "reveal") ctx.fillRect(0, 0, cols, rows);
        drawn = Math.floor(fraction * total);
        for (let i = 0; i < drawn; i += 1) paintCell(i);
    };
    layout(width, height);

    const observer = new ResizeObserver(() => {
        if (host.offsetWidth > 0 && host.offsetHeight > 0) {
            layout(host.offsetWidth, host.offsetHeight);
        }
    });
    observer.observe(host);

    const done = new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number): void => {
            if (cancelled || !ctx) {
                observer.disconnect();
                resolve();
                return;
            }
            const progress = Math.min(1, (now - start) / duration);
            const stepped = Math.ceil(progress * frames) / frames;
            const target = Math.floor(stepped * total);
            for (; drawn < target; drawn += 1) paintCell(drawn);
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
                return;
            }
            observer.disconnect();
            if (mode === "reveal" || !keep) canvas.remove();
            resolve();
        };
        frameId = requestAnimationFrame(tick);
    });

    return {
        done,
        cancel: () => {
            cancelled = true;
            cancelAnimationFrame(frameId);
            observer.disconnect();
            canvas.remove();
        },
    };
}

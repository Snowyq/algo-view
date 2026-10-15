/*
 * Pixel dissolve: a canvas laid over an element fills or clears in random
 * square blocks, in a handful of discrete frames. One element, opacity-free,
 * so it costs a few fillRects per frame whatever the content underneath.
 */

type WipeMode = "cover" | "reveal";

type WipeOptions = {
    mode: WipeMode;
    /** CSS color or custom property name (e.g. "--bg"). */
    color?: string;
    block?: number;
    duration?: number;
    /** Discrete frames over the duration: the "pixel" feel. */
    frames?: number;
    /** Keep the overlay after a cover (caller removes the element). */
    keep?: boolean;
};

function resolveColor(host: HTMLElement, color: string): string {
    if (!color.startsWith("--")) return color;
    return getComputedStyle(host).getPropertyValue(color).trim() || "#15120f";
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
    }: WipeOptions
): { done: Promise<void>; cancel: () => void } {
    const width = host.offsetWidth;
    const height = host.offsetHeight;
    if (width === 0 || height === 0) {
        return { done: Promise.resolve(), cancel: () => undefined };
    }

    const canvas = document.createElement("canvas");
    const cols = Math.ceil(width / block);
    const rows = Math.ceil(height / block);
    canvas.width = cols;
    canvas.height = rows;
    Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        width: `${cols * block}px`,
        height: `${rows * block}px`,
        imageRendering: "pixelated",
        pointerEvents: "none",
        zIndex: "20",
    });
    if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
    }
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const fill = resolveColor(host, color);
    const total = cols * rows;
    const order = shuffled(total);
    let drawn = 0;
    let frameId = 0;
    let cancelled = false;

    if (ctx) {
        ctx.fillStyle = fill;
        if (mode === "reveal") ctx.fillRect(0, 0, cols, rows);
    }

    const done = new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number): void => {
            if (cancelled || !ctx) {
                resolve();
                return;
            }
            const progress = Math.min(1, (now - start) / duration);
            const stepped = Math.ceil(progress * frames) / frames;
            const target = Math.floor(stepped * total);
            for (; drawn < target; drawn += 1) {
                const cell = order[drawn];
                const x = cell % cols;
                const y = Math.floor(cell / cols);
                if (mode === "cover") ctx.fillRect(x, y, 1, 1);
                else ctx.clearRect(x, y, 1, 1);
            }
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
                return;
            }
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
            canvas.remove();
        },
    };
}

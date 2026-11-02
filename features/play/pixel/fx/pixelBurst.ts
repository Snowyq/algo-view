import { mountCanvas, prefersReducedMotion } from "./dom";

/* A few square sparks flung up from a point, falling on a 2px grid. */

type BurstOptions = {
    x: number;
    y: number;
    colors?: string[];
    count?: number;
    size?: number;
    duration?: number;
};

const DEFAULT_COLORS = ["#d97757", "#f4c2a6", "#f5cd4e", "#5fd6c6", "#f4ede0"];
const GRID = 2;
const GRAVITY = 420;

function makeSparks(count: number, colors: string[], size: number) {
    return Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const speed = 90 + Math.random() * 170;
        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: colors[i % colors.length],
            s: Math.random() < 0.3 ? size * 1.5 : size,
        };
    });
}

export function pixelBurst(
    host: HTMLElement,
    {
        x,
        y,
        colors = DEFAULT_COLORS,
        count = 14,
        size = 4,
        duration = 620,
    }: BurstOptions
): void {
    if (prefersReducedMotion()) return;
    const width = host.offsetWidth;
    const height = host.offsetHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const canvas = mountCanvas(host, {
        left: "0",
        top: "0",
        width: `${width}px`,
        height: `${height}px`,
        zIndex: "30",
    });
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        return;
    }
    ctx.scale(dpr, dpr);

    const sparks = makeSparks(count, colors, size);
    const start = performance.now();
    const tick = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const seconds = (now - start) / 1000;
        ctx.clearRect(0, 0, width, height);
        sparks.forEach((spark) => {
            const px = x + spark.vx * seconds;
            const py = y + spark.vy * seconds + GRAVITY * seconds * seconds;
            // blink out in the last third instead of fading
            if (t > 0.66 && Math.floor(now / 60) % 2 === 0) return;
            ctx.fillStyle = spark.color;
            ctx.fillRect(
                Math.round(px / GRID) * GRID,
                Math.round(py / GRID) * GRID,
                spark.s,
                spark.s
            );
        });
        if (t < 1) requestAnimationFrame(tick);
        else canvas.remove();
    };
    requestAnimationFrame(tick);
}

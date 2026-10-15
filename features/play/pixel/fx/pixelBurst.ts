/*
 * A few square sparks flung out from a point, falling under gravity,
 * moving on a 2px grid. DOM-free: one throwaway canvas over the host.
 */

type BurstOptions = {
    x: number;
    y: number;
    colors?: string[];
    count?: number;
    size?: number;
    duration?: number;
};

const DEFAULT_COLORS = ["#d97757", "#f4c2a6", "#f5cd4e", "#5fd6c6", "#f4ede0"];

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const width = host.offsetWidth;
    const height = host.offsetHeight;
    const canvas = document.createElement("canvas");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    Object.assign(canvas.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: "none",
        zIndex: "30",
    });
    if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
    }
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        return;
    }
    ctx.scale(dpr, dpr);

    const sparks = Array.from({ length: count }, (_, i) => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
        const speed = 90 + Math.random() * 170;
        return {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: colors[i % colors.length],
            s: Math.random() < 0.3 ? size * 1.5 : size,
        };
    });

    const start = performance.now();
    const grid = 2;
    const tick = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const seconds = (now - start) / 1000;
        ctx.clearRect(0, 0, width, height);
        sparks.forEach((spark) => {
            const px = x + spark.vx * seconds;
            const py = y + spark.vy * seconds + 420 * seconds * seconds;
            // Blink out in the last third instead of fading.
            if (t > 0.66 && Math.floor(now / 60) % 2 === 0) return;
            ctx.fillStyle = spark.color;
            ctx.fillRect(
                Math.round(px / grid) * grid,
                Math.round(py / grid) * grid,
                spark.s,
                spark.s
            );
        });
        if (t < 1) requestAnimationFrame(tick);
        else canvas.remove();
    };
    requestAnimationFrame(tick);
}

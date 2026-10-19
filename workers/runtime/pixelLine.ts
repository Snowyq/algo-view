/** Stepped line of square "pixels" of size t; dotted skips every other pair. */
export function pixelLine(
    ctx: OffscreenCanvasRenderingContext2D,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    t: number,
    dotted = false
): void {
    const dx = bx - ax;
    const dy = by - ay;
    const steps = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / t)
    );
    for (let k = 0; k <= steps; k += 1) {
        if (dotted && Math.floor(k / 2) % 2 === 1) continue;
        const x = Math.round((ax + (dx * k) / steps) / t) * t;
        const y = Math.round((ay + (dy * k) / steps) / t) * t;
        ctx.fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t);
    }
}

import type { GridLayout } from "../../utils/grid";

type Ctx = OffscreenCanvasRenderingContext2D;

/** Text and outlines on top of light fills. */
export const DARK = "#1d110b";
/** Top-edge highlight on lit tiles and bars. */
export const LIT = "rgba(255, 255, 255, 0.28)";
export const LIT_SOFT = "rgba(255, 255, 255, 0.22)";

/** Used when a token is missing from the loaded step colors (matches PlayTheme). */
export const FALLBACK_COLORS: Record<string, string> = {
    default: "#7a6c5a",
    label: "#a99d8a",
    fg: "#f4ede0",
    check: "#f5cd4e",
    "check-true": "#8fdc8a",
    "check-false": "#ff7a68",
    select: "#ee8fd0",
    finish: "#5fd6c6",
    frontier: "#f5cd4e",
    visit: "#7fb0ff",
    current: "#ee8fd0",
    path: "#5fd6c6",
    "path-empty": "#2b251f",
    "path-wall": "#6b5f50",
    "path-start": "#e8825c",
    "path-end": "#f4ede0",
};

export const monoFont = (px: number): string =>
    `bold ${px}px ui-monospace, monospace`;

/** Grid cell index as "(x, y)". */
export const cellName = (cell: number, cols: number): string =>
    `(${cell % cols}, ${Math.floor(cell / cols)})`;

/** Top-left pixel of a grid cell. */
export function cellOrigin(
    layout: GridLayout,
    cols: number,
    cell: number
): [number, number] {
    return [
        layout.x + (cell % cols) * layout.cell,
        layout.y + Math.floor(cell / cols) * layout.cell,
    ];
}

/** Light band along the top edge of a filled rect. */
export function highlight(
    ctx: Ctx,
    x: number,
    y: number,
    w: number,
    h = 2,
    light = LIT
): void {
    ctx.fillStyle = light;
    ctx.fillRect(x, y, w, h);
}

/** Ring around the square at (x, y), with a dark gap between ring and square. */
export function focusRing(
    ctx: Ctx,
    x: number,
    y: number,
    size: number,
    ring: string
): void {
    ctx.fillStyle = ring;
    ctx.fillRect(x - 3, y - 3, size + 6, size + 6);
    ctx.fillStyle = DARK;
    ctx.fillRect(x - 1, y - 1, size + 2, size + 2);
}

/** Stepped line of square "pixels" of size t; dotted skips every other pair. */
export function pixelLine(
    ctx: Ctx,
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

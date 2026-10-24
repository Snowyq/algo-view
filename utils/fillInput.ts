import { createRng } from "./randoms";

/*
 * Fill input: a bitmap of walls (1) and open cells (0) plus a start
 * cell. Caves are smoothed noise (diagonal pinches let 8-way fills leak),
 * rooms are overlapping rectangle outlines with doors, rings are nested
 * walls with one gap each: a long corridor that makes DFS stacks deep.
 */

export const FILL_PRESETS = ["caves", "rooms", "rings"] as const;
export type FillPreset = (typeof FILL_PRESETS)[number];

export type FillConfig = { preset: FillPreset; cols: number; seed: number };
export type FillInput = {
    cols: number;
    rows: number;
    walls: number[];
    start: number;
};

export const FILL_MIN_COLS = 16;
export const FILL_MAX_COLS = 64;
export const FILL_DEFAULT_COLS = 40;

export function isFillPreset(value: unknown): value is FillPreset {
    return (
        typeof value === "string" &&
        (FILL_PRESETS as readonly string[]).includes(value)
    );
}

export function fillRows(cols: number): number {
    return Math.max(10, Math.round(cols * 0.6));
}

/** Open cells 4-connected to `from`. */
function region(
    walls: number[],
    cols: number,
    rows: number,
    from: number
): number[] {
    const seen = new Uint8Array(walls.length);
    const out = [from];
    seen[from] = 1;
    for (let k = 0; k < out.length; k += 1) {
        const c = out[k];
        const x = c % cols;
        const y = Math.floor(c / cols);
        for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const n = ny * cols + nx;
            if (walls[n] || seen[n]) continue;
            seen[n] = 1;
            out.push(n);
        }
    }
    return out;
}

export function generateFillInput({
    preset,
    cols: wanted,
    seed,
}: FillConfig): FillInput {
    const rng = createRng(seed);
    const cols = Math.max(
        FILL_MIN_COLS,
        Math.min(FILL_MAX_COLS, Math.round(wanted))
    );
    const rows = fillRows(cols);
    let walls = new Array<number>(cols * rows).fill(0);
    const at = (x: number, y: number): number => y * cols + x;

    if (preset === "caves") {
        walls = walls.map(() => (rng() < 0.45 ? 1 : 0));
        for (let pass = 0; pass < 4; pass += 1) {
            walls = walls.map((_, c) => {
                const x = c % cols;
                const y = Math.floor(c / cols);
                let around = 0;
                for (let dy = -1; dy <= 1; dy += 1) {
                    for (let dx = -1; dx <= 1; dx += 1) {
                        if (!dx && !dy) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows)
                            around += 1;
                        else around += walls[at(nx, ny)];
                    }
                }
                return around >= 5 || (pass < 2 && around <= 1) ? 1 : 0;
            });
        }
    } else if (preset === "rooms") {
        const count = Math.round(cols / 5);
        for (let r = 0; r < count; r += 1) {
            const w = 5 + Math.floor(rng() * (cols / 3));
            const h = 4 + Math.floor(rng() * (rows / 2));
            const x0 = Math.floor(rng() * (cols - w));
            const y0 = Math.floor(rng() * (rows - h));
            const ring: number[] = [];
            for (let x = x0; x < x0 + w; x += 1)
                ring.push(at(x, y0), at(x, y0 + h - 1));
            for (let y = y0 + 1; y < y0 + h - 1; y += 1)
                ring.push(at(x0, y), at(x0 + w - 1, y));
            ring.forEach((c) => (walls[c] = 1));
            // One or two doors.
            for (let d = 0; d < 1 + Math.floor(rng() * 2); d += 1) {
                walls[ring[Math.floor(rng() * ring.length)]] = 0;
            }
        }
    } else {
        // Nested rectangular rings, each with one gap on alternating sides.
        for (let k = 0; ; k += 1) {
            const inset = 1 + k * 2;
            const x0 = inset;
            const y0 = inset;
            const x1 = cols - 1 - inset;
            const y1 = rows - 1 - inset;
            if (x1 - x0 < 2 || y1 - y0 < 2) break;
            for (let x = x0; x <= x1; x += 1) {
                walls[at(x, y0)] = 1;
                walls[at(x, y1)] = 1;
            }
            for (let y = y0; y <= y1; y += 1) {
                walls[at(x0, y)] = 1;
                walls[at(x1, y)] = 1;
            }
            const side = k % 4;
            const gx = x0 + 1 + Math.floor(rng() * (x1 - x0 - 1));
            const gy = y0 + 1 + Math.floor(rng() * (y1 - y0 - 1));
            const gap =
                side === 0
                    ? at(gx, y0)
                    : side === 1
                      ? at(x1, gy)
                      : side === 2
                        ? at(gx, y1)
                        : at(x0, gy);
            walls[gap] = 0;
        }
    }

    // Start in the biggest open region, as close to its middle as we can.
    const open = walls.map((w, c) => (w ? -1 : c)).filter((c) => c >= 0);
    if (!open.length) {
        walls[0] = 0;
        return { cols, rows, walls, start: 0 };
    }
    const seen = new Set<number>();
    let best: number[] = [];
    for (const c of open) {
        if (seen.has(c)) continue;
        const part = region(walls, cols, rows, c);
        part.forEach((p) => seen.add(p));
        if (part.length > best.length) best = part;
    }
    const cx =
        preset === "rings"
            ? cols / 2
            : best.reduce((s, c) => s + (c % cols), 0) / best.length;
    const cy =
        preset === "rings"
            ? rows / 2
            : best.reduce((s, c) => s + Math.floor(c / cols), 0) / best.length;
    const start = best.reduce((a, c) => {
        const d = ((c % cols) - cx) ** 2 + (Math.floor(c / cols) - cy) ** 2;
        const e = ((a % cols) - cx) ** 2 + (Math.floor(a / cols) - cy) ** 2;
        return d < e ? c : a;
    }, best[0]);
    return { cols, rows, walls, start };
}

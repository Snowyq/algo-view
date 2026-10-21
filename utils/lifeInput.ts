import { createRng } from "./randoms";

/*
 * Cellular-automaton input: one starting grid (wrapping at the edges)
 * every rule evolves. A soup is random noise, a symmetric soup is the
 * same noise mirrored four ways (rules that keep symmetry make
 * kaleidoscopes), and the R-pentomino is five cells that keep Conway's
 * Life busy for over a thousand generations.
 */

export const LIFE_PRESETS = ["soup", "symmetric", "rpentomino"] as const;
export type LifePreset = (typeof LIFE_PRESETS)[number];

export type LifeConfig = { preset: LifePreset; cols: number; seed: number };
export type LifeInput = { cols: number; rows: number; cells: number[] };

export const LIFE_MIN_COLS = 24;
export const LIFE_MAX_COLS = 96;
export const LIFE_DEFAULT_COLS = 56;

export function isLifePreset(value: unknown): value is LifePreset {
    return (
        typeof value === "string" &&
        (LIFE_PRESETS as readonly string[]).includes(value)
    );
}

export function lifeRows(cols: number): number {
    return Math.max(14, Math.round(cols * 0.6));
}

export function generateLifeInput({
    preset,
    cols: wanted,
    seed,
}: LifeConfig): LifeInput {
    const rng = createRng(seed);
    const cols = Math.max(
        LIFE_MIN_COLS,
        Math.min(LIFE_MAX_COLS, Math.round(wanted))
    );
    const rows = lifeRows(cols);
    const cells = new Array<number>(cols * rows).fill(0);
    const at = (x: number, y: number): number => y * cols + x;
    // Noise only in the middle, so the pattern has room to grow.
    const x0 = Math.floor(cols * 0.25);
    const y0 = Math.floor(rows * 0.25);
    const x1 = cols - x0;
    const y1 = rows - y0;

    if (preset === "soup") {
        for (let y = y0; y < y1; y += 1)
            for (let x = x0; x < x1; x += 1)
                cells[at(x, y)] = rng() < 0.35 ? 1 : 0;
    } else if (preset === "symmetric") {
        const mx = Math.floor(cols / 2);
        const my = Math.floor(rows / 2);
        for (let y = y0; y < my; y += 1) {
            for (let x = x0; x < mx; x += 1) {
                if (rng() >= 0.35) continue;
                cells[at(x, y)] = 1;
                cells[at(cols - 1 - x, y)] = 1;
                cells[at(x, rows - 1 - y)] = 1;
                cells[at(cols - 1 - x, rows - 1 - y)] = 1;
            }
        }
    } else {
        const cx = Math.floor(cols / 2);
        const cy = Math.floor(rows / 2);
        for (const [dx, dy] of [
            [0, -1],
            [1, -1],
            [-1, 0],
            [0, 0],
            [0, 1],
        ]) {
            cells[at(cx + dx, cy + dy)] = 1;
        }
    }
    return { cols, rows, cells };
}

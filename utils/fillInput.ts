import { createRng, randomInt, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * Fill input: walls (1) and open cells (0) plus a start cell. Caves have
 * diagonal pinches that 8-way fills leak through; rings make DFS stacks deep.
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
    return isOneOf(FILL_PRESETS, value);
}

export function fillRows(cols: number): number {
    return Math.max(10, Math.round(cols * 0.6));
}

type Board = { cols: number; rows: number; walls: number[] };

const at = ({ cols }: Board, x: number, y: number): number => y * cols + x;
const inside = ({ cols, rows }: Board, x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < cols && y < rows;

/** Smoothed noise: a cell becomes wall when most of its neighbours are. */
function caves(board: Board, rng: Rng): void {
    const { cols } = board;
    let walls = board.walls.map(() => (rng() < 0.45 ? 1 : 0));
    for (let pass = 0; pass < 4; pass += 1) {
        walls = walls.map((_, c) => {
            const x = c % cols;
            const y = Math.floor(c / cols);
            let around = 0;
            for (let dy = -1; dy <= 1; dy += 1) {
                for (let dx = -1; dx <= 1; dx += 1) {
                    if (!dx && !dy) continue;
                    around += inside(board, x + dx, y + dy)
                        ? walls[at(board, x + dx, y + dy)]
                        : 1;
                }
            }
            return around >= 5 || (pass < 2 && around <= 1) ? 1 : 0;
        });
    }
    board.walls = walls;
}

/** Overlapping rectangle outlines, each with one or two doors. */
function rooms(board: Board, rng: Rng): void {
    const { cols, rows, walls } = board;
    const count = Math.round(cols / 5);
    for (let r = 0; r < count; r += 1) {
        const w = 5 + randomInt(rng, cols / 3);
        const h = 4 + randomInt(rng, rows / 2);
        const x0 = randomInt(rng, cols - w);
        const y0 = randomInt(rng, rows - h);
        const ring: number[] = [];
        for (let x = x0; x < x0 + w; x += 1)
            ring.push(at(board, x, y0), at(board, x, y0 + h - 1));
        for (let y = y0 + 1; y < y0 + h - 1; y += 1)
            ring.push(at(board, x0, y), at(board, x0 + w - 1, y));
        ring.forEach((c) => (walls[c] = 1));
        for (let d = 0; d < 1 + randomInt(rng, 2); d += 1) {
            walls[ring[randomInt(rng, ring.length)]] = 0;
        }
    }
}

/** Nested rectangles, each with one gap on alternating sides. */
function rings(board: Board, rng: Rng): void {
    const { cols, rows, walls } = board;
    for (let k = 0; ; k += 1) {
        const inset = 1 + k * 2;
        const x0 = inset;
        const y0 = inset;
        const x1 = cols - 1 - inset;
        const y1 = rows - 1 - inset;
        if (x1 - x0 < 2 || y1 - y0 < 2) break;
        for (let x = x0; x <= x1; x += 1) {
            walls[at(board, x, y0)] = 1;
            walls[at(board, x, y1)] = 1;
        }
        for (let y = y0; y <= y1; y += 1) {
            walls[at(board, x0, y)] = 1;
            walls[at(board, x1, y)] = 1;
        }
        const gx = x0 + 1 + randomInt(rng, x1 - x0 - 1);
        const gy = y0 + 1 + randomInt(rng, y1 - y0 - 1);
        const gaps = [
            at(board, gx, y0),
            at(board, x1, gy),
            at(board, gx, y1),
            at(board, x0, gy),
        ];
        walls[gaps[k % 4]] = 0;
    }
}

/** Open cells 4-connected to `from`. */
function region(board: Board, from: number): number[] {
    const { cols, walls } = board;
    const seen = new Uint8Array(walls.length);
    const out = [from];
    seen[from] = 1;
    for (let k = 0; k < out.length; k += 1) {
        const x = out[k] % cols;
        const y = Math.floor(out[k] / cols);
        for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            if (!inside(board, x + dx, y + dy)) continue;
            const n = at(board, x + dx, y + dy);
            if (walls[n] || seen[n]) continue;
            seen[n] = 1;
            out.push(n);
        }
    }
    return out;
}

function largestRegion(board: Board): number[] {
    const seen = new Set<number>();
    let best: number[] = [];
    board.walls.forEach((wall, c) => {
        if (wall || seen.has(c)) return;
        const part = region(board, c);
        part.forEach((p) => seen.add(p));
        if (part.length > best.length) best = part;
    });
    return best;
}

/** The open cell closest to the middle of the biggest open region. */
function pickStart(board: Board, preset: FillPreset): number {
    const { cols, rows } = board;
    const best = largestRegion(board);
    const xOf = (c: number): number => c % cols;
    const yOf = (c: number): number => Math.floor(c / cols);
    const mean = (f: (c: number) => number): number =>
        best.reduce((s, c) => s + f(c), 0) / best.length;
    const cx = preset === "rings" ? cols / 2 : mean(xOf);
    const cy = preset === "rings" ? rows / 2 : mean(yOf);
    const dist = (c: number): number => (xOf(c) - cx) ** 2 + (yOf(c) - cy) ** 2;
    return best.reduce((a, c) => (dist(c) < dist(a) ? c : a), best[0]);
}

const PAINTERS: Record<FillPreset, (board: Board, rng: Rng) => void> = {
    caves,
    rooms,
    rings,
};

export function generateFillInput({
    preset,
    cols: wanted,
    seed,
}: FillConfig): FillInput {
    const rng = createRng(seed);
    const cols = clamp(Math.round(wanted), FILL_MIN_COLS, FILL_MAX_COLS);
    const rows = fillRows(cols);
    const board: Board = {
        cols,
        rows,
        walls: new Array<number>(cols * rows).fill(0),
    };
    PAINTERS[preset](board, rng);

    if (!board.walls.includes(0)) {
        board.walls[0] = 0;
        return { ...board, start: 0 };
    }
    return { ...board, start: pickStart(board, preset) };
}

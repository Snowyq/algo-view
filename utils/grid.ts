import { createRng } from "./randoms";

/*
 * Path-finding input: a grid of cells, a start and an end. Cells are
 * plain numbers so the grid crosses into workers as a cheap array.
 */

export const CELL_EMPTY = 0;
export const CELL_WALL = 1;
export const CELL_MUD = 2;
/** Entering a mud cell costs this much (vs 1). */
export const MUD_COST = 5;

export type GridInput = {
    cols: number;
    rows: number;
    cells: number[];
    start: number;
    end: number;
};

export const GRID_PRESETS = [
    "empty",
    "scatter",
    "maze",
    "mud",
    "rooms",
] as const;

export type GridPreset = (typeof GRID_PRESETS)[number];

export type GridConfig = {
    preset: GridPreset;
    /** Columns; rows follow the playground's wide aspect. */
    cols: number;
    seed: number;
};

export const GRID_MIN_COLS = 15;
export const GRID_MAX_COLS = 81;
export const GRID_DEFAULT_COLS = 41;

export function isGridPreset(value: unknown): value is GridPreset {
    return (
        typeof value === "string" &&
        (GRID_PRESETS as readonly string[]).includes(value)
    );
}

/* Odd sizes keep mazes walled on every side. */
const odd = (n: number): number => (n % 2 === 0 ? n + 1 : n);

export function gridSize(cols: number): { cols: number; rows: number } {
    const c = odd(Math.max(GRID_MIN_COLS, Math.min(GRID_MAX_COLS, cols)));
    return { cols: c, rows: odd(Math.max(9, Math.round(c * 0.56))) };
}

export function generateGrid({ preset, cols: wanted, seed }: GridConfig): GridInput {
    const rng = createRng(seed);
    const { cols, rows } = gridSize(wanted);
    const n = cols * rows;
    const cells = new Array<number>(n).fill(CELL_EMPTY);
    const at = (x: number, y: number): number => y * cols + x;
    // Odd row near the middle, so start and end sit in maze corridors.
    const mid = Math.floor(rows / 2);
    const startY = mid % 2 === 1 ? mid : mid - 1;
    const start = at(1, startY);
    const end = at(cols - 2, startY);

    switch (preset) {
        case "empty":
            break;
        case "scatter":
            for (let i = 0; i < n; i += 1) {
                if (rng() < 0.27) cells[i] = CELL_WALL;
            }
            break;
        case "mud":
            for (let i = 0; i < n; i += 1) {
                if (rng() < 0.12) cells[i] = CELL_WALL;
            }
            // A few soft blobs of mud the cheap paths should avoid.
            for (let b = 0; b < Math.round(n / 140); b += 1) {
                const cx = Math.floor(rng() * cols);
                const cy = Math.floor(rng() * rows);
                const r = 2 + Math.floor(rng() * 4);
                for (let y = cy - r; y <= cy + r; y += 1) {
                    for (let x = cx - r; x <= cx + r; x += 1) {
                        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
                        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
                            cells[at(x, y)] = CELL_MUD;
                        }
                    }
                }
            }
            break;
        case "maze": {
            // Recursive backtracker on odd cells: one perfect maze.
            cells.fill(CELL_WALL);
            const stack: Array<[number, number]> = [[1, 1]];
            cells[at(1, 1)] = CELL_EMPTY;
            while (stack.length > 0) {
                const [x, y] = stack[stack.length - 1];
                const options = (
                    [
                        [0, -2],
                        [2, 0],
                        [0, 2],
                        [-2, 0],
                    ] as Array<[number, number]>
                ).filter(([dx, dy]) => {
                    const nx = x + dx;
                    const ny = y + dy;
                    return (
                        nx > 0 &&
                        ny > 0 &&
                        nx < cols - 1 &&
                        ny < rows - 1 &&
                        cells[at(nx, ny)] === CELL_WALL
                    );
                });
                if (options.length === 0) {
                    stack.pop();
                    continue;
                }
                const [dx, dy] = options[Math.floor(rng() * options.length)];
                cells[at(x + dx / 2, y + dy / 2)] = CELL_EMPTY;
                cells[at(x + dx, y + dy)] = CELL_EMPTY;
                stack.push([x + dx, y + dy]);
            }
            // Knock a few extra holes so there is more than one route.
            for (let i = 0; i < Math.round(n / 60); i += 1) {
                const x = 1 + Math.floor(rng() * (cols - 2));
                const y = 1 + Math.floor(rng() * (rows - 2));
                if ((x + y) % 2 === 1) cells[at(x, y)] = CELL_EMPTY;
            }
            break;
        }
        case "rooms": {
            // A grid of rooms with one or two doors in every wall.
            const room = 6;
            for (let y = 0; y < rows; y += 1) {
                for (let x = 0; x < cols; x += 1) {
                    if (x % room === 0 || y % room === 0) cells[at(x, y)] = CELL_WALL;
                }
            }
            for (let ry = 0; ry * room < rows; ry += 1) {
                for (let rx = 0; rx * room < cols; rx += 1) {
                    const doorX = rx * room + 1 + Math.floor(rng() * (room - 1));
                    const doorY = ry * room + 1 + Math.floor(rng() * (room - 1));
                    if ((rx + 1) * room < cols && doorY < rows) {
                        cells[at((rx + 1) * room, doorY)] = CELL_EMPTY;
                    }
                    if ((ry + 1) * room < rows && doorX < cols) {
                        cells[at(doorX, (ry + 1) * room)] = CELL_EMPTY;
                    }
                }
            }
            break;
        }
    }

    cells[start] = CELL_EMPTY;
    cells[end] = CELL_EMPTY;
    return { cols, rows, cells, start, end };
}

/* ---------- Layout (shared by the worker and the editor overlay) ---------- */

export type GridLayout = {
    cell: number;
    gap: number;
    x: number;
    y: number;
};

export function gridLayout(
    cols: number,
    rows: number,
    width: number,
    height: number
): GridLayout {
    const cell = Math.max(2, Math.floor(Math.min(width / cols, height / rows)));
    const gap = cell >= 8 ? 1 : 0;
    return {
        cell,
        gap,
        x: Math.floor((width - cell * cols) / 2),
        y: Math.floor((height - cell * rows) / 2),
    };
}

export function cellAt(
    layout: GridLayout,
    cols: number,
    rows: number,
    px: number,
    py: number
): number {
    const x = Math.floor((px - layout.x) / layout.cell);
    const y = Math.floor((py - layout.y) / layout.cell);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return y * cols + x;
}

/* ---------- Share encoding: 2 bits per cell, base64url ---------- */

export function encodeCells(cells: number[]): string {
    const bytes = new Uint8Array(Math.ceil(cells.length / 4));
    cells.forEach((value, i) => {
        bytes[i >> 2] |= (value & 3) << ((i & 3) * 2);
    });
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCells(text: string, length: number): number[] | null {
    try {
        const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
        const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
        if (binary.length < Math.ceil(length / 4)) return null;
        return Array.from({ length }, (_, i) => {
            const value = (binary.charCodeAt(i >> 2) >> ((i & 3) * 2)) & 3;
            return value > CELL_MUD ? CELL_EMPTY : value;
        });
    } catch {
        return null;
    }
}

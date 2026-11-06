import { createRng, randomInt, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/* Path-finding grid. Cells are plain numbers so it is cheap to send to workers. */

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
    /** Rows follow from the wide aspect. */
    cols: number;
    seed: number;
};

export const GRID_MIN_COLS = 15;
export const GRID_MAX_COLS = 81;
export const GRID_DEFAULT_COLS = 41;

export function isGridPreset(value: unknown): value is GridPreset {
    return isOneOf(GRID_PRESETS, value);
}

// Odd sizes keep mazes walled on every side.
const odd = (n: number): number => (n % 2 === 0 ? n + 1 : n);

export function gridSize(cols: number): { cols: number; rows: number } {
    const c = odd(Math.round(clamp(cols, GRID_MIN_COLS, GRID_MAX_COLS)));
    return { cols: c, rows: odd(Math.max(9, Math.round(c * 0.56))) };
}

type Grid = { cols: number; rows: number; cells: number[] };

const cellIndex = ({ cols }: Grid, x: number, y: number): number =>
    y * cols + x;

function scatterWalls({ cells }: Grid, rng: Rng, chance: number): void {
    for (let i = 0; i < cells.length; i += 1) {
        if (rng() < chance) cells[i] = CELL_WALL;
    }
}

/** Walls plus a few round blobs of mud that cheap paths should avoid. */
function mud(grid: Grid, rng: Rng): void {
    const { cols, rows, cells } = grid;
    scatterWalls(grid, rng, 0.12);
    for (let b = 0; b < Math.round(cells.length / 140); b += 1) {
        const cx = randomInt(rng, cols);
        const cy = randomInt(rng, rows);
        const r = 2 + randomInt(rng, 4);
        for (let y = cy - r; y <= cy + r; y += 1) {
            for (let x = cx - r; x <= cx + r; x += 1) {
                if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
                if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
                    cells[cellIndex(grid, x, y)] = CELL_MUD;
                }
            }
        }
    }
}

const MAZE_STEPS: Array<[number, number]> = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
];

/** Recursive backtracker on odd cells, plus a few holes for extra routes. */
function maze(grid: Grid, rng: Rng): void {
    const { cols, rows, cells } = grid;
    const at = (x: number, y: number): number => cellIndex(grid, x, y);
    cells.fill(CELL_WALL);
    const stack: Array<[number, number]> = [[1, 1]];
    cells[at(1, 1)] = CELL_EMPTY;
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const options = MAZE_STEPS.filter(([dx, dy]) => {
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
        const [dx, dy] = options[randomInt(rng, options.length)];
        cells[at(x + dx / 2, y + dy / 2)] = CELL_EMPTY;
        cells[at(x + dx, y + dy)] = CELL_EMPTY;
        stack.push([x + dx, y + dy]);
    }
    for (let i = 0; i < Math.round(cells.length / 60); i += 1) {
        const x = 1 + randomInt(rng, cols - 2);
        const y = 1 + randomInt(rng, rows - 2);
        if ((x + y) % 2 === 1) cells[at(x, y)] = CELL_EMPTY;
    }
}

/** A grid of rooms with a door in every inner wall. */
function rooms(grid: Grid, rng: Rng): void {
    const { cols, rows, cells } = grid;
    const at = (x: number, y: number): number => cellIndex(grid, x, y);
    const room = 6;
    for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
            if (x % room === 0 || y % room === 0) cells[at(x, y)] = CELL_WALL;
        }
    }
    for (let ry = 0; ry * room < rows; ry += 1) {
        for (let rx = 0; rx * room < cols; rx += 1) {
            const doorX = rx * room + 1 + randomInt(rng, room - 1);
            const doorY = ry * room + 1 + randomInt(rng, room - 1);
            if ((rx + 1) * room < cols && doorY < rows) {
                cells[at((rx + 1) * room, doorY)] = CELL_EMPTY;
            }
            if ((ry + 1) * room < rows && doorX < cols) {
                cells[at(doorX, (ry + 1) * room)] = CELL_EMPTY;
            }
        }
    }
}

const PAINTERS: Record<GridPreset, (grid: Grid, rng: Rng) => void> = {
    empty: () => {},
    scatter: (grid, rng) => scatterWalls(grid, rng, 0.27),
    maze,
    mud,
    rooms,
};

export function generateGrid({
    preset,
    cols: wanted,
    seed,
}: GridConfig): GridInput {
    const rng = createRng(seed);
    const { cols, rows } = gridSize(wanted);
    const grid: Grid = {
        cols,
        rows,
        cells: new Array<number>(cols * rows).fill(CELL_EMPTY),
    };
    // Odd row near the middle, so start and end sit in maze corridors.
    const mid = Math.floor(rows / 2);
    const startY = mid % 2 === 1 ? mid : mid - 1;
    const start = cellIndex(grid, 1, startY);
    const end = cellIndex(grid, cols - 2, startY);

    PAINTERS[preset](grid, rng);
    grid.cells[start] = CELL_EMPTY;
    grid.cells[end] = CELL_EMPTY;
    return { ...grid, start, end };
}

// Layout, shared by the canvas workers and the editor overlay.

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

// Share encoding: 2 bits per cell, base64url.

export function encodeCells(cells: number[]): string {
    const bytes = new Uint8Array(Math.ceil(cells.length / 4));
    cells.forEach((value, i) => {
        bytes[i >> 2] |= (value & 3) << ((i & 3) * 2);
    });
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
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

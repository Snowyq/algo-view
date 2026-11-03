import { createRng, type Rng } from "./randoms";
import { clamp, isOneOf } from "./values";

/*
 * Points in the unit square (y grows downward, like the screen). A ring
 * puts most points on the hull, where output-sensitive algorithms slow down.
 */

export const POINTS_PRESETS = ["scatter", "cluster", "ring"] as const;
export type PointsPreset = (typeof POINTS_PRESETS)[number];

export type PointsConfig = {
    preset: PointsPreset;
    count: number;
    seed: number;
};
export type Point = { x: number; y: number };
export type PointsInput = { points: Point[] };

export const POINTS_MIN = 8;
export const POINTS_MAX = 60;
export const POINTS_DEFAULT = 24;

export function isPointsPreset(value: unknown): value is PointsPreset {
    return isOneOf(POINTS_PRESETS, value);
}

/** Keep a margin and round to 3 decimals. */
const tidy = (v: number): number =>
    Math.round(clamp(v, 0.03, 0.97) * 1000) / 1000;

// No duplicates or collinear triples: hull algorithms disagree on
// degenerate input, which would make the comparison unfair.
function fits(points: Point[], q: Point): boolean {
    for (let a = 0; a < points.length; a += 1) {
        const pa = points[a];
        if (pa.x === q.x && pa.y === q.y) return false;
        for (let b = a + 1; b < points.length; b += 1) {
            const pb = points[b];
            const cross =
                (pb.x - pa.x) * (q.y - pa.y) - (pb.y - pa.y) * (q.x - pa.x);
            if (Math.abs(cross) < 1e-7) return false;
        }
    }
    return true;
}

/** Candidate point number i of n. */
function candidate(
    rng: Rng,
    preset: PointsPreset,
    i: number,
    n: number
): Point {
    if (preset === "scatter") {
        return { x: 0.03 + rng() * 0.94, y: 0.03 + rng() * 0.94 };
    }
    let r: number;
    let a: number;
    if (preset === "cluster") {
        // Box-Muller radius: a soft blob around the centre.
        r = Math.min(0.45, Math.sqrt(-2 * Math.log(1 - rng())) * 0.16);
        a = rng() * Math.PI * 2;
    } else {
        a = rng() * Math.PI * 2;
        r = i < n * 0.65 ? 0.46 : rng() * 0.36;
    }
    return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r };
}

export function generatePointsInput({
    preset,
    count,
    seed,
}: PointsConfig): PointsInput {
    const rng = createRng(seed);
    const n = clamp(Math.round(count), POINTS_MIN, POINTS_MAX);
    const points: Point[] = [];
    for (let tries = 0; points.length < n && tries < n * 50; tries += 1) {
        const { x, y } = candidate(rng, preset, points.length, n);
        const q = { x: tidy(x), y: tidy(y) };
        if (fits(points, q)) points.push(q);
    }
    return { points };
}

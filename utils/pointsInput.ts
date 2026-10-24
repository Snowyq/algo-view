import { createRng } from "./randoms";

/*
 * Geometry input: points in the unit square (y grows downward, like the
 * screen). Presets change how many points end up on the hull: a scatter
 * has a few, a cluster even fewer, a ring puts most of them on it, which
 * is where output-sensitive algorithms like Jarvis march slow down.
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
    return (
        typeof value === "string" &&
        (POINTS_PRESETS as readonly string[]).includes(value)
    );
}

const round = (v: number): number => Math.round(v * 1000) / 1000;

export function generatePointsInput({
    preset,
    count,
    seed,
}: PointsConfig): PointsInput {
    const rng = createRng(seed);
    const n = Math.max(POINTS_MIN, Math.min(POINTS_MAX, Math.round(count)));
    const points: Point[] = [];
    const clamp = (v: number): number => Math.max(0.03, Math.min(0.97, v));
    // No duplicates and no three points on one line: hull algorithms
    // disagree on degenerate input, and the comparison should be fair.
    const fits = (q: Point): boolean => {
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
    };
    for (let tries = 0; points.length < n && tries < n * 50; tries += 1) {
        const i = points.length;
        let x: number;
        let y: number;
        if (preset === "scatter") {
            x = 0.03 + rng() * 0.94;
            y = 0.03 + rng() * 0.94;
        } else if (preset === "cluster") {
            // Box-Muller: a soft blob around the centre.
            const r = Math.min(
                0.45,
                Math.sqrt(-2 * Math.log(1 - rng())) * 0.16
            );
            const a = rng() * Math.PI * 2;
            x = 0.5 + Math.cos(a) * r;
            y = 0.5 + Math.sin(a) * r;
        } else {
            const a = rng() * Math.PI * 2;
            const r = i < n * 0.65 ? 0.46 : rng() * 0.36;
            x = 0.5 + Math.cos(a) * r;
            y = 0.5 + Math.sin(a) * r;
        }
        const q = { x: round(clamp(x)), y: round(clamp(y)) };
        if (fits(q)) points.push(q);
    }
    return { points };
}

import type { CategoryId } from "./categoryData";

/*
 * Measured growth: which config field sets the input size for each
 * category, and the sizes to try (inside each category's limits). Life is
 * left out: every generation touches every cell, so its step count does
 * not grow with the grid.
 */

export type GrowthLadder = { key: string; unit: string; sizes: number[] };

export const GROWTH_LADDERS: Partial<Record<CategoryId, GrowthLadder>> = {
    sort: {
        key: "length",
        unit: "values",
        sizes: [8, 16, 32, 64, 128, 256, 512],
    },
    find: {
        key: "length",
        unit: "values",
        sizes: [8, 16, 32, 64, 128, 256, 512],
    },
    path: { key: "cols", unit: "columns", sizes: [15, 21, 31, 41, 61, 81] },
    maze: { key: "cols", unit: "columns", sizes: [15, 21, 31, 41, 61, 81] },
    dp: { key: "size", unit: "size", sizes: [4, 6, 8, 10, 12, 16] },
    strings: {
        key: "length",
        unit: "letters",
        sizes: [16, 24, 32, 40, 48, 64],
    },
    graph: { key: "nodes", unit: "nodes", sizes: [6, 9, 12, 16, 20, 24] },
    tree: { key: "count", unit: "keys", sizes: [5, 8, 12, 16, 24, 31] },
    geometry: { key: "count", unit: "points", sizes: [8, 12, 16, 24, 40, 60] },
    fill: { key: "cols", unit: "columns", sizes: [16, 24, 32, 40, 52, 64] },
};

export type GrowthPoint = { n: number; value: number; steps: number };

/** Least-squares slope of log(value) against log(n): value ≈ c·n^k. */
export function growthExponent(points: GrowthPoint[]): number | null {
    const usable = points.filter((p) => p.n > 0 && p.value > 0);
    if (usable.length < 3) return null;
    // The small sizes are dominated by constants; fit the larger half.
    const tail = usable.slice(Math.floor(usable.length / 3));
    const xs = tail.map((p) => Math.log(p.n));
    const ys = tail.map((p) => Math.log(p.value));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let num = 0;
    let den = 0;
    xs.forEach((x, i) => {
        num += (x - mx) * (ys[i] - my);
        den += (x - mx) ** 2;
    });
    return den === 0 ? null : num / den;
}

/** "≈ n²: doubling n quadruples the work". */
export function describeGrowth(k: number): string {
    if (k < 0.3) return "about the same work whatever the size";
    if (k < 0.75) return "≈ log n or √n: grows slowly";
    if (k < 1.15) return "≈ n: doubling n doubles the work";
    if (k < 1.5) return "≈ n log n: doubling n a bit more than doubles it";
    if (k < 2.4) return "≈ n²: doubling n quadruples the work";
    return "≈ n³ or worse: doubling n multiplies it by 8 or more";
}

/* Counters that are flags, not work. */
const FLAGS = new Set(["gaveUp", "noPath"]);
/* The counter that best stands for "work": comparisons first, matched by
   key or by the name shown in the UI (sorts call theirs conditionChecks,
   shown as "Checks"); then things visited or produced; then the first. */
const PREFERRED = [
    /check|compar|probe|test/i,
    /visit|cells|filled|carved|labelled/i,
];

export function mainMetricKey(
    metrics: Record<string, { name?: string } | unknown> | undefined
): string | undefined {
    const entries = Object.entries(metrics ?? {}).filter(
        ([key]) => !FLAGS.has(key)
    );
    for (const pattern of PREFERRED) {
        const hit = entries.find(([key, value]) => {
            const name = (value as { name?: string } | null)?.name ?? "";
            return pattern.test(key) || pattern.test(name);
        });
        if (hit) return hit[0];
    }
    return entries[0]?.[0];
}

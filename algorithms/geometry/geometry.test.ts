import { describe, expect, it } from "vitest";
import registryApi from "../algorithmsRegistryApi";
import {
    generatePointsInput,
    POINTS_PRESETS,
    type Point,
    type PointsInput,
} from "../../utils/pointsInput";
import { type HullAlgorithm, POINT_HULL } from "./HullAlgorithm";

type HullClass = new (input: PointsInput) => HullAlgorithm;

const items = registryApi.getAlgorithmsInCategory("geometry") ?? [];

const hullOf = (id: string, input: PointsInput) => {
    const item = items.find((entry) => entry.id === id)!;
    const algo = new (item.algorithm.Class as unknown as HullClass)(input);
    const last = algo.getStateByStepsIndex(algo.getStepsLength() - 1);
    const vertices: number[] = [];
    last.status.forEach((status, i) => {
        if (status === POINT_HULL) vertices.push(i);
    });
    return { vertices, last };
};

/** Reference hull indices via a simple "all others on one side" test. */
function referenceHull(points: Point[]): number[] {
    const cross = (o: Point, a: Point, b: Point): number =>
        (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const onHull = new Set<number>();
    points.forEach((p, i) =>
        points.forEach((q, j) => {
            if (i === j) return;
            const sides = points.map((r) => Math.sign(cross(p, q, r)));
            if (sides.every((s) => s >= 0) || sides.every((s) => s <= 0)) {
                onHull.add(i);
                onHull.add(j);
            }
        })
    );
    return [...onHull].sort((a, b) => a - b);
}

const inputs = POINTS_PRESETS.flatMap((preset) =>
    [8, 24, 60].flatMap((count) =>
        [1, 2].map((seed) => ({
            name: `${preset}, ${count} points, seed ${seed}`,
            input: generatePointsInput({ preset, count, seed }),
        }))
    )
);

describe("convex hull algorithms", () => {
    it("registers five hull algorithms", () => {
        expect(items).toHaveLength(5);
    });

    describe.each(items.map((item) => [item.meta.name, item.id]))(
        "%s",
        (_, id) => {
            it.each(inputs)("finds the reference hull ($name)", ({ input }) => {
                const { vertices, last } = hullOf(id, input);
                expect(vertices).toEqual(referenceHull(input.points));
                expect(last.closed).toBe(true);
                expect(last.lines.length).toBe(vertices.length * 2);
            });
        }
    );

    it("handles a square with points inside", () => {
        const points = [
            { x: 0.1, y: 0.1 },
            { x: 0.4, y: 0.5 },
            { x: 0.9, y: 0.1 },
            { x: 0.5, y: 0.3 },
            { x: 0.9, y: 0.9 },
            { x: 0.6, y: 0.7 },
            { x: 0.1, y: 0.9 },
        ];
        for (const { id } of items) {
            expect(hullOf(id, { points }).vertices).toEqual([0, 2, 4, 6]);
        }
    });

    it("ring inputs put most points on the hull", () => {
        const input = generatePointsInput({
            preset: "ring",
            count: 40,
            seed: 3,
        });
        expect(referenceHull(input.points).length).toBeGreaterThan(15);
    });
});

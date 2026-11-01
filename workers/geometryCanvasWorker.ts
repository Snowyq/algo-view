import {
    type HullAlgorithm,
    POINT_HULL,
    POINT_INSIDE,
} from "../algorithms/geometry/HullAlgorithm";
import type { PointsInput } from "../utils/pointsInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { focusRing, pixelLine } from "./runtime/draw";

/*
 * Convex hull: candidate hull in teal, the tested line in yellow, the tested
 * point green (left turn, keep) or red. The closed hull gets a faint fill.
 */

const PAD = 20;

function describeGeometry({
    algorithm,
    input,
    step,
}: DescribeApi<PointsInput, HullAlgorithm>): string {
    const s = algorithm.getStateByStepsIndex(step);
    const p = (i: number): string => `P${i}`;
    switch (s.type) {
        case "initial":
            return `Wrap ${input.points.length} points in the smallest convex fence.`;
        case "sort":
            return "Sort the points first.";
        case "test":
            return `Is ${p(s.c)} left of ${p(s.a)} → ${p(s.b)}? ${s.ok ? "yes" : "no"}.`;
        case "push":
            return `${p(s.a)} joins the hull.`;
        case "pop":
            return `${p(s.a)} makes a right turn: it is inside, drop it.`;
        case "edge":
            return `Best edge so far: ${p(s.a)} → ${p(s.b)}.`;
        case "finish":
            return `Done: ${algorithm.getMetrics().hull?.count ?? 0} points on the hull.`;
        default:
            return "";
    }
}

createCanvasWorker<PointsInput, HullAlgorithm>({
    category: "geometry",
    describe: describeGeometry,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { points } = input;
        const n = points.length;

        const idle = color("default");
        const inside = color("path-wall", "#4a4036");
        const hull = color("path");
        const testLine = color("check");
        const ok = color("check-true");
        const bad = color("check-false");
        const select = color("select");
        const fg = color("fg");

        // Stretch to the panel, but not so far that a ring turns flat.
        const spanY = height - PAD * 2;
        const spanX = Math.min(width - PAD * 2, spanY * 1.8);
        const left = (width - spanX) / 2;
        const at = points.map((p) => ({
            x: Math.round(left + p.x * spanX),
            y: Math.round(PAD + p.y * spanY),
        }));
        const size = n > 36 ? 6 : 8;
        const half = size / 2;
        const shown = Math.ceil(n * reveal);
        const finished = state.type === "finish";

        // Filled hull at the end.
        if (state.closed && state.lines.length >= 6) {
            ctx.beginPath();
            for (let k = 0; k < state.lines.length; k += 2) {
                const p = at[state.lines[k]];
                if (k === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(95, 214, 198, 0.08)";
            ctx.fill();
        }

        // Hull candidate.
        ctx.fillStyle = hull;
        for (let k = 0; k + 1 < state.lines.length; k += 2) {
            const a = at[state.lines[k]];
            const b = at[state.lines[k + 1]];
            pixelLine(ctx, a.x, a.y, b.x, b.y, 3);
        }

        // The test in progress.
        if (!finished && state.a >= 0 && state.b >= 0) {
            const a = at[state.a];
            const b = at[state.b];
            ctx.fillStyle = state.type === "edge" ? select : testLine;
            pixelLine(ctx, a.x, a.y, b.x, b.y, 2);
            if (state.c >= 0) {
                const c = at[state.c];
                ctx.fillStyle = state.ok ? ok : bad;
                pixelLine(ctx, b.x, b.y, c.x, c.y, 2, true);
            }
        }

        // Points.
        for (let i = 0; i < shown; i += 1) {
            const { x, y } = at[i];
            const status = state.status[i];
            let fill =
                status === POINT_HULL
                    ? hull
                    : status === POINT_INSIDE
                      ? inside
                      : idle;
            let ring: string | null = null;
            if (!finished) {
                if (state.type === "test" && i === state.c) {
                    fill = state.ok ? ok : bad;
                    ring = fill;
                }
                if (state.type === "pop" && i === state.a) ring = bad;
                if (state.type === "push" && i === state.a) ring = fg;
                if (state.type === "sort" && i === state.a) ring = fg;
            }
            if (ring) focusRing(ctx, x - half, y - half, size, ring);
            ctx.fillStyle = fill;
            ctx.fillRect(x - half, y - half, size, size);
        }
    },
});

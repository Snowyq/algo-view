import type { FindAlgorithm } from "../algorithms/find/FindAlgorithm";
import type { FindInput } from "../utils/findInput";
import { createCanvasWorker, type DescribeApi } from "./runtime/canvasWorker";
import { DARK, highlight, monoFont } from "./runtime/draw";

/*
 * Array search: sorted bars with the target as a dashed line. Bars outside
 * the live range are dimmed, a bracket marks the range, probed bars get a tick.
 */

function describeFind({
    algorithm,
    input,
    step,
}: DescribeApi<FindInput, FindAlgorithm>): string {
    const info = algorithm.getStepByIndex(step);
    if (!info) return "";
    const target = input.target;
    switch (info.type) {
        case "initial":
            return `Look for ${target} among ${input.values.length} sorted values.`;
        case "probe": {
            const v = input.values[info.probe];
            const verdict =
                v === target
                    ? "that's it"
                    : v < target
                      ? "too small, look right"
                      : "too big, look left";
            return `a[${info.probe}] = ${v} vs ${target}: ${verdict}.`;
        }
        case "narrow":
            return `Only a[${info.lo}…${info.hi}] can still hold ${target}.`;
        case "found":
            return `Found ${target} at index ${info.found}.`;
        case "miss":
            return `${target} is not in the array.`;
        case "finish":
            return info.found >= 0
                ? `Found at index ${info.found}.`
                : "Gave up.";
        default:
            return "";
    }
}

createCanvasWorker<FindInput, FindAlgorithm>({
    category: "find",
    describe: describeFind,
    draw: ({ ctx, width, height, color, algorithm, input, step, reveal }) => {
        const state = algorithm.getStateByStepsIndex(step);
        const { values, target } = input;
        const n = values.length;
        const max = Math.max(target, ...values);
        const chartTop = 14;
        const chartBottom = height - 12;
        const chartH = Math.max(10, chartBottom - chartTop);
        const gap = n > 160 ? 0 : n > 60 ? 1 : 2;
        const barW = Math.max(1, Math.floor((width - gap * (n - 1)) / n));
        const left = Math.floor((width - (n * barW + (n - 1) * gap)) / 2);
        const xOf = (i: number): number => left + i * (barW + gap);
        const ended =
            state.type === "miss" ||
            (state.type === "finish" && state.found < 0);

        ctx.font = monoFont(10);
        for (let i = 0; i < n; i += 1) {
            const h = Math.max(
                2,
                Math.round(((values[i] / max) * chartH * reveal) / 2) * 2
            );
            const x = xOf(i);
            const y = chartBottom - h;
            const live = i >= state.lo && i <= state.hi;
            let fill = color("default");
            if (i === state.found) fill = color("finish");
            else if (i === state.probe) fill = color("check");
            ctx.globalAlpha =
                live || i === state.found || i === state.probe ? 1 : 0.22;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, barW, h);
            if (barW >= 4 && h >= 4) highlight(ctx, x, y, barW);
            ctx.globalAlpha = 1;
            if (state.probed[i] && i !== state.probe) {
                ctx.fillStyle = color("copy-to", "#95886f");
                ctx.fillRect(x, chartBottom + 2, barW, 2);
            }
            if (barW >= 14 && reveal === 1) {
                ctx.fillStyle = color("label");
                ctx.textAlign = "center";
                ctx.fillText(String(values[i]), x + barW / 2, y - 4);
            }
        }

        if (!ended && state.lo >= 0 && state.lo <= state.hi) {
            const x0 = xOf(state.lo);
            const x1 = xOf(state.hi) + barW;
            ctx.fillStyle = color("select");
            ctx.fillRect(x0, chartBottom + 6, x1 - x0, 2);
            ctx.fillRect(x0, chartBottom + 4, 2, 6);
            ctx.fillRect(x1 - 2, chartBottom + 4, 2, 6);
        }

        // Target line; it turns red once the search gives up.
        const ty = Math.round(chartBottom - (target / max) * chartH * reveal);
        ctx.fillStyle = ended
            ? color("check-false")
            : color("find-target", "#e8825c");
        for (let x = 0; x < width; x += 8) ctx.fillRect(x, ty, 4, 2);
        const label = `target ${target}`;
        ctx.textAlign = "left";
        ctx.fillRect(0, ty - 14, ctx.measureText(label).width + 8, 14);
        ctx.fillStyle = DARK;
        ctx.fillText(label, 4, ty - 4);
    },
});

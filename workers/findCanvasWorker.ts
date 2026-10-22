import type { FindAlgorithm } from "../algorithms/find/FindAlgorithm";
import type { FindInput } from "../utils/findInput";
import { createCanvasWorker } from "./runtime/canvasWorker";

/*
 * Array search: sorted bars, the target as a dashed line at its height,
 * everything outside the live range dimmed, a bracket under the range,
 * and a mark under every bar already probed.
 */

const LIT = "rgba(255, 255, 255, 0.28)";

createCanvasWorker<FindInput, FindAlgorithm>({
    category: "find",
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

        ctx.font = "bold 10px ui-monospace, monospace";
        for (let i = 0; i < n; i += 1) {
            const h = Math.max(
                2,
                Math.round(((values[i] / max) * chartH * reveal) / 2) * 2
            );
            const x = xOf(i);
            const y = chartBottom - h;
            const live = i >= state.lo && i <= state.hi;
            let fill = color("default", "#7a6c5a");
            if (i === state.found) fill = color("finish", "#5fd6c6");
            else if (i === state.probe) fill = color("check", "#f5cd4e");
            ctx.globalAlpha =
                live || i === state.found || i === state.probe ? 1 : 0.22;
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, barW, h);
            if (barW >= 4 && h >= 4) {
                ctx.fillStyle = LIT;
                ctx.fillRect(x, y, barW, 2);
            }
            ctx.globalAlpha = 1;
            if (state.probed[i] && i !== state.probe) {
                ctx.fillStyle = color("copy-to", "#95886f");
                ctx.fillRect(x, chartBottom + 2, barW, 2);
            }
            if (barW >= 14 && reveal === 1) {
                ctx.fillStyle = color("label", "#a99d8a");
                ctx.textAlign = "center";
                ctx.fillText(String(values[i]), x + barW / 2, y - 4);
            }
        }

        if (!ended && state.lo >= 0 && state.lo <= state.hi) {
            const x0 = xOf(state.lo);
            const x1 = xOf(state.hi) + barW;
            ctx.fillStyle = color("select", "#ee8fd0");
            ctx.fillRect(x0, chartBottom + 6, x1 - x0, 2);
            ctx.fillRect(x0, chartBottom + 4, 2, 6);
            ctx.fillRect(x1 - 2, chartBottom + 4, 2, 6);
        }

        // Target line; it turns red once the search gives up.
        const ty = Math.round(chartBottom - (target / max) * chartH * reveal);
        ctx.fillStyle = ended
            ? color("check-false", "#ff7a68")
            : color("find-target", "#e8825c");
        for (let x = 0; x < width; x += 8) ctx.fillRect(x, ty, 4, 2);
        const label = `target ${target}`;
        ctx.textAlign = "left";
        ctx.fillRect(0, ty - 14, ctx.measureText(label).width + 8, 14);
        ctx.fillStyle = "#1d110b";
        ctx.fillText(label, 4, ty - 4);
    },
});

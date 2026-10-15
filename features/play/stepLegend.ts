/*
 * One vocabulary for step types, shared by the legend, the code view and
 * anything else that names or colors a step.
 */

export type StepInfo = {
    type: string;
    instructionId: string[];
};

type StepLegendItem = { label: string; colorVar: string };

export const STEP_LEGEND: Record<string, StepLegendItem> = {
    swap: { label: "Swap", colorVar: "--color-step-swap" },
    select: { label: "Select", colorVar: "--color-step-select" },
    check: { label: "Check", colorVar: "--color-step-check" },
    "check-true": { label: "Check true", colorVar: "--color-step-check-true" },
    "check-false": {
        label: "Check false",
        colorVar: "--color-step-check-false",
    },
    "check-value": { label: "Check", colorVar: "--color-step-check-value" },
    "check-value-true": {
        label: "Check true",
        colorVar: "--color-step-check-value-true",
    },
    "check-value-false": {
        label: "Check false",
        colorVar: "--color-step-check-value-false",
    },
    assign: { label: "Insert", colorVar: "--color-step-assign" },
    copy: { label: "Shift from", colorVar: "--color-step-copy" },
    "copy-to": { label: "Shift to", colorVar: "--color-step-copy-to" },
    finish: { label: "Finish", colorVar: "--color-step-finish" },
    // Path finding
    frontier: { label: "Frontier", colorVar: "--color-step-frontier" },
    visit: { label: "Visited", colorVar: "--color-step-visit" },
    current: { label: "Current", colorVar: "--color-step-current" },
    path: { label: "Route", colorVar: "--color-step-path" },
    wall: { label: "Wall", colorVar: "--color-path-wall" },
    mud: { label: "Mud (×5 cost)", colorVar: "--color-path-mud-dot" },
    start: { label: "Start", colorVar: "--color-path-start" },
    end: { label: "End", colorVar: "--color-path-end" },
};

/** Order shown in the sidebar legend (check-value shares check's colors). */
export const LEGEND_ORDER = [
    "swap",
    "select",
    "check",
    "check-true",
    "check-false",
    "assign",
    "copy",
    "copy-to",
    "finish",
];

/** Path-finding legend: search states, then the grid's materials. */
export const PATH_LEGEND_ORDER = [
    "frontier",
    "visit",
    "current",
    "path",
    "wall",
    "mud",
    "start",
    "end",
];

export function legendOrderFor(category: string): string[] {
    return category === "path" ? PATH_LEGEND_ORDER : LEGEND_ORDER;
}

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

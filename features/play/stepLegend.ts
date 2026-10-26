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
    // Maze generation
    carve: { label: "Carve", colorVar: "--color-step-visit" },
    walk: { label: "Open path / walk", colorVar: "--color-step-path" },
    rock: { label: "Rock", colorVar: "--color-path-wall" },
    passage: { label: "Passage", colorVar: "--color-path-empty" },
    // Dynamic programming
    fill: { label: "Filled", colorVar: "--color-step-visit" },
    read: { label: "Read from", colorVar: "--color-step-check" },
    trace: { label: "Answer", colorVar: "--color-step-finish" },
    // Automata
    alive: { label: "Alive", colorVar: "--color-path-end" },
    born: { label: "Born this generation", colorVar: "--color-step-frontier" },
    died: { label: "Just died", colorVar: "--color-step-check-false" },
    dying: { label: "Dying (Brian's Brain)", colorVar: "--color-step-select" },
    ant: { label: "Ant", colorVar: "--color-step-current" },
    // Fill
    queued: { label: "Waiting", colorVar: "--color-step-frontier" },
    paint: { label: "Painted", colorVar: "--color-step-path" },
    // Geometry
    "hull-edge": { label: "Hull so far", colorVar: "--color-step-path" },
    "hull-test": { label: "Line tested", colorVar: "--color-step-check" },
    "turn-left": {
        label: "Left turn: keep",
        colorVar: "--color-step-check-true",
    },
    "turn-right": {
        label: "Right turn: drop",
        colorVar: "--color-step-check-false",
    },
    discarded: { label: "Inside", colorVar: "--color-path-wall" },
    // Trees
    "tree-insert": { label: "New node", colorVar: "--color-step-finish" },
    "tree-rotate": { label: "Rotation pivot", colorVar: "--color-step-swap" },
    "tree-key": { label: "Key on its way", colorVar: "--color-step-select" },
    "tree-red": { label: "Red node", colorVar: "--color-step-check-false" },
    // Graphs
    tree: { label: "Tree edge", colorVar: "--color-step-path" },
    "edge-seen": { label: "Edge considered", colorVar: "--color-step-check" },
    "edge-reject": {
        label: "Edge dropped",
        colorVar: "--color-step-check-false",
    },
    // Pattern matching
    compare: { label: "Compare", colorVar: "--color-step-check" },
    "compare-true": {
        label: "Letters match",
        colorVar: "--color-step-check-true",
    },
    "compare-false": {
        label: "Mismatch",
        colorVar: "--color-step-check-false",
    },
    shift: { label: "Shift", colorVar: "--color-step-swap" },
    match: { label: "Occurrence", colorVar: "--color-step-finish" },
    table: { label: "Helper table", colorVar: "--color-step-select" },
    // Searching
    probe: { label: "Probe", colorVar: "--color-step-probe" },
    narrow: { label: "Range", colorVar: "--color-step-narrow" },
    found: { label: "Found", colorVar: "--color-step-found" },
    miss: { label: "Not found", colorVar: "--color-step-miss" },
    target: { label: "Target", colorVar: "--color-find-target" },
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

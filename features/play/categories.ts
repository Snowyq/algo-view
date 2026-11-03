import { createSelector, type UnknownAction } from "@reduxjs/toolkit";
import type { ComponentType } from "react";
import type { AlgorithmMetrics } from "../../algorithms/types";
import type { RootState } from "../../store";
import { randomSeed } from "../../utils/randoms";
import { CATEGORY_PREVIEW as PREVIEW } from "./categoryPreview";
import { formatNumber } from "./format";
import { solveMazeActions } from "./mazeBridge";
import DpInputPanel from "./pixel/inspector/DpInputPanel";
import FillInputPanel from "./pixel/inspector/FillInputPanel";
import FindInputPanel from "./pixel/inspector/FindInputPanel";
import GeometryInputPanel from "./pixel/inspector/GeometryInputPanel";
import GraphInputPanel from "./pixel/inspector/GraphInputPanel";
import InputPanel from "./pixel/inspector/InputPanel";
import LifeInputPanel from "./pixel/inspector/LifeInputPanel";
import MazeInputPanel from "./pixel/inspector/MazeInputPanel";
import PathInputPanel from "./pixel/inspector/PathInputPanel";
import StringsInputPanel from "./pixel/inspector/StringsInputPanel";
import TreeInputPanel from "./pixel/inspector/TreeInputPanel";
import type { IconName } from "./pixel/primitives/icons";
import { applyInput, getDefaultStepTypes } from "./playSlice";
import { LEGEND_ORDER } from "./stepLegend";
import { workerVisualizer, type VisualizerProps } from "./WorkerCanvas";

/*
 * UI side of every category; the library, panels, inspector, toolbar,
 * legend and empty state all read from this list. The data side (inputs,
 * workers, share links) lives in algorithms/categoryData.ts.
 */

type PlayState = RootState["play"];

export type CategoryDef = {
    id: string;
    label: string;
    icon: IconName;
    Visualizer: ComponentType<VisualizerProps>;
    InputPanel: ComponentType;
    /** Smallest panel (CSS px, header included) that still reads well. */
    panel: { minWidth: number; minHeight: number };
    /** Tiny pixel preview (see categoryPreview.ts). */
    motif: string[];
    /** Legend entries (keys of STEP_LEGEND), in display order. */
    legend: string[];
    starter: { ids: string[]; label: string; title: string; lead: string };
    /** Badge text when a run ends well / badly. */
    doneLabel: string;
    failLabel: (totals: AlgorithmMetrics | null) => string;
    /** Toolbar chip: short bold label + detail. */
    chip: (play: PlayState) => { label: string; detail: string };
    /** Facts about the current input for the Info tab. */
    runFacts: (play: PlayState) => Array<{ name: string; value: string }>;
    /** Optional extra button on each panel (e.g. hand a maze to Path). */
    panelAction?: {
        label: string;
        icon: IconName;
        run: (algorithmId: string, play: PlayState) => UnknownAction[];
    };
};

// Sorts only record the step types they are told to.
const selectSortOptions = createSelector(
    [getDefaultStepTypes],
    (stepTypes) => ({
        stepTypes,
    })
);

const gridSize = ({ cols, rows }: { cols: number; rows: number }): string =>
    `${cols}×${rows}`;

const PRESET_NAMES: Record<string, string> = {
    random: "random",
    nearlySorted: "nearly sorted",
    reversed: "reversed",
    fewUnique: "few unique",
    sawtooth: "sawtooth",
    organPipe: "organ pipe",
};

export const CATEGORIES: CategoryDef[] = [
    {
        id: "sort",
        label: "Sort",
        icon: "metrics",
        Visualizer: workerVisualizer("sort", "Sorting", selectSortOptions),
        InputPanel,
        panel: { minWidth: 260, minHeight: 220 },
        motif: PREVIEW.sort.motif,
        legend: LEGEND_ORDER,
        starter: {
            ids: PREVIEW.sort.starter,
            label: "Try bubble vs quick vs merge",
            title: "Nothing to sort yet",
            lead: "Pick algorithms from the list to compare them step by step on the same input.",
        },
        doneLabel: "Sorted",
        failLabel: () => "Gave up",
        chip: ({ inputs: { sort } }) => ({
            label: PRESET_NAMES[sort.config.preset] ?? sort.config.preset,
            detail: `n=${sort.config.length} ${sort.config.min}–${sort.config.max}`,
        }),
        runFacts: ({ inputs: { sort } }) => [
            { name: "Input size", value: formatNumber(sort.value.length) },
        ],
    },
    {
        id: "path",
        label: "Path",
        icon: "share",
        Visualizer: workerVisualizer("path", "Searching"),
        InputPanel: PathInputPanel,
        panel: { minWidth: 300, minHeight: 260 },
        motif: PREVIEW.path.motif,
        legend: [
            "frontier",
            "visit",
            "current",
            "path",
            "wall",
            "mud",
            "start",
            "end",
        ],
        starter: {
            ids: PREVIEW.path.starter,
            label: "Try BFS vs Dijkstra vs A*",
            title: "No route yet",
            lead: "Pick path finders from the list to race them across the same map. Drag on a panel to draw walls.",
        },
        doneLabel: "Found",
        failLabel: (totals) => (totals?.noPath?.count ? "No path" : "Gave up"),
        chip: ({ inputs: { path } }) => ({
            label: path.edited ? "edited map" : path.config.preset,
            detail: gridSize(path.value),
        }),
        runFacts: ({ inputs: { path } }) => [
            { name: "Grid", value: gridSize(path.value) },
        ],
    },
    {
        id: "maze",
        label: "Maze",
        icon: "panelLeft",
        Visualizer: workerVisualizer("maze", "Carving"),
        InputPanel: MazeInputPanel,
        panel: { minWidth: 280, minHeight: 260 },
        motif: PREVIEW.maze.motif,
        legend: ["walk", "frontier", "current", "carve", "rock", "passage"],
        starter: {
            ids: PREVIEW.maze.starter,
            label: "Try backtracker vs Prim vs Wilson",
            title: "Nothing carved yet",
            lead: "Pick generators to carve mazes from the same seed and compare their texture.",
        },
        doneLabel: "Carved",
        failLabel: () => "Gave up",
        chip: ({ inputs: { maze } }) => ({
            label: "maze",
            detail: gridSize(maze.value),
        }),
        runFacts: ({ inputs: { maze } }) => [
            { name: "Grid", value: gridSize(maze.value) },
            { name: "Seed", value: maze.config.seed.toString(36) },
        ],
        panelAction: {
            label: "Solve in Path",
            icon: "share",
            run: (id, play) => solveMazeActions(id, play.inputs.maze.value),
        },
    },
    {
        id: "dp",
        label: "DP",
        icon: "legend",
        Visualizer: workerVisualizer("dp", "Filling"),
        InputPanel: DpInputPanel,
        panel: { minWidth: 340, minHeight: 300 },
        motif: PREVIEW.dp.motif,
        legend: ["fill", "read", "trace"],
        starter: {
            ids: PREVIEW.dp.starter,
            label: "Try edit distance vs LCS vs knapsack",
            title: "No table yet",
            lead: "Pick dynamic programming problems to watch their tables fill cell by cell, then trace the answer back.",
        },
        doneLabel: "Solved",
        failLabel: () => "No answer",
        chip: ({ inputs: { dp } }) => ({
            label: dp.config.preset,
            detail: `${dp.value.a} · ${dp.value.b}`,
        }),
        runFacts: ({ inputs: { dp } }) => [
            { name: "Words", value: `${dp.value.a} · ${dp.value.b}` },
            { name: "Size", value: String(dp.config.size) },
        ],
    },
    {
        id: "life",
        label: "Life",
        icon: "glider",
        Visualizer: workerVisualizer("life", "Seeding"),
        InputPanel: LifeInputPanel,
        panel: { minWidth: 260, minHeight: 240 },
        motif: PREVIEW.life.motif,
        legend: ["alive", "born", "died", "dying", "ant"],
        starter: {
            ids: PREVIEW.life.starter,
            label: "Try Life vs HighLife vs Day & Night",
            title: "Nothing alive yet",
            lead: "Pick cellular automata to evolve the same starting grid under different rules, one generation per step.",
        },
        doneLabel: "Evolved",
        failLabel: () => "Died out",
        chip: ({ inputs: { life } }) => ({
            label: life.config.preset,
            detail: gridSize(life.value),
        }),
        runFacts: ({ inputs: { life } }) => [
            { name: "Grid", value: gridSize(life.value) },
            { name: "Start", value: life.config.preset },
        ],
    },
    {
        id: "fill",
        label: "Fill",
        icon: "bucket",
        Visualizer: workerVisualizer("fill", "Pouring"),
        InputPanel: FillInputPanel,
        panel: { minWidth: 260, minHeight: 240 },
        motif: PREVIEW.fill.motif,
        legend: ["paint", "queued", "current", "start", "wall"],
        starter: {
            ids: PREVIEW.fill.starter,
            label: "Try queue vs stack vs scanline",
            title: "Nothing to fill yet",
            lead: "Pick flood fills to pour paint into the same bitmap from the same start and compare how much memory each one needs.",
        },
        doneLabel: "Filled",
        failLabel: () => "Stuck",
        chip: ({ inputs: { fill } }) => ({
            label: fill.config.preset,
            detail: gridSize(fill.value),
        }),
        runFacts: ({ inputs: { fill } }) => [
            { name: "Bitmap", value: gridSize(fill.value) },
            { name: "Layout", value: fill.config.preset },
        ],
    },
    {
        id: "geometry",
        label: "Hull",
        icon: "hull",
        Visualizer: workerVisualizer("geometry", "Wrapping"),
        InputPanel: GeometryInputPanel,
        panel: { minWidth: 280, minHeight: 260 },
        motif: PREVIEW.geometry.motif,
        legend: [
            "hull-edge",
            "hull-test",
            "turn-left",
            "turn-right",
            "discarded",
        ],
        starter: {
            ids: PREVIEW.geometry.starter,
            label: "Try Graham vs Jarvis vs Quickhull",
            title: "No hull yet",
            lead: "Pick convex hull algorithms to wrap the same points and count the orientation tests each one needs.",
        },
        doneLabel: "Wrapped",
        failLabel: () => "Stuck",
        chip: ({ inputs: { geometry } }) => ({
            label: `${geometry.value.points.length} points`,
            detail: geometry.config.preset,
        }),
        runFacts: ({ inputs: { geometry } }) => [
            { name: "Points", value: String(geometry.value.points.length) },
            { name: "Layout", value: geometry.config.preset },
        ],
    },
    {
        id: "tree",
        label: "Trees",
        icon: "tree",
        Visualizer: workerVisualizer("tree", "Planting"),
        InputPanel: TreeInputPanel,
        panel: { minWidth: 340, minHeight: 300 },
        motif: PREVIEW.tree.motif,
        legend: [
            "compare",
            "tree-key",
            "tree-insert",
            "tree-rotate",
            "tree-red",
        ],
        starter: {
            ids: PREVIEW.tree.starter,
            label: "Try BST vs AVL vs red-black",
            title: "No tree yet",
            lead: "Pick trees to insert the same keys in the same order and watch which ones stay short.",
        },
        doneLabel: "Built",
        failLabel: () => "Stuck",
        chip: ({ inputs: { tree } }) => ({
            label: `${tree.value.keys.length} keys`,
            detail: tree.config.preset,
        }),
        runFacts: ({ inputs: { tree } }) => [
            { name: "Keys", value: String(tree.value.keys.length) },
            { name: "Order", value: tree.config.preset },
        ],
    },
    {
        id: "graph",
        label: "Graph",
        icon: "graph",
        Visualizer: workerVisualizer("graph", "Wiring"),
        InputPanel: GraphInputPanel,
        panel: { minWidth: 340, minHeight: 280 },
        motif: PREVIEW.graph.motif,
        legend: [
            "frontier",
            "visit",
            "current",
            "tree",
            "edge-seen",
            "edge-reject",
        ],
        starter: {
            ids: PREVIEW.graph.starter,
            label: "Try Kruskal vs Prim vs Dijkstra",
            title: "No graph yet",
            lead: "Pick graph algorithms to build spanning trees, shortest paths and visit orders on the same weighted graph.",
        },
        doneLabel: "Done",
        failLabel: () => "Stuck",
        chip: ({ inputs: { graph } }) => ({
            label: `${graph.value.nodes.length} nodes`,
            detail: `${graph.value.edges.length} edges ${graph.config.preset}`,
        }),
        runFacts: ({ inputs: { graph } }) => [
            { name: "Nodes", value: String(graph.value.nodes.length) },
            { name: "Edges", value: String(graph.value.edges.length) },
        ],
    },
    {
        id: "strings",
        label: "Strings",
        icon: "code",
        Visualizer: workerVisualizer("strings", "Matching"),
        InputPanel: StringsInputPanel,
        panel: { minWidth: 380, minHeight: 240 },
        motif: PREVIEW.strings.motif,
        legend: ["compare-true", "compare-false", "match", "table"],
        starter: {
            ids: PREVIEW.strings.starter,
            label: "Try KMP vs Horspool vs naive",
            title: "No pattern yet",
            lead: "Pick pattern matchers to slide the same word along the same text and count every letter they compare.",
        },
        doneLabel: "Matched",
        failLabel: () => "No match",
        chip: ({ inputs: { strings } }) => ({
            label: `"${strings.value.pattern}"`,
            detail: `n=${strings.value.text.length} ${strings.config.preset}`,
        }),
        runFacts: ({ inputs: { strings } }) => [
            { name: "Pattern", value: strings.value.pattern },
            { name: "Text", value: `${strings.value.text.length} letters` },
        ],
    },
    {
        id: "find",
        label: "Find",
        icon: "info",
        Visualizer: workerVisualizer("find", "Searching"),
        InputPanel: FindInputPanel,
        panel: { minWidth: 260, minHeight: 220 },
        motif: PREVIEW.find.motif,
        legend: ["probe", "narrow", "found", "miss", "target"],
        starter: {
            ids: PREVIEW.find.starter,
            label: "Try binary vs interpolation vs linear",
            title: "Nothing to find yet",
            lead: "Pick search algorithms to hunt for the same value in the same sorted array.",
        },
        doneLabel: "Found",
        failLabel: (totals) =>
            totals?.noPath?.count ? "Not found" : "Gave up",
        chip: ({ inputs: { find } }) => ({
            label: `find ${find.value.target}`,
            detail: `n=${find.value.values.length} ${find.config.preset}`,
        }),
        runFacts: ({ inputs: { find } }) => [
            { name: "Array", value: formatNumber(find.value.values.length) },
            { name: "Target", value: String(find.value.target) },
        ],
    },
];

export function categoryOf(id: string): CategoryDef {
    return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}

/** Same recipe with a fresh seed (G shortcut, "new input"). */
export function regenerateInput(play: PlayState): UnknownAction {
    const category = play.active.category;
    const { config } = play.inputs[category];
    return applyInput({
        category,
        config: { ...config, seed: randomSeed() },
    } as Parameters<typeof applyInput>[0]);
}

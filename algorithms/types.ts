import type { Algorithm } from "./Algorithm";

export type AlgorithmInstruction = {
    line: string;
    indent: number;
};

export type AlgorithmInstructions = Record<string, AlgorithmInstruction>;

export type AlgorithmGroup = "classic" | "fun";

export type AlgorithmMeta = {
    name: string;
    description: string;
    /** Average-case time. */
    timeComplexity: string;
    bestCase: string;
    worstCase: string;
    auxiliarySpace: string;
    /** Sort: equal values keep their relative order (as implemented here). */
    stable?: boolean;
    /** Sort: works within the input array, without a second array of size n. */
    inPlace?: boolean;
    /** Path: guarantees the best route (shortest, or cheapest if weighted). */
    optimal?: boolean;
    /** Path: takes mud (cell cost) into account. */
    weighted?: boolean;
    /** Find: only works on sorted input. */
    needsSorted?: boolean;
    /** Find: jumps around by index (needs random access, not a list). */
    randomAccess?: boolean;
    /** Maze: every possible maze is equally likely (no bias). */
    uniform?: boolean;
    /** Maze: long winding corridors rather than many short branches. */
    longCorridors?: boolean;
    /** DP: shape of the table (one row, or a full grid). */
    tableDims?: 1 | 2;
    /** Automata: rule in B/S notation. */
    rule?: string;
    /** Automata: random starts tend to fill the grid. */
    explosive?: boolean;
    /** Fill: neighbourhood (8 also steps diagonally). */
    connectivity?: 4 | 8;
    /** Fill: paints whole horizontal runs at once. */
    spans?: boolean;
    /** Geometry: cost depends on the hull size h. */
    outputSensitive?: boolean;
    /** Geometry: sorts the points first. */
    sortsFirst?: boolean;
    /** Trees: height stays O(log n) whatever the insert order. */
    balanced?: boolean;
    /** Trees: restructures with rotations. */
    rotates?: boolean;
    /** Graphs: what the algorithm produces. */
    graphGoal?: "mst" | "shortest" | "order";
    /** Strings: builds a helper table from the pattern first. */
    preprocesses?: boolean;
    /** Strings: linear time even in the worst case. */
    linearWorst?: boolean;
    group?: AlgorithmGroup;
};

export type AlgorithmMetric = {
    count: number;
    name: string;
};

export type AlgorithmMetrics = Record<string, AlgorithmMetric>;

export type AlgorithmConstructor<T extends Algorithm = Algorithm> = new (
    ...args: unknown[]
) => T;

export type AlgorithmRegistryItem = {
    id: string;
    meta: AlgorithmMeta;
    algorithm: {
        Class: AlgorithmConstructor;
        instructions?: AlgorithmInstructions;
    };
};

export type AlgorithmCategory = {
    name: string;
    id: string;
    items: AlgorithmRegistryItem[];
};

export type AlgorithmsRegistry = {
    data: AlgorithmCategory[];
    categoriesLog: string[];
};

/*
 * The contract between any algorithm and its canvas worker. Every
 * category's base class (sort, path, find, …) implements it, and the
 * shared worker runtime relies on nothing else.
 */
export type StepMetrics = Record<string, AlgorithmMetric>;

export type StepBase = {
    type?: string;
    instructionId?: string[];
    metrics?: StepMetrics;
};

export interface StepAlgorithm<
    TStep extends StepBase = StepBase,
    TState = unknown,
> {
    getStepsLength(): number;
    getStepByIndex(index: number): TStep | undefined;
    /** Whatever the drawing needs at step `index` (array, overlay, range…). */
    getStateByStepsIndex(index: number): TState;
    /** Counters at the end of the run (decide which counters exist). */
    getMetrics(): StepMetrics;
}

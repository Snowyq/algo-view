import {
    SORT_DEFAULT_INPUT_LENGTH,
    SORT_DEFAULT_INPUT_VALUE_RANGE,
    SORT_MAX_INPUT_LENGTH,
    SORT_MIN_INPUT_LENGTH,
} from "../config/sort";
import {
    FIND_DEFAULT_LENGTH,
    generateFindInput,
    isFindPreset,
    isFindTarget,
    type FindConfig,
    type FindInput,
} from "../utils/findInput";
import {
    decodeCells,
    encodeCells,
    GRID_DEFAULT_COLS,
    generateGrid,
    gridSize,
    isGridPreset,
    type GridConfig,
    type GridInput,
} from "../utils/grid";
import {
    DP_DEFAULT_SIZE,
    generateDpInput,
    isDpPreset,
    type DpConfig,
    type DpInput,
} from "../utils/dpInput";
import {
    generateLifeInput,
    isLifePreset,
    LIFE_DEFAULT_COLS,
    type LifeConfig,
    type LifeInput,
} from "../utils/lifeInput";
import {
    FILL_DEFAULT_COLS,
    generateFillInput,
    isFillPreset,
    type FillConfig,
    type FillInput,
} from "../utils/fillInput";
import {
    generatePointsInput,
    isPointsPreset,
    POINTS_DEFAULT,
    type PointsConfig,
    type PointsInput,
} from "../utils/pointsInput";
import {
    generateTreeInput,
    isTreePreset,
    TREE_DEFAULT_COUNT,
    type TreeConfig,
    type TreeInput,
} from "../utils/treeInput";
import {
    generateGraphInput,
    GRAPH_DEFAULT_NODES,
    isGraphPreset,
    type GraphConfig,
    type GraphInput,
} from "../utils/graphInput";
import {
    generateTextInput,
    isTextPreset,
    TEXT_DEFAULT_LENGTH,
    type TextConfig,
    type TextInput,
} from "../utils/textInput";
import type { MazeInput } from "./maze/MazeAlgorithm";
import {
    generateInput,
    isInputPreset,
    randomSeed,
    type InputConfig,
} from "../utils/randoms";
import { clamp } from "../utils/values";

/*
 * Data side of every category, free of React so reducers and workers can
 * use it: input generation, canvas worker and share-link format. The UI
 * side lives in features/play/categories.ts.
 */

export type WorkerName =
    | "sortCanvasWorker.ts"
    | "pathCanvasWorker.ts"
    | "findCanvasWorker.ts"
    | "mazeCanvasWorker.ts"
    | "dpCanvasWorker.ts"
    | "stringsCanvasWorker.ts"
    | "graphCanvasWorker.ts"
    | "treeCanvasWorker.ts"
    | "geometryCanvasWorker.ts"
    | "fillCanvasWorker.ts"
    | "lifeCanvasWorker.ts";

export type InputSlot<TConfig, TValue> = {
    /** The recipe (preset, size, seed). */
    config: TConfig;
    /** What the algorithms actually get. */
    value: TValue;
    /** Changed by hand after it was generated from the recipe. */
    edited: boolean;
};

type CategoryData<TConfig, TValue> = {
    worker: WorkerName;
    /** Initial ms per step, picked so a typical run takes 8 to 15 seconds. */
    defaultSpeed: number;
    defaultConfig: () => TConfig;
    generate: (config: TConfig) => TValue;
    share: {
        write: (
            slot: InputSlot<TConfig, TValue>,
            params: URLSearchParams
        ) => void;
        read: (
            params: URLSearchParams
        ) => { config: TConfig; value?: TValue } | null;
    };
};

type Share<TConfig, TValue> = CategoryData<TConfig, TValue>["share"];

const seedOf = (params: URLSearchParams): number | null => {
    const seed = Number.parseInt(params.get("s") ?? "", 36);
    return Number.isFinite(seed) ? seed >>> 0 : null;
};

const writeSeed = (params: URLSearchParams, seed: number): void =>
    params.set("s", seed.toString(36));

type PresetConfig<P extends string, K extends string> = {
    preset: P;
    seed: number;
} & Record<K, number>;

/** Share format for configs made of a preset, one size field and a seed. */
function presetShare<P extends string, K extends string, TValue>(
    isPreset: (value: unknown) => value is P,
    sizeField: K,
    presetParam: string,
    sizeParam: string
): Share<PresetConfig<P, K>, TValue> {
    return {
        write: ({ config }, params) => {
            params.set(presetParam, config.preset);
            params.set(sizeParam, String(config[sizeField]));
            writeSeed(params, config.seed);
        },
        read: (params) => {
            const preset = params.get(presetParam);
            const size = Number(params.get(sizeParam));
            const seed = seedOf(params);
            if (!isPreset(preset) || !Number.isInteger(size) || seed === null) {
                return null;
            }
            const config = { preset, [sizeField]: size, seed };
            return { config: config as PresetConfig<P, K> };
        },
    };
}

const sort: CategoryData<InputConfig, number[]> = {
    worker: "sortCanvasWorker.ts",
    defaultSpeed: 5,
    defaultConfig: () => ({
        preset: "random",
        length: SORT_DEFAULT_INPUT_LENGTH,
        min: SORT_DEFAULT_INPUT_VALUE_RANGE[0],
        max: SORT_DEFAULT_INPUT_VALUE_RANGE[1],
        seed: randomSeed(),
    }),
    generate: (config) =>
        generateInput({
            ...config,
            length: clamp(
                config.length,
                SORT_MIN_INPUT_LENGTH,
                SORT_MAX_INPUT_LENGTH
            ),
        }),
    share: {
        write: ({ config }, params) => {
            params.set("p", config.preset);
            params.set("n", String(config.length));
            params.set("r", `${config.min}-${config.max}`);
            writeSeed(params, config.seed);
        },
        read: (params) => {
            const preset = params.get("p");
            const length = Number(params.get("n"));
            const [min, max] = (params.get("r") ?? "").split("-").map(Number);
            const seed = seedOf(params);
            if (
                !isInputPreset(preset) ||
                !Number.isInteger(length) ||
                !Number.isInteger(min) ||
                !Number.isInteger(max) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, length, min, max, seed } };
        },
    },
};

/** The hand-edited map from a share link, if there is a valid one. */
function readEditedGrid(
    params: URLSearchParams,
    cols: number
): GridInput | null {
    const [encoded, start, end] = (params.get("g") ?? "").split(".");
    if (!encoded) return null;
    const size = gridSize(cols);
    const n = size.cols * size.rows;
    const cells = decodeCells(encoded, n);
    const s = Number(start);
    const e = Number(end);
    const inside = (i: number): boolean =>
        Number.isInteger(i) && i >= 0 && i < n;
    if (!cells || !inside(s) || !inside(e) || s === e) return null;
    return { ...size, cells, start: s, end: e };
}

const path: CategoryData<GridConfig, GridInput> = {
    worker: "pathCanvasWorker.ts",
    defaultSpeed: 16,
    defaultConfig: () => ({
        preset: "maze",
        cols: GRID_DEFAULT_COLS,
        seed: randomSeed(),
    }),
    generate: generateGrid,
    share: {
        write: ({ config, value, edited }, params) => {
            params.set("m", config.preset);
            params.set("w", String(config.cols));
            writeSeed(params, config.seed);
            // A hand-edited map travels as 2 bits per cell.
            if (edited) {
                params.set(
                    "g",
                    `${encodeCells(value.cells)}.${value.start}.${value.end}`
                );
            }
        },
        read: (params) => {
            const preset = params.get("m");
            const cols = Number(params.get("w"));
            const seed = seedOf(params);
            if (
                !isGridPreset(preset) ||
                !Number.isInteger(cols) ||
                seed === null
            ) {
                return null;
            }
            const config: GridConfig = { preset, cols, seed };
            const value = readEditedGrid(params, cols);
            return value ? { config, value } : { config };
        },
    },
};

const find: CategoryData<FindConfig, FindInput> = {
    worker: "findCanvasWorker.ts",
    defaultSpeed: 500,
    defaultConfig: () => ({
        preset: "even",
        length: FIND_DEFAULT_LENGTH,
        target: "present",
        seed: randomSeed(),
    }),
    generate: generateFindInput,
    share: {
        write: ({ config }, params) => {
            params.set("fp", config.preset);
            params.set("fn", String(config.length));
            params.set("ft", config.target);
            writeSeed(params, config.seed);
        },
        read: (params) => {
            const preset = params.get("fp");
            const target = params.get("ft");
            const length = Number(params.get("fn"));
            const seed = seedOf(params);
            if (
                !isFindPreset(preset) ||
                !isFindTarget(target) ||
                !Number.isInteger(length) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, target, length, seed } };
        },
    },
};

export type MazeConfig = { cols: number; seed: number };

const maze: CategoryData<MazeConfig, MazeInput> = {
    worker: "mazeCanvasWorker.ts",
    defaultSpeed: 5,
    defaultConfig: () => ({ cols: GRID_DEFAULT_COLS, seed: randomSeed() }),
    generate: ({ cols, seed }) => ({ ...gridSize(cols), seed }),
    share: {
        write: ({ config }, params) => {
            params.set("w", String(config.cols));
            writeSeed(params, config.seed);
        },
        read: (params) => {
            const cols = Number(params.get("w"));
            const seed = seedOf(params);
            if (!Number.isInteger(cols) || seed === null) return null;
            return { config: { cols, seed } };
        },
    },
};

const dp: CategoryData<DpConfig, DpInput> = {
    worker: "dpCanvasWorker.ts",
    defaultSpeed: 100,
    defaultConfig: () => ({
        preset: "words",
        size: DP_DEFAULT_SIZE,
        seed: randomSeed(),
    }),
    generate: generateDpInput,
    share: presetShare(isDpPreset, "size", "dp", "dn"),
};

const strings: CategoryData<TextConfig, TextInput> = {
    worker: "stringsCanvasWorker.ts",
    defaultSpeed: 50,
    defaultConfig: () => ({
        preset: "prose",
        length: TEXT_DEFAULT_LENGTH,
        seed: randomSeed(),
    }),
    generate: generateTextInput,
    share: presetShare(isTextPreset, "length", "tp", "tn"),
};

const graph: CategoryData<GraphConfig, GraphInput> = {
    worker: "graphCanvasWorker.ts",
    defaultSpeed: 100,
    defaultConfig: () => ({
        preset: "sparse",
        nodes: GRAPH_DEFAULT_NODES,
        seed: randomSeed(),
    }),
    generate: generateGraphInput,
    share: presetShare(isGraphPreset, "nodes", "gp", "gn"),
};

const tree: CategoryData<TreeConfig, TreeInput> = {
    worker: "treeCanvasWorker.ts",
    defaultSpeed: 100,
    defaultConfig: () => ({
        preset: "random",
        count: TREE_DEFAULT_COUNT,
        seed: randomSeed(),
    }),
    generate: generateTreeInput,
    share: presetShare(isTreePreset, "count", "kp", "kn"),
};

const geometry: CategoryData<PointsConfig, PointsInput> = {
    worker: "geometryCanvasWorker.ts",
    defaultSpeed: 50,
    defaultConfig: () => ({
        preset: "scatter",
        count: POINTS_DEFAULT,
        seed: randomSeed(),
    }),
    generate: generatePointsInput,
    share: presetShare(isPointsPreset, "count", "xp", "xn"),
};

const fill: CategoryData<FillConfig, FillInput> = {
    worker: "fillCanvasWorker.ts",
    defaultSpeed: 16,
    defaultConfig: () => ({
        preset: "caves",
        cols: FILL_DEFAULT_COLS,
        seed: randomSeed(),
    }),
    generate: generateFillInput,
    share: presetShare(isFillPreset, "cols", "lp", "lc"),
};

const life: CategoryData<LifeConfig, LifeInput> = {
    worker: "lifeCanvasWorker.ts",
    defaultSpeed: 100,
    defaultConfig: () => ({
        preset: "soup",
        cols: LIFE_DEFAULT_COLS,
        seed: randomSeed(),
    }),
    generate: generateLifeInput,
    share: presetShare(isLifePreset, "cols", "ap", "ac"),
};

export const CATEGORY_DATA = {
    sort,
    path,
    find,
    maze,
    dp,
    strings,
    graph,
    tree,
    geometry,
    fill,
    life,
};

export type CategoryId = keyof typeof CATEGORY_DATA;

export type CategoryInputs = {
    sort: InputSlot<InputConfig, number[]>;
    path: InputSlot<GridConfig, GridInput>;
    find: InputSlot<FindConfig, FindInput>;
    maze: InputSlot<MazeConfig, MazeInput>;
    dp: InputSlot<DpConfig, DpInput>;
    strings: InputSlot<TextConfig, TextInput>;
    graph: InputSlot<GraphConfig, GraphInput>;
    tree: InputSlot<TreeConfig, TreeInput>;
    geometry: InputSlot<PointsConfig, PointsInput>;
    fill: InputSlot<FillConfig, FillInput>;
    life: InputSlot<LifeConfig, LifeInput>;
};

export type ConfigOf<C extends CategoryId> = CategoryInputs[C]["config"];
export type ValueOf<C extends CategoryId> = CategoryInputs[C]["value"];

export function isCategoryId(value: unknown): value is CategoryId {
    return typeof value === "string" && value in CATEGORY_DATA;
}

function dataOf<C extends CategoryId>(
    category: C
): CategoryData<ConfigOf<C>, ValueOf<C>> {
    return CATEGORY_DATA[category] as unknown as CategoryData<
        ConfigOf<C>,
        ValueOf<C>
    >;
}

export function generateFor<C extends CategoryId>(
    category: C,
    config: ConfigOf<C>
): ValueOf<C> {
    return dataOf(category).generate(config);
}

export function initialInputs(): CategoryInputs {
    const inputs: Partial<Record<CategoryId, unknown>> = {};
    for (const category of Object.keys(CATEGORY_DATA) as CategoryId[]) {
        const config = dataOf(category).defaultConfig();
        inputs[category] = {
            config,
            value: generateFor(category, config),
            edited: false,
        };
    }
    return inputs as CategoryInputs;
}

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

/*
 * Data side of every category, free of React so reducers and workers can
 * use it: how its input is made, which canvas worker draws it, and how
 * its input travels in a share link. The UI side lives in
 * features/play/categories.ts.
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
    /** The recipe (preset, size, seed…). */
    config: TConfig;
    /** What the algorithms actually get. */
    value: TValue;
    /** Changed by hand after it was generated from the recipe. */
    edited: boolean;
};

type CategoryData<TConfig, TValue> = {
    worker: WorkerName;
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

const seedOf = (params: URLSearchParams): number | null => {
    const seed = Number.parseInt(params.get("s") ?? "", 36);
    return Number.isFinite(seed) ? seed >>> 0 : null;
};

const sort: CategoryData<InputConfig, number[]> = {
    worker: "sortCanvasWorker.ts",
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
            length: Math.max(
                SORT_MIN_INPUT_LENGTH,
                Math.min(SORT_MAX_INPUT_LENGTH, config.length)
            ),
        }),
    share: {
        write: ({ config }, params) => {
            params.set("p", config.preset);
            params.set("n", String(config.length));
            params.set("r", `${config.min}-${config.max}`);
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("p");
            const length = Number(params.get("n"));
            const [min, max] = (params.get("r") ?? "").split("-").map(Number);
            const seed = seedOf(params);
            if (
                !isInputPreset(preset) ||
                !Number.isFinite(length) ||
                !Number.isFinite(min) ||
                !Number.isFinite(max) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, length, min, max, seed } };
        },
    },
};

const path: CategoryData<GridConfig, GridInput> = {
    worker: "pathCanvasWorker.ts",
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
            params.set("s", config.seed.toString(36));
            // A map edited by hand travels as 2 bits per cell.
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
                !Number.isFinite(cols) ||
                seed === null
            ) {
                return null;
            }
            const config: GridConfig = { preset, cols, seed };
            const [encoded, start, end] = (params.get("g") ?? "").split(".");
            if (!encoded) return { config };
            const size = gridSize(cols);
            const n = size.cols * size.rows;
            const cells = decodeCells(encoded, n);
            const s = Number(start);
            const e = Number(end);
            const inside = (i: number): boolean =>
                Number.isInteger(i) && i >= 0 && i < n;
            if (!cells || !inside(s) || !inside(e) || s === e)
                return { config };
            return { config, value: { ...size, cells, start: s, end: e } };
        },
    },
};

const find: CategoryData<FindConfig, FindInput> = {
    worker: "findCanvasWorker.ts",
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
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("fp");
            const target = params.get("ft");
            const length = Number(params.get("fn"));
            const seed = seedOf(params);
            if (
                !isFindPreset(preset) ||
                !isFindTarget(target) ||
                !Number.isFinite(length) ||
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
    defaultConfig: () => ({ cols: GRID_DEFAULT_COLS, seed: randomSeed() }),
    generate: ({ cols, seed }) => ({ ...gridSize(cols), seed }),
    share: {
        write: ({ config }, params) => {
            params.set("w", String(config.cols));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const cols = Number(params.get("w"));
            const seed = seedOf(params);
            if (!Number.isFinite(cols) || seed === null) return null;
            return { config: { cols, seed } };
        },
    },
};

const dp: CategoryData<DpConfig, DpInput> = {
    worker: "dpCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "words",
        size: DP_DEFAULT_SIZE,
        seed: randomSeed(),
    }),
    generate: generateDpInput,
    share: {
        write: ({ config }, params) => {
            params.set("dp", config.preset);
            params.set("dn", String(config.size));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("dp");
            const size = Number(params.get("dn"));
            const seed = seedOf(params);
            if (
                !isDpPreset(preset) ||
                !Number.isFinite(size) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, size, seed } };
        },
    },
};

const strings: CategoryData<TextConfig, TextInput> = {
    worker: "stringsCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "prose",
        length: TEXT_DEFAULT_LENGTH,
        seed: randomSeed(),
    }),
    generate: generateTextInput,
    share: {
        write: ({ config }, params) => {
            params.set("tp", config.preset);
            params.set("tn", String(config.length));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("tp");
            const length = Number(params.get("tn"));
            const seed = seedOf(params);
            if (
                !isTextPreset(preset) ||
                !Number.isFinite(length) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, length, seed } };
        },
    },
};

const graph: CategoryData<GraphConfig, GraphInput> = {
    worker: "graphCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "sparse",
        nodes: GRAPH_DEFAULT_NODES,
        seed: randomSeed(),
    }),
    generate: generateGraphInput,
    share: {
        write: ({ config }, params) => {
            params.set("gp", config.preset);
            params.set("gn", String(config.nodes));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("gp");
            const nodes = Number(params.get("gn"));
            const seed = seedOf(params);
            if (
                !isGraphPreset(preset) ||
                !Number.isFinite(nodes) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, nodes, seed } };
        },
    },
};

const tree: CategoryData<TreeConfig, TreeInput> = {
    worker: "treeCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "random",
        count: TREE_DEFAULT_COUNT,
        seed: randomSeed(),
    }),
    generate: generateTreeInput,
    share: {
        write: ({ config }, params) => {
            params.set("kp", config.preset);
            params.set("kn", String(config.count));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("kp");
            const count = Number(params.get("kn"));
            const seed = seedOf(params);
            if (
                !isTreePreset(preset) ||
                !Number.isFinite(count) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, count, seed } };
        },
    },
};

const geometry: CategoryData<PointsConfig, PointsInput> = {
    worker: "geometryCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "scatter",
        count: POINTS_DEFAULT,
        seed: randomSeed(),
    }),
    generate: generatePointsInput,
    share: {
        write: ({ config }, params) => {
            params.set("xp", config.preset);
            params.set("xn", String(config.count));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("xp");
            const count = Number(params.get("xn"));
            const seed = seedOf(params);
            if (
                !isPointsPreset(preset) ||
                !Number.isFinite(count) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, count, seed } };
        },
    },
};

const fill: CategoryData<FillConfig, FillInput> = {
    worker: "fillCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "caves",
        cols: FILL_DEFAULT_COLS,
        seed: randomSeed(),
    }),
    generate: generateFillInput,
    share: {
        write: ({ config }, params) => {
            params.set("lp", config.preset);
            params.set("lc", String(config.cols));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("lp");
            const cols = Number(params.get("lc"));
            const seed = seedOf(params);
            if (
                !isFillPreset(preset) ||
                !Number.isFinite(cols) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, cols, seed } };
        },
    },
};

const life: CategoryData<LifeConfig, LifeInput> = {
    worker: "lifeCanvasWorker.ts",
    defaultConfig: () => ({
        preset: "soup",
        cols: LIFE_DEFAULT_COLS,
        seed: randomSeed(),
    }),
    generate: generateLifeInput,
    share: {
        write: ({ config }, params) => {
            params.set("ap", config.preset);
            params.set("ac", String(config.cols));
            params.set("s", config.seed.toString(36));
        },
        read: (params) => {
            const preset = params.get("ap");
            const cols = Number(params.get("ac"));
            const seed = seedOf(params);
            if (
                !isLifePreset(preset) ||
                !Number.isFinite(cols) ||
                seed === null
            ) {
                return null;
            }
            return { config: { preset, cols, seed } };
        },
    },
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

/* Generate a value from a config, for whichever category. */
export function generateFor<C extends CategoryId>(
    category: C,
    config: ConfigOf<C>
): ValueOf<C> {
    const data = CATEGORY_DATA[category] as unknown as CategoryData<
        ConfigOf<C>,
        ValueOf<C>
    >;
    return data.generate(config);
}

export function initialInputs(): CategoryInputs {
    const slot = <C extends CategoryId>(category: C): CategoryInputs[C] => {
        const data = CATEGORY_DATA[category] as unknown as CategoryData<
            ConfigOf<C>,
            ValueOf<C>
        >;
        const config = data.defaultConfig();
        return {
            config,
            value: data.generate(config),
            edited: false,
        } as CategoryInputs[C];
    };
    return {
        sort: slot("sort"),
        path: slot("path"),
        find: slot("find"),
        maze: slot("maze"),
        dp: slot("dp"),
        strings: slot("strings"),
        graph: slot("graph"),
        tree: slot("tree"),
        geometry: slot("geometry"),
        fill: slot("fill"),
        life: slot("life"),
    };
}

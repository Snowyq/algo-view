import { SORT_ANIMATION_SPEEDS } from "../../../../config/sort";
import {
    decodeCells,
    encodeCells,
    gridSize,
    isGridPreset,
    type GridConfig,
    type GridInput,
} from "../../../../utils/grid";
import { isInputPreset, type InputConfig } from "../../../../utils/randoms";

/*
 * The whole setup fits in a query string.
 *   Sorting: ?a=bubbleSort,quickSort&p=random&n=50&r=1-30&s=k3x9q2&v=16
 *   Paths:   ?c=path&a=bfs,astar&m=maze&w=41&s=k3x9q2&v=16[&g=<cells>.<start>.<end>]
 * Same link, same algorithms, same input (the seed), same speed. A map
 * edited by hand travels as 2 bits per cell in `g`.
 */

export type SharedSetup = {
    category: string;
    algorithms: string[];
    input: InputConfig;
    grid: { config: GridConfig; edited: GridInput | null };
    speed: number;
};

export function buildShareUrl(setup: SharedSetup): string {
    const params = new URLSearchParams();
    if (setup.category !== "sort") params.set("c", setup.category);
    if (setup.algorithms.length > 0) {
        params.set("a", setup.algorithms.join(","));
    }
    if (setup.category === "path") {
        const { config, edited } = setup.grid;
        params.set("m", config.preset);
        params.set("w", String(config.cols));
        params.set("s", config.seed.toString(36));
        if (edited) {
            params.set(
                "g",
                `${encodeCells(edited.cells)}.${edited.start}.${edited.end}`
            );
        }
    } else {
        params.set("p", setup.input.preset);
        params.set("n", String(setup.input.length));
        params.set("r", `${setup.input.min}-${setup.input.max}`);
        params.set("s", setup.input.seed.toString(36));
    }
    params.set("v", String(setup.speed));
    const url = new URL(window.location.href);
    url.search = params.toString();
    url.hash = "";
    return url.toString();
}

export function parseShareUrl(search: string): Partial<SharedSetup> | null {
    const params = new URLSearchParams(search);
    if (![...params.keys()].some((key) => "acpnrsvmwg".includes(key))) {
        return null;
    }

    const result: Partial<SharedSetup> = {};
    const category = params.get("c") === "path" ? "path" : "sort";
    result.category = category;
    const algorithms = params.get("a");
    if (algorithms) result.algorithms = algorithms.split(",").filter(Boolean);
    const seed = Number.parseInt(params.get("s") ?? "", 36);

    if (category === "path") {
        const preset = params.get("m");
        const cols = Number(params.get("w"));
        if (isGridPreset(preset) && Number.isFinite(cols) && Number.isFinite(seed)) {
            const config: GridConfig = { preset, cols, seed: seed >>> 0 };
            let edited: GridInput | null = null;
            const [encoded, start, end] = (params.get("g") ?? "").split(".");
            if (encoded) {
                const size = gridSize(cols);
                const cells = decodeCells(encoded, size.cols * size.rows);
                const s = Number(start);
                const e = Number(end);
                const inside = (i: number): boolean =>
                    Number.isInteger(i) && i >= 0 && i < size.cols * size.rows;
                if (cells && inside(s) && inside(e) && s !== e) {
                    edited = { ...size, cells, start: s, end: e };
                }
            }
            result.grid = { config, edited };
        }
    } else {
        const preset = params.get("p");
        const length = Number(params.get("n"));
        const [min, max] = (params.get("r") ?? "").split("-").map(Number);
        if (
            isInputPreset(preset) &&
            Number.isFinite(length) &&
            Number.isFinite(min) &&
            Number.isFinite(max) &&
            Number.isFinite(seed)
        ) {
            result.input = { preset, length, min, max, seed: seed >>> 0 };
        }
    }

    const speed = Number(params.get("v"));
    if (SORT_ANIMATION_SPEEDS.includes(speed)) result.speed = speed;
    return result;
}

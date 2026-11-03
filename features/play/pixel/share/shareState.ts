import {
    CATEGORY_DATA,
    isCategoryId,
    type CategoryId,
    type CategoryInputs,
    type ConfigOf,
    type ValueOf,
} from "../../../../algorithms/categoryData";
import { SORT_ANIMATION_SPEEDS } from "../../../../config/sort";

/*
 * Setup as a query string: ?c=<category>&a=<ids>&v=<speed>&<input params>.
 * Input params come from each category's codec in categoryData; sort omits c.
 */

type PlayLike = {
    active: { category: CategoryId; algorithms: Array<{ id: string }> };
    inputs: CategoryInputs;
    animation: { speed: number };
};

export type SharedSetup = {
    category: CategoryId;
    algorithms?: string[];
    speed?: number;
    input?: {
        [C in CategoryId]: {
            category: C;
            config: ConfigOf<C>;
            value?: ValueOf<C>;
        };
    }[CategoryId];
};

type Codec = {
    write: (slot: unknown, params: URLSearchParams) => void;
    read: (
        params: URLSearchParams
    ) => { config: unknown; value?: unknown } | null;
};

const codecOf = (category: CategoryId): Codec =>
    CATEGORY_DATA[category].share as unknown as Codec;

export function buildShareUrl(play: PlayLike): string {
    const category = play.active.category;
    const params = new URLSearchParams();
    if (category !== "sort") params.set("c", category);
    if (play.active.algorithms.length > 0) {
        params.set(
            "a",
            play.active.algorithms.map((algo) => algo.id).join(",")
        );
    }
    codecOf(category).write(play.inputs[category], params);
    params.set("v", String(play.animation.speed));
    const url = new URL(window.location.href);
    url.search = params.toString();
    url.hash = "";
    return url.toString();
}

export function parseShareUrl(search: string): SharedSetup | null {
    const params = new URLSearchParams(search);
    if ([...params.keys()].length === 0) return null;

    const raw = params.get("c") ?? "sort";
    const category: CategoryId = isCategoryId(raw) ? raw : "sort";
    const result: SharedSetup = { category };

    const algorithms = params.get("a");
    if (algorithms) result.algorithms = algorithms.split(",").filter(Boolean);

    const input = codecOf(category).read(params);
    if (input) {
        result.input = { category, ...input } as SharedSetup["input"];
    }

    const speed = Number(params.get("v"));
    if (SORT_ANIMATION_SPEEDS.includes(speed)) result.speed = speed;
    return result;
}

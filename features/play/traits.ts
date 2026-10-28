import type { AlgorithmMeta } from "../../algorithms/types";

export type Trait = { on: boolean; label: string; short: string };

/*
 * Yes/no properties worth showing for an algorithm. Sorts are judged on
 * stability and memory; path finders on whether the route is the best
 * one and whether they notice mud.
 */
export function algorithmTraits(meta: AlgorithmMeta): Trait[] {
    if (meta.rule) {
        const rule = { on: true, label: `Rule ${meta.rule}`, short: meta.rule };
        if (typeof meta.explosive !== "boolean") return [rule];
        return [
            rule,
            {
                on: !meta.explosive,
                label: meta.explosive ? "Tends to explode" : "Tends to settle",
                short: meta.explosive ? "explosive" : "settles",
            },
        ];
    }
    if (meta.connectivity) {
        return [
            {
                on: meta.connectivity === 4,
                label:
                    meta.connectivity === 4
                        ? "4-way: walls hold"
                        : "8-way: leaks through diagonal gaps",
                short: meta.connectivity === 4 ? "4-way" : "8-way",
            },
            {
                on: Boolean(meta.spans),
                label: meta.spans ? "Paints whole runs" : "Cell by cell",
                short: meta.spans ? "runs" : "per cell",
            },
        ];
    }
    if (typeof meta.outputSensitive === "boolean") {
        return [
            {
                on: meta.outputSensitive,
                label: meta.outputSensitive
                    ? "Output-sensitive: fast on small hulls"
                    : "Same cost whatever the hull",
                short: meta.outputSensitive ? "output-sensitive" : "fixed cost",
            },
            {
                on: Boolean(meta.sortsFirst),
                label: meta.sortsFirst
                    ? "Sorts the points first"
                    : "No sorting",
                short: meta.sortsFirst ? "sorts first" : "no sort",
            },
        ];
    }
    if (typeof meta.balanced === "boolean") {
        return [
            {
                on: meta.balanced,
                label: meta.balanced ? "Stays balanced" : "Can degenerate",
                short: meta.balanced ? "balanced" : "can degenerate",
            },
            {
                on: Boolean(meta.rotates),
                label: meta.rotates ? "Rotates nodes" : "No rotations",
                short: meta.rotates ? "rotations" : "no rotations",
            },
        ];
    }
    if (meta.graphGoal) {
        const goal = {
            mst: ["Minimum spanning tree", "mst"],
            shortest: ["Shortest distances", "shortest paths"],
            order: ["Visit order", "traversal"],
        }[meta.graphGoal];
        return [
            { on: true, label: goal[0], short: goal[1] },
            {
                on: Boolean(meta.weighted),
                label: meta.weighted ? "Uses weights" : "Ignores weights",
                short: meta.weighted ? "weighted" : "unweighted",
            },
        ];
    }
    if (typeof meta.preprocesses === "boolean") {
        return [
            {
                on: Boolean(meta.linearWorst),
                label: meta.linearWorst
                    ? "Linear worst case"
                    : "Can go quadratic",
                short: meta.linearWorst ? "linear" : "quadratic worst",
            },
            {
                on: Boolean(meta.preprocesses),
                label: meta.preprocesses
                    ? "Preprocesses the pattern"
                    : "No preprocessing",
                short: meta.preprocesses ? "preprocessing" : "no preprocessing",
            },
        ];
    }
    if (meta.tableDims) {
        return [
            {
                on: true,
                label: meta.tableDims === 2 ? "2D table" : "1D table",
                short: meta.tableDims === 2 ? "2d table" : "1d table",
            },
            { on: true, label: "Traces the answer", short: "traceback" },
        ];
    }
    if (typeof meta.uniform === "boolean") {
        return [
            {
                on: Boolean(meta.uniform),
                label: meta.uniform ? "Uniform: no bias" : "Biased texture",
                short: meta.uniform ? "uniform" : "biased",
            },
            {
                on: Boolean(meta.longCorridors),
                label: meta.longCorridors
                    ? "Long corridors"
                    : "Many short branches",
                short: meta.longCorridors ? "long corridors" : "short branches",
            },
        ];
    }
    if (
        typeof meta.needsSorted === "boolean" ||
        typeof meta.randomAccess === "boolean"
    ) {
        return [
            {
                on: !meta.needsSorted,
                label: meta.needsSorted ? "Needs sorted data" : "Any order",
                short: meta.needsSorted ? "sorted input" : "any order",
            },
            {
                on: Boolean(meta.randomAccess),
                label: meta.randomAccess ? "Jumps by index" : "Walks in order",
                short: meta.randomAccess ? "random access" : "sequential",
            },
        ];
    }
    if (
        typeof meta.optimal === "boolean" ||
        typeof meta.weighted === "boolean"
    ) {
        return [
            {
                on: Boolean(meta.optimal),
                label: meta.optimal ? "Best route" : "Any route",
                short: meta.optimal ? "optimal" : "not optimal",
            },
            {
                on: Boolean(meta.weighted),
                label: meta.weighted ? "Avoids mud" : "Ignores mud",
                short: meta.weighted ? "weighted" : "unweighted",
            },
        ];
    }
    return [
        {
            on: Boolean(meta.stable),
            label: meta.stable ? "Stable" : "Not stable",
            short: meta.stable ? "stable" : "unstable",
        },
        {
            on: Boolean(meta.inPlace),
            label: meta.inPlace ? "In place" : "Extra memory",
            short: meta.inPlace ? "in place" : "extra memory",
        },
    ];
}

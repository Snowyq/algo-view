import type { AlgorithmMeta } from "../../algorithms/types";

export type Trait = { on: boolean; label: string; short: string };

type Wording = [label: string, short: string];

/** A yes/no trait, worded by whether it holds. */
function trait(on: boolean, yes: Wording, no: Wording): Trait {
    const [label, short] = on ? yes : no;
    return { on, label, short };
}

/** A trait that always holds. */
function fact(label: string, short: string): Trait {
    return { on: true, label, short };
}

/** Yes/no properties worth showing for an algorithm, by its family. */
export function algorithmTraits(meta: AlgorithmMeta): Trait[] {
    if (meta.rule) {
        const rule = fact(`Rule ${meta.rule}`, meta.rule);
        if (typeof meta.explosive !== "boolean") return [rule];
        return [
            rule,
            trait(
                !meta.explosive,
                ["Tends to settle", "settles"],
                ["Tends to explode", "explosive"]
            ),
        ];
    }
    if (meta.connectivity) {
        return [
            trait(
                meta.connectivity === 4,
                ["4-way: walls hold", "4-way"],
                ["8-way: leaks through diagonal gaps", "8-way"]
            ),
            trait(
                Boolean(meta.spans),
                ["Paints whole runs", "runs"],
                ["Cell by cell", "per cell"]
            ),
        ];
    }
    if (typeof meta.outputSensitive === "boolean") {
        return [
            trait(
                meta.outputSensitive,
                ["Output-sensitive: fast on small hulls", "output-sensitive"],
                ["Same cost whatever the hull", "fixed cost"]
            ),
            trait(
                Boolean(meta.sortsFirst),
                ["Sorts the points first", "sorts first"],
                ["No sorting", "no sort"]
            ),
        ];
    }
    if (typeof meta.balanced === "boolean") {
        return [
            trait(
                meta.balanced,
                ["Stays balanced", "balanced"],
                ["Can degenerate", "can degenerate"]
            ),
            trait(
                Boolean(meta.rotates),
                ["Rotates nodes", "rotations"],
                ["No rotations", "no rotations"]
            ),
        ];
    }
    if (meta.graphGoal) {
        const goal = {
            mst: fact("Minimum spanning tree", "mst"),
            shortest: fact("Shortest distances", "shortest paths"),
            order: fact("Visit order", "traversal"),
        }[meta.graphGoal];
        return [
            goal,
            trait(
                Boolean(meta.weighted),
                ["Uses weights", "weighted"],
                ["Ignores weights", "unweighted"]
            ),
        ];
    }
    if (typeof meta.preprocesses === "boolean") {
        return [
            trait(
                Boolean(meta.linearWorst),
                ["Linear worst case", "linear"],
                ["Can go quadratic", "quadratic worst"]
            ),
            trait(
                meta.preprocesses,
                ["Preprocesses the pattern", "preprocessing"],
                ["No preprocessing", "no preprocessing"]
            ),
        ];
    }
    if (meta.tableDims) {
        return [
            meta.tableDims === 2
                ? fact("2D table", "2d table")
                : fact("1D table", "1d table"),
            fact("Traces the answer", "traceback"),
        ];
    }
    if (typeof meta.uniform === "boolean") {
        return [
            trait(
                meta.uniform,
                ["Uniform: no bias", "uniform"],
                ["Biased texture", "biased"]
            ),
            trait(
                Boolean(meta.longCorridors),
                ["Long corridors", "long corridors"],
                ["Many short branches", "short branches"]
            ),
        ];
    }
    if (
        typeof meta.needsSorted === "boolean" ||
        typeof meta.randomAccess === "boolean"
    ) {
        return [
            trait(
                !meta.needsSorted,
                ["Any order", "any order"],
                ["Needs sorted data", "sorted input"]
            ),
            trait(
                Boolean(meta.randomAccess),
                ["Jumps by index", "random access"],
                ["Walks in order", "sequential"]
            ),
        ];
    }
    if (
        typeof meta.optimal === "boolean" ||
        typeof meta.weighted === "boolean"
    ) {
        return [
            trait(
                Boolean(meta.optimal),
                ["Best route", "optimal"],
                ["Any route", "not optimal"]
            ),
            trait(
                Boolean(meta.weighted),
                ["Avoids mud", "weighted"],
                ["Ignores mud", "unweighted"]
            ),
        ];
    }
    return [
        trait(
            Boolean(meta.stable),
            ["Stable", "stable"],
            ["Not stable", "unstable"]
        ),
        trait(
            Boolean(meta.inPlace),
            ["In place", "in place"],
            ["Extra memory", "extra memory"]
        ),
    ];
}

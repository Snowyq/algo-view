import type { AlgorithmMeta } from "../../algorithms/types";

export type Trait = { on: boolean; label: string; short: string };

/*
 * Yes/no properties worth showing for an algorithm. Sorts are judged on
 * stability and memory; path finders on whether the route is the best
 * one and whether they notice mud.
 */
export function algorithmTraits(meta: AlgorithmMeta): Trait[] {
    if (typeof meta.optimal === "boolean" || typeof meta.weighted === "boolean") {
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

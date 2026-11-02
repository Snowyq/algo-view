import { DisjointSet } from "../../../../utils/disjointSet";
import type { GraphInput } from "../../../../utils/graphInput";
import { nodeName } from "../../../../utils/graphInput";

/* Parsers for hand-typed input: text in, a value or a short error out. */

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = <T>(error: string): Parsed<T> => ({ ok: false, error });

/** Whole numbers separated by spaces, commas or semicolons. */
export function parseNumbers(
    text: string,
    {
        min,
        max,
        minCount,
        maxCount,
    }: { min: number; max: number; minCount: number; maxCount: number }
): Parsed<number[]> {
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    const values = parts.map(Number);
    const bad = parts.find((part, i) => !Number.isInteger(values[i]));
    if (bad !== undefined) return fail(`"${bad}" is not a whole number.`);
    if (values.length < minCount)
        return fail(`Give at least ${minCount} numbers.`);
    if (values.length > maxCount) return fail(`At most ${maxCount} numbers.`);
    const out = values.find((v) => v < min || v > max);
    if (out !== undefined) return fail(`${out} is outside ${min}–${max}.`);
    return { ok: true, value: values };
}

/** Distinct keys for the trees. */
export function parseKeys(text: string): Parsed<number[]> {
    const parsed = parseNumbers(text, {
        min: 1,
        max: 99,
        minCount: 2,
        maxCount: 31,
    });
    if (!parsed.ok) return parsed;
    const seen = new Set<number>();
    const dup = parsed.value.find((v) =>
        seen.has(v) ? true : (seen.add(v), false)
    );
    if (dup !== undefined)
        return fail(`${dup} appears twice; keys must be distinct.`);
    return parsed;
}

/** Collapses whitespace and checks the length. */
export function parseText(
    text: string,
    { minLength, maxLength }: { minLength: number; maxLength: number }
): Parsed<string> {
    const clean = text.replace(/\s+/g, " ");
    if (clean.length < minLength)
        return fail(`Use at least ${minLength} characters.`);
    if (clean.length > maxLength)
        return fail(`At most ${maxLength} characters.`);
    return { ok: true, value: clean };
}

/** Graph edges, one "A-B 5" per line or comma separated. */
export function parseEdges(
    text: string,
    nodeCount: number
): Parsed<GraphInput["edges"]> {
    const lines = text
        .split(/[\n,;]+/)
        .map((l) => l.trim())
        .filter(Boolean);
    const index = (name: string): number => {
        for (let i = 0; i < nodeCount; i += 1)
            if (nodeName(i) === name.toUpperCase()) return i;
        return -1;
    };
    const edges: GraphInput["edges"] = [];
    const seen = new Set<string>();
    for (const line of lines) {
        const m = line.match(/^([A-Za-z]\d*)\s*[-–]\s*([A-Za-z]\d*)\s+(\d+)$/);
        if (!m) return fail(`"${line}": write it like "A-B 5".`);
        const a = index(m[1]);
        const b = index(m[2]);
        const w = Number(m[3]);
        if (a < 0 || b < 0) return fail(`"${line}": no such node.`);
        if (a === b)
            return fail(`"${line}": an edge needs two different nodes.`);
        if (w < 1 || w > 99) return fail(`"${line}": weights go from 1 to 99.`);
        const [lo, hi] = a < b ? [a, b] : [b, a];
        if (seen.has(`${lo}-${hi}`))
            return fail(`"${line}": that edge is already listed.`);
        seen.add(`${lo}-${hi}`);
        edges.push({ a: lo, b: hi, w });
    }
    // every graph algorithm here assumes a connected graph
    const sets = new DisjointSet(nodeCount);
    edges.forEach(({ a, b }) => sets.union(a, b));
    const loose = Array.from({ length: nodeCount }, (_, i) => i).findIndex(
        (i) => sets.find(i) !== sets.find(0)
    );
    if (loose >= 0)
        return fail(
            `${nodeName(loose)} can't be reached from A: connect every node.`
        );
    return { ok: true, value: edges };
}

export function edgesToText(edges: GraphInput["edges"]): string {
    return edges
        .map(({ a, b, w }) => `${nodeName(a)}-${nodeName(b)} ${w}`)
        .join("\n");
}

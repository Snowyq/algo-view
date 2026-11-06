import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    initialInputs,
    type CategoryId,
} from "../../../../algorithms/categoryData";
import { buildShareUrl, parseShareUrl } from "./shareState";

const play = (category: CategoryId, ids: string[], speed = 16) => ({
    active: { category, algorithms: ids.map((id) => ({ id })) },
    inputs: initialInputs(),
    animation: { speed },
});

describe("share URL", () => {
    beforeEach(() => {
        vi.stubGlobal("window", {
            location: { href: "https://example.com/play#top" },
        });
    });
    afterEach(() => vi.unstubAllGlobals());

    it("returns null for a bare /play", () => {
        expect(parseShareUrl("")).toBeNull();
    });

    it.each<[CategoryId, string[]]>([
        ["sort", ["bubbleSort", "quickSort"]],
        ["path", ["bfs", "astar"]],
        ["graph", ["kruskalMst"]],
        ["strings", []],
    ])("restores a %s setup", (category, ids) => {
        const state = play(category, ids, 50);
        const url = new URL(buildShareUrl(state));
        const setup = parseShareUrl(url.search);
        expect(url.hash).toBe("");
        expect(setup?.category).toBe(category);
        expect(setup?.algorithms).toEqual(ids.length ? ids : undefined);
        expect(setup?.speed).toBe(50);
        expect(setup?.input?.config).toEqual(state.inputs[category].config);
    });

    it("leaves sort out of the query as the default category", () => {
        const url = new URL(buildShareUrl(play("sort", [])));
        expect(url.searchParams.has("c")).toBe(false);
    });

    it("falls back to sort for an unknown category and ignores odd speeds", () => {
        const setup = parseShareUrl("?c=cooking&v=3");
        expect(setup?.category).toBe("sort");
        expect(setup?.speed).toBeUndefined();
    });
});

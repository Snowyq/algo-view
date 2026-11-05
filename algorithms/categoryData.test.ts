import { describe, expect, it } from "vitest";
import {
    CATEGORY_DATA,
    generateFor,
    initialInputs,
    isCategoryId,
    type CategoryId,
    type InputSlot,
} from "./categoryData";
import registryApi from "./algorithmsRegistryApi";
import { CELL_MUD, CELL_WALL } from "../utils/grid";

const categories = Object.keys(CATEGORY_DATA) as CategoryId[];

type Codec = {
    write: (slot: InputSlot<unknown, unknown>, params: URLSearchParams) => void;
    read: (
        params: URLSearchParams
    ) => { config: unknown; value?: unknown } | null;
};

const codecOf = (category: CategoryId): Codec =>
    CATEGORY_DATA[category].share as unknown as Codec;

const roundTrip = (category: CategoryId, slot: InputSlot<unknown, unknown>) => {
    const params = new URLSearchParams();
    codecOf(category).write(slot, params);
    // Through a real query string, as a shared link would travel.
    return codecOf(category).read(new URLSearchParams(params.toString()));
};

describe("category data", () => {
    it("matches the registry categories one to one", () => {
        expect(categories.slice().sort()).toEqual(
            registryApi.getCategoriesIds().slice().sort()
        );
    });

    it("recognises category ids", () => {
        expect(isCategoryId("sort")).toBe(true);
        expect(isCategoryId("cooking")).toBe(false);
        expect(isCategoryId(7)).toBe(false);
    });

    it.each(categories)(
        "%s generates the same value for the same config",
        (category) => {
            const config = CATEGORY_DATA[category].defaultConfig();
            expect(generateFor(category, config as never)).toEqual(
                generateFor(category, config as never)
            );
        }
    );

    it("builds an unedited input for every category", () => {
        const inputs = initialInputs();
        for (const category of categories) {
            expect(inputs[category].edited).toBe(false);
            expect(inputs[category].value).toBeDefined();
        }
    });
});

describe("share links", () => {
    it.each(categories)("%s config survives encode and decode", (category) => {
        const config = CATEGORY_DATA[category].defaultConfig();
        const slot = {
            config,
            value: generateFor(category, config as never),
            edited: false,
        };
        const decoded = roundTrip(category, slot);
        expect(decoded).toEqual({ config });
    });

    it("an edited path map travels with the link", () => {
        const config = { preset: "empty" as const, cols: 21, seed: 4 };
        const value = generateFor("path", config);
        value.cells[30] = CELL_WALL;
        value.cells[31] = CELL_MUD;
        value.start = 3;
        value.end = 50;
        const decoded = roundTrip("path", { config, value, edited: true });
        expect(decoded).toEqual({ config, value });
    });

    it("an unedited path map is rebuilt from its seed", () => {
        const config = { preset: "maze" as const, cols: 21, seed: 4 };
        const value = generateFor("path", config);
        expect(roundTrip("path", { config, value, edited: false })).toEqual({
            config,
        });
    });

    it.each(categories)("%s rejects an empty query", (category) => {
        expect(codecOf(category).read(new URLSearchParams())).toBeNull();
    });

    it("rejects an unknown preset", () => {
        const params = new URLSearchParams("p=shuffled&n=20&r=1-30&s=1");
        expect(codecOf("sort").read(params)).toBeNull();
    });

    it("drops a broken edited map but keeps the config", () => {
        const params = new URLSearchParams("m=maze&w=21&s=a&g=AAAA.0.0");
        expect(codecOf("path").read(params)).toEqual({
            config: { preset: "maze", cols: 21, seed: 10 },
        });
    });

    it("rejects a path link with a fractional width", () => {
        const params = new URLSearchParams("m=maze&w=21.5&s=1");
        expect(codecOf("path").read(params)).toBeNull();
    });

    it("generates a grid even for a fractional width", () => {
        const config = { preset: "maze", cols: 21.5, seed: 1 };
        expect(() => generateFor("path", config as never)).not.toThrow();
    });
});

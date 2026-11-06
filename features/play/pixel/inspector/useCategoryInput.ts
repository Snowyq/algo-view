import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {
    CategoryId,
    ConfigOf,
    ValueOf,
} from "../../../../algorithms/categoryData";
import type { AppDispatch, RootState } from "../../../../store";
import { randomSeed } from "../../../../utils/randoms";
import {
    applyInput,
    getActiveAlgorithms,
    getCanvasWorkerLoading,
} from "../../playSlice";

const RESIZE_DELAY_MS = 250;

/** Config fields holding a number, i.e. the ones a size slider can drive. */
type NumericKey<C extends CategoryId> = {
    [K in keyof ConfigOf<C>]: ConfigOf<C>[K] extends number ? K : never;
}[keyof ConfigOf<C>];

type Options = {
    /** Die face shown before the first roll. */
    face?: number;
    /** Roll a new seed when the size changes, not only on New. */
    reseedOnResize?: boolean;
    /** Size the slider value really produces (grids snap to odd widths). */
    snap?: (size: number) => number;
    /** Only block input while some panel is rendering. */
    busyNeedsPanels?: boolean;
};

type CategoryInput<C extends CategoryId> = {
    config: ConfigOf<C>;
    value: ValueOf<C>;
    busy: boolean;
    /** Slider value, ahead of the config until the debounce applies it. */
    size: number;
    setSize: (size: number) => void;
    face: number;
    /** New input from the current recipe plus `patch`, with a fresh seed. */
    apply: (patch?: Partial<ConfigOf<C>>) => void;
};

type ApplyInputPayload = Parameters<typeof applyInput>[0];

// TS can't match a generic category to its member of the payload union.
function inputPayload<C extends CategoryId>(
    category: C,
    config: ConfigOf<C>
): ApplyInputPayload {
    return { category, config } as ApplyInputPayload;
}

function withSize<C extends CategoryId>(
    config: ConfigOf<C>,
    key: NumericKey<C>,
    size: number
): ConfigOf<C> {
    return { ...config, [key]: size };
}

const identity = (size: number): number => size;

/** State behind a category's input panel: size slider, presets, New die. */
export function useCategoryInput<C extends CategoryId>(
    category: C,
    sizeKey: NumericKey<C>,
    {
        face: initialFace = 5,
        reseedOnResize = false,
        snap = identity,
        busyNeedsPanels = false,
    }: Options = {}
): CategoryInput<C> {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector(
        (state: RootState) => state.play.inputs[category].config
    );
    const value = useSelector(
        (state: RootState) => state.play.inputs[category].value
    );
    const loading = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const panels = useSelector(
        (state: RootState) => getActiveAlgorithms(state).length
    );
    const busy = loading && (!busyNeedsPanels || panels > 0);

    const sizeOf = (c: ConfigOf<C>): number => c[sizeKey] as number;
    const [size, setSize] = useState<number>(sizeOf(config));
    const [face, setFace] = useState<number>(initialFace);

    // Follow outside changes (shared link, G shortcut).
    const [synced, setSynced] = useState<ConfigOf<C>>(config);
    if (synced !== config) {
        setSynced(config);
        setSize(sizeOf(config));
    }

    // A new size applies shortly after the slider settles.
    const resized = snap(size) !== snap(sizeOf(config));
    useEffect(() => {
        if (!resized) return;
        const id = setTimeout(() => {
            const next = withSize(config, sizeKey, size);
            const seeded = reseedOnResize
                ? { ...next, seed: randomSeed() }
                : next;
            dispatch(applyInput(inputPayload(category, seeded)));
        }, RESIZE_DELAY_MS);
        return () => clearTimeout(id);
    }, [resized, size, config, category, sizeKey, reseedOnResize, dispatch]);

    const apply = (patch: Partial<ConfigOf<C>> = {}): void => {
        if (busy) return;
        const seed = randomSeed();
        const next = { ...withSize(config, sizeKey, size), ...patch, seed };
        dispatch(applyInput(inputPayload(category, next)));
        setFace(seed % 6);
    };

    return { config, value, busy, size, setSize, face, apply };
}

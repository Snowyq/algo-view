import { useSyncExternalStore } from "react";
import { createSignal } from "../../externalStore";

/* Visual-only shared state (easter eggs, intro, scrubbing), kept out of Redux. */

export type FxState = {
    /** Konami palette is active. */
    rainbow: boolean;
    /** Time of the last parade request, 0 for none. */
    paradeAt: number;
    /** Intro finished or skipped. */
    introDone: boolean;
    /** The timeline is being dragged. */
    scrubbing: boolean;
    /** Shortcuts overlay is open. */
    helpOpen: boolean;
};

let state: FxState = {
    rainbow: false,
    paradeAt: 0,
    introDone: false,
    scrubbing: false,
    helpOpen: false,
};

const changes = createSignal();

export function setFx(patch: Partial<FxState>): void {
    const next = { ...state, ...patch };
    const changed = (Object.keys(patch) as Array<keyof FxState>).some(
        (key) => next[key] !== state[key]
    );
    if (!changed) return;
    state = next;
    changes.emit();
}

export function getFx(): FxState {
    return state;
}

export function useFx<T>(select: (fx: FxState) => T): T {
    return useSyncExternalStore(
        changes.subscribe,
        () => select(state),
        () => select(state)
    );
}

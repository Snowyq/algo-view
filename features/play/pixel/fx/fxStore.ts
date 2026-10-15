import { useSyncExternalStore } from "react";

/*
 * Purely visual, cross-component state (easter eggs, intro, scrubbing).
 * Kept out of Redux: nothing here changes what the algorithms do.
 */

export type FxState = {
    /** Konami palette is active. */
    rainbow: boolean;
    /** Timestamp of the last parade request (0 = none). */
    paradeAt: number;
    /** The intro has finished (or was skipped); UI may choreograph in. */
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

const listeners = new Set<() => void>();

export function setFx(patch: Partial<FxState>): void {
    const next = { ...state, ...patch };
    const changed = (Object.keys(patch) as Array<keyof FxState>).some(
        (key) => next[key] !== state[key]
    );
    if (!changed) return;
    state = next;
    listeners.forEach((listener) => listener());
}

export function getFx(): FxState {
    return state;
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useFx<T>(select: (fx: FxState) => T): T {
    return useSyncExternalStore(
        subscribe,
        () => select(state),
        () => select(state)
    );
}

import { useSyncExternalStore } from "react";
import { createSignal } from "./externalStore";

/*
 * Code lines of one algorithm where playback pauses. The canvas worker turns
 * them into step numbers and the playback clock stops on each of them.
 */

type BreakpointState = {
    algorithmId: string | null;
    lines: string[];
    /** Steps that run one of the lines, ascending. */
    steps: number[];
};

const EMPTY: BreakpointState = { algorithmId: null, lines: [], steps: [] };
let state: BreakpointState = EMPTY;
const changed = createSignal();
const workers = new Map<string, Worker>();

function set(next: BreakpointState): void {
    state = next;
    changed.emit();
}

function request(): void {
    if (!state.algorithmId || state.lines.length === 0) return;
    workers
        .get(state.algorithmId)
        ?.postMessage({ type: "line-steps", payload: { ids: state.lines } });
}

/** Adds or removes a line; a line of another algorithm starts over. */
export function toggleBreakpoint(algorithmId: string, line: string): void {
    const same = state.algorithmId === algorithmId;
    const lines = same ? state.lines : [];
    const next = lines.includes(line)
        ? lines.filter((id) => id !== line)
        : [...lines, line];
    set(
        next.length === 0
            ? EMPTY
            : { algorithmId, lines: next, steps: same ? state.steps : [] }
    );
    if (next.length === 0) return;
    request();
}

export function clearBreakpoints(algorithmId?: string): void {
    if (algorithmId && state.algorithmId !== algorithmId) return;
    if (state !== EMPTY) set(EMPTY);
}

/** The algorithm's worker answered with the matching steps. */
export function receiveBreakpointSteps(
    algorithmId: string,
    steps: number[]
): void {
    if (state.algorithmId !== algorithmId) return;
    set({ ...state, steps });
}

/** Lets the store ask this algorithm's worker for its line steps. */
export function registerBreakpointWorker(
    id: string,
    worker: Worker
): () => void {
    workers.set(id, worker);
    return () => {
        if (workers.get(id) === worker) workers.delete(id);
    };
}

/** A new run moves the steps, so ask again. */
export function refreshBreakpoints(id: string): void {
    if (state.algorithmId === id) request();
}

export function getBreakpoints(): BreakpointState {
    return state;
}

export const subscribeBreakpoints = changed.subscribe;

export function useBreakpoints(): BreakpointState {
    return useSyncExternalStore(
        subscribeBreakpoints,
        getBreakpoints,
        () => EMPTY
    );
}

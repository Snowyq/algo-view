import { useSyncExternalStore } from "react";

/*
 * Breakpoints: code lines of one algorithm where playback should pause.
 * The lines are picked in the code view; that algorithm's canvas worker
 * turns them into the step numbers that run those lines, and the playback
 * clock stops exactly on each of them. Kept outside Redux: it is UI state
 * shared by three distant places (code view, canvas, clock).
 */

type BreakpointState = {
    algorithmId: string | null;
    lines: string[];
    /** Steps that run one of the lines, ascending. */
    steps: number[];
};

const EMPTY: BreakpointState = { algorithmId: null, lines: [], steps: [] };
let state: BreakpointState = EMPTY;
const listeners = new Set<() => void>();
const workers = new Map<string, Worker>();

function set(next: BreakpointState): void {
    state = next;
    listeners.forEach((listener) => listener());
}

function request(): void {
    if (!state.algorithmId || state.lines.length === 0) return;
    workers
        .get(state.algorithmId)
        ?.postMessage({ type: "line-steps", payload: { ids: state.lines } });
}

/** Click on a line number: add or remove that line. One algorithm at a
    time, so picking a line of another algorithm starts over. */
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

/** Canvas workers register so the store can ask them; a new run (new
    input) asks again, because the steps move. */
export function registerBreakpointWorker(
    id: string,
    worker: Worker
): () => void {
    workers.set(id, worker);
    return () => {
        if (workers.get(id) === worker) workers.delete(id);
    };
}

export function refreshBreakpoints(id: string): void {
    if (state.algorithmId === id) request();
}

export function getBreakpoints(): BreakpointState {
    return state;
}

export function subscribeBreakpoints(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useBreakpoints(): BreakpointState {
    return useSyncExternalStore(
        subscribeBreakpoints,
        getBreakpoints,
        () => EMPTY
    );
}

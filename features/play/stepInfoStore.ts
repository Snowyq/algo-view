import { useCallback, useSyncExternalStore } from "react";
import type { StepInfo } from "./stepLegend";

/*
 * Per-algorithm "where is the code right now", updated on every drawn step.
 * Kept outside Redux on purpose: it changes up to 60×/s per panel, and only
 * the code views of that one algorithm should re-render.
 */

export type CodeHighlight = { ids: string[]; type: string };

export type CodeSnapshot = {
    /** Last step that named a code line; survives initial/finish. */
    highlight: CodeHighlight | null;
    stepType: string | null;
    gaveUp: boolean;
};

const EMPTY: CodeSnapshot = { highlight: null, stepType: null, gaveUp: false };

const snapshots = new Map<string, CodeSnapshot>();
const listeners = new Map<string, Set<() => void>>();

function emit(id: string): void {
    listeners.get(id)?.forEach((listener) => listener());
}

export function publishStepInfo(id: string, info: StepInfo | null): void {
    const prev = snapshots.get(id) ?? EMPTY;
    let highlight = prev.highlight;
    if (!info || info.type === "initial") highlight = null;
    else if (info.instructionId.length > 0)
        highlight = { ids: info.instructionId, type: info.type };

    const stepType = info?.type ?? null;
    if (highlight === prev.highlight && stepType === prev.stepType) return;
    snapshots.set(id, { ...prev, highlight, stepType });
    emit(id);
}

export function publishGaveUp(id: string, gaveUp: boolean): void {
    const prev = snapshots.get(id) ?? EMPTY;
    if (prev.gaveUp === gaveUp) return;
    snapshots.set(id, { ...prev, gaveUp });
    emit(id);
}

export function useCodeSnapshot(id: string): CodeSnapshot {
    const subscribe = useCallback(
        (listener: () => void) => {
            const set = listeners.get(id) ?? new Set<() => void>();
            set.add(listener);
            listeners.set(id, set);
            return () => {
                set.delete(listener);
            };
        },
        [id]
    );
    const getSnapshot = useCallback(() => snapshots.get(id) ?? EMPTY, [id]);
    return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

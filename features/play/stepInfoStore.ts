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

/*
 * Per-algorithm counters at the current step. Same reasoning as above:
 * only the metrics readout should re-render on every drawn step, not the
 * whole panel around the canvas.
 */

type MetricsMap = Record<string, { count: number; name: string }>;

const metricsSnapshots = new Map<string, MetricsMap | null>();
const metricsListeners = new Map<string, Set<() => void>>();

export function publishStepMetrics(
    id: string,
    metrics: MetricsMap | null
): void {
    if (metricsSnapshots.get(id) === metrics) return;
    metricsSnapshots.set(id, metrics);
    metricsListeners.get(id)?.forEach((listener) => listener());
}

export function useStepMetrics(id: string): MetricsMap | null {
    const subscribe = useCallback(
        (listener: () => void) => {
            const set = metricsListeners.get(id) ?? new Set<() => void>();
            set.add(listener);
            metricsListeners.set(id, set);
            return () => {
                set.delete(listener);
            };
        },
        [id]
    );
    const getSnapshot = useCallback(
        () => metricsSnapshots.get(id) ?? null,
        [id]
    );
    return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/*
 * Per-algorithm plain-language caption of the current step ("Compare 23
 * and 9: yes."), worked out in the worker. Only the caption line under
 * each panel listens.
 */

const captions = new Map<string, string>();
const captionListeners = new Map<string, Set<() => void>>();

export function publishCaption(id: string, caption: string): void {
    if (captions.get(id) === caption) return;
    captions.set(id, caption);
    captionListeners.get(id)?.forEach((listener) => listener());
}

export function useCaption(id: string): string {
    const subscribe = useCallback(
        (listener: () => void) => {
            const set = captionListeners.get(id) ?? new Set<() => void>();
            set.add(listener);
            captionListeners.set(id, set);
            return () => {
                set.delete(listener);
            };
        },
        [id]
    );
    const getSnapshot = useCallback(() => captions.get(id) ?? "", [id]);
    return useSyncExternalStore(subscribe, getSnapshot, () => "");
}

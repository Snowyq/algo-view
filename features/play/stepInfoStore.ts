import { createKeyedStore } from "./externalStore";
import type { StepInfo } from "./stepLegend";

/*
 * Per-algorithm state that changes on every drawn step. Kept out of Redux
 * so only the few views of that one algorithm re-render, not the panel.
 */

type CodeHighlight = { ids: string[]; type: string };

export type CodeSnapshot = {
    /** Last step that named a code line; survives initial/finish. */
    highlight: CodeHighlight | null;
    stepType: string | null;
    gaveUp: boolean;
};

type MetricsMap = Record<string, { count: number; name: string }>;

const EMPTY: CodeSnapshot = { highlight: null, stepType: null, gaveUp: false };

const code = createKeyedStore<CodeSnapshot>(EMPTY);
const metrics = createKeyedStore<MetricsMap | null>(null);
const captions = createKeyedStore<string>("");

export function publishStepInfo(id: string, info: StepInfo | null): void {
    const prev = code.get(id);
    let highlight = prev.highlight;
    if (!info || info.type === "initial") highlight = null;
    else if (info.instructionId.length > 0)
        highlight = { ids: info.instructionId, type: info.type };

    const stepType = info?.type ?? null;
    if (highlight === prev.highlight && stepType === prev.stepType) return;
    code.set(id, { ...prev, highlight, stepType });
}

export function publishGaveUp(id: string, gaveUp: boolean): void {
    const prev = code.get(id);
    if (prev.gaveUp === gaveUp) return;
    code.set(id, { ...prev, gaveUp });
}

export function publishStepMetrics(id: string, next: MetricsMap | null): void {
    if (metrics.get(id) !== next) metrics.set(id, next);
}

/** Plain-language caption of the current step, worked out in the worker. */
export function publishCaption(id: string, caption: string): void {
    if (captions.get(id) !== caption) captions.set(id, caption);
}

export const useCodeSnapshot = code.useValue;
export const useStepMetrics = metrics.useValue;
export const useCaption = captions.useValue;

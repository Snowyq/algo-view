import { clamp } from "../../utils/values";
import { Algorithm, type CompareOperator } from "../Algorithm";
import { CacheManager } from "../CacheManager";
import { copyMetrics } from "../RecordedAlgorithm";
import type { StepAlgorithm, StepMetrics } from "../types";

export type SortStepType =
    | "initial"
    | "check"
    | "check-true"
    | "check-false"
    | "check-value"
    | "check-value-true"
    | "check-value-false"
    | "swap"
    | "copy"
    | "copy-from"
    | "copy-to"
    | "select"
    | "finish"
    | "assign";

type SortSelection = { id?: string; index: number };

type SortStepInput = {
    type: SortStepType;
    activeItems: number[];
    instructionId?: string[];
    /** Set on steps that change the array. */
    operationId?: number;
    /** Last operation before this step, for steps that don't change it. */
    prevOperationId?: number;
    operator?: CompareOperator;
    payload?: number;
};

type SortStep = SortStepInput & {
    metrics?: StepMetrics;
    selected?: SortSelection[];
};

type SortOperation = {
    type: "swap" | "assign" | "copy" | string;
    elements: number[];
    payload?: number;
};

type SortOptions = {
    stepTypes?: SortStepType[];
} & Record<string, unknown>;

type SelectOptions = {
    /** "perm" keeps the selection on every following step, under `id`. */
    mode?: "perm";
    id?: string;
    instructionId?: string[];
};

type SelectManyItem = {
    index: number;
    options?: SelectOptions;
};

export const sortStepTypes: SortStepType[] = [
    "initial",
    "check",
    "check-true",
    "check-false",
    "check-value",
    "check-value-true",
    "check-value-false",
    "swap",
    "copy",
    "copy-from",
    "copy-to",
    "select",
    "finish",
    "assign",
];

/*
 * Base for the sorting algorithms. sort() works on a copy of the input and
 * records steps through check / swap / assign / copy / select. Changes to
 * the array are also kept as operations, so any step's array can be rebuilt
 * from a cached state.
 */
export abstract class SortAlgorithm
    extends Algorithm
    implements StepAlgorithm<SortStep, number[]>
{
    cacheManager: CacheManager<number[], SortOperation>;
    array: number[];
    steps: SortStep[] = [];
    operations: SortOperation[] = [];
    /** Kept selections (pivot, current min...), copied into every step. */
    selected: SortSelection[] = [];
    minValue: number;
    maxValue: number;
    options: SortOptions;
    /** Step types to record; the rest are skipped. */
    enabledStepTypes: SortStepType[];
    metrics: StepMetrics = {};

    constructor(array: number[], options: SortOptions = {}) {
        super();
        this.array = array;
        this.options = options;
        this.cacheManager = new CacheManager<number[], SortOperation>(
            this.cache
        );
        const { stepTypes } = options;
        this.enabledStepTypes = (
            Array.isArray(stepTypes) ? stepTypes : sortStepTypes
        ).slice();
        this.minValue = Math.min(...array);
        this.maxValue = Math.max(...array);
        this.createSteps();
    }

    abstract sort(arr: number[]): void;

    // ---------- Recording ----------

    private createSteps(): void {
        const arr = this.getArray();
        this.createStep({ type: "initial", activeItems: [] });
        this.sort(arr);
        this.createStep({
            type: "finish",
            activeItems: arr.map((_, i) => i),
        });
        this.cacheManager
            .initGroup("state")
            .createPersistentCache(
                "state",
                this.getArray(),
                this.operations.slice(),
                this.makeOperation
            );
    }

    createStep(step: SortStepInput): void {
        if (!this.enabledStepTypes.includes(step.type)) return;
        if (typeof step.operationId !== "number" && this.operations.length) {
            step.prevOperationId = this.operations.length - 1;
        }
        this.steps.push({
            ...step,
            metrics: copyMetrics(this.metrics),
            selected: this.selected.slice(),
        });
    }

    // ---------- Operations ----------

    createOperation(
        type: SortOperation["type"],
        elements: number[],
        payload?: number
    ): number {
        this.operations.push({ type, elements, payload });
        return this.operations.length - 1;
    }

    makeOperation(operation: SortOperation, state: number[]): void {
        const { type, elements, payload } = operation;
        if (type === "swap") {
            const [a, b] = elements;
            [state[a], state[b]] = [state[b], state[a]];
        }
        if (type === "assign" && typeof payload === "number") {
            state[elements[0]] = payload;
        }
        if (type === "copy") {
            const [target, source] = elements;
            state[target] = state[source];
        }
    }

    /** Records the operation, applies it to `arr` and returns its id. */
    private applyOperation(
        type: SortOperation["type"],
        elements: number[],
        arr: number[],
        payload?: number
    ): number {
        const operationId = this.createOperation(type, elements, payload);
        this.makeOperation(this.operations[operationId], arr);
        return operationId;
    }

    // ---------- Metrics ----------

    countArrayAccess(count: number = 1): void {
        this.count("arrayAccess", "Reads", count);
    }

    countConditionChecks(count: number = 1): void {
        this.count("conditionChecks", "Checks", count);
    }

    countRecursiveCalls(count: number = 1): void {
        this.count("recursiveCalls", "Recursions", count);
    }

    count(id: string, name: string = id, count: number = 1): void {
        if (id in this.metrics) this.metrics[id].count += count;
        else this.metrics[id] = { count, name };
    }

    getMetrics(): StepMetrics {
        return this.metrics;
    }

    // ---------- Replay API (used by the canvas worker) ----------

    getArray(): number[] {
        return this.array.slice();
    }

    getArrayMinMax(): { min: number; max: number } {
        return { min: this.minValue, max: this.maxValue };
    }

    getStepByIndex(index: number): SortStep | undefined {
        return this.steps[clamp(index, 0, this.steps.length - 1)];
    }

    getStateByStepsIndex(stepIndex: number): number[] {
        const operationId = this.getOperationIdByStepIndex(stepIndex);
        return this.getStateByOperationId(operationId);
    }

    getOperationIdByStepIndex(index: number): number | undefined {
        if (this.steps.length === 0) return;
        const stepIndex = clamp(index, 0, this.steps.length - 1);
        const { prevOperationId } = this.steps[stepIndex];
        if (typeof prevOperationId === "number") return prevOperationId;
        for (let i = stepIndex; i > 0; i--) {
            const { operationId } = this.steps[i];
            if (typeof operationId === "number" && !isNaN(operationId)) {
                return operationId;
            }
        }
    }

    /** Array after an operation, replayed from the nearest earlier cache. */
    getStateByOperationId(operationId?: number): number[] {
        if (typeof operationId !== "number" || isNaN(operationId)) {
            return this.getArray();
        }
        // copy and assign can't be undone, so only replay forward
        const cached = this.cacheManager.getAtOrBefore("state", operationId);
        const state = cached ? cached.item.slice() : this.getArray();
        for (let id = (cached?.key ?? -1) + 1; id <= operationId; id++) {
            this.makeOperation(this.operations[id], state);
        }
        return state;
    }

    // ---------- Step helpers for sort() ----------

    assign(
        targetIndex: number,
        item: number,
        arr: number[],
        options?: SelectOptions
    ): void {
        this.count("assign", "Inserts");
        const activeItems = [targetIndex];
        const operationId = this.applyOperation(
            "assign",
            activeItems,
            arr,
            item
        );
        this.createStep({
            type: "assign",
            activeItems,
            instructionId: options?.instructionId,
            operationId,
        });
    }

    /** arr[targetIndex] = arr[copiedIndex], as two steps: from, then to. */
    copy(
        targetIndex: number,
        copiedIndex: number,
        arr: number[],
        options?: SelectOptions
    ): void {
        const instructionId = options?.instructionId;
        this.count("copy", "Shifts");
        this.createStep({
            type: "copy",
            activeItems: [copiedIndex],
            instructionId,
        });
        const operationId = this.applyOperation(
            "copy",
            [targetIndex, copiedIndex],
            arr,
            arr[copiedIndex]
        );
        this.createStep({
            type: "copy-to",
            activeItems: [targetIndex],
            instructionId,
            operationId,
        });
    }

    swap(
        index1: number,
        index2: number,
        arr: number[],
        options?: SelectOptions
    ): void {
        this.count("swap", "Swaps");
        const activeItems = [index1, index2];
        const operationId = this.applyOperation("swap", activeItems, arr);
        this.createStep({
            type: "swap",
            activeItems,
            operationId,
            instructionId: options?.instructionId,
        });
    }

    /** Compares arr[index] with a value: a check step, then its outcome. */
    checkWithValue(
        index: number,
        operator: CompareOperator,
        value: number,
        arr: number[],
        options?: SelectOptions
    ): boolean {
        const activeItems = [index];
        const instructionId = options?.instructionId;
        this.createStep({
            type: "check-value",
            activeItems,
            operator,
            payload: value,
            instructionId,
        });
        const result = this.compare(arr[index], value, operator);
        this.createStep({
            type: result ? "check-value-true" : "check-value-false",
            activeItems,
            payload: value,
            instructionId,
        });
        return result;
    }

    /** Compares two items (two reads): a check step, then its outcome. */
    check(
        index1: number,
        operator: CompareOperator,
        index2: number,
        arr: number[],
        options?: SelectOptions
    ): boolean {
        const activeItems = [index1, index2];
        const instructionId = options?.instructionId;
        this.countArrayAccess(2);
        this.createStep({
            type: "check",
            activeItems,
            operator,
            instructionId,
        });
        const result = this.compare(arr[index1], arr[index2], operator);
        this.createStep({
            type: result ? "check-true" : "check-false",
            activeItems,
            instructionId,
        });
        return result;
    }

    select(index: number, options?: SelectOptions): void {
        this.keepSelected(index, options);
        this.createStep({
            type: "select",
            activeItems: [index],
            instructionId: options?.instructionId,
        });
    }

    /** Several selections recorded as one step. */
    selectMany(selects: SelectManyItem[]): void {
        selects.forEach(({ index, options }) =>
            this.keepSelected(index, options)
        );
        const instructionIds = selects.flatMap(
            ({ options }) => options?.instructionId ?? []
        );
        this.createStep({
            type: "select",
            activeItems: selects.map(({ index }) => index),
            instructionId: [...new Set(instructionIds)],
        });
    }

    unSelect(id: string): void {
        this.selected = this.selected.filter((item) => item.id !== id);
    }

    private keepSelected(index: number, options?: SelectOptions): void {
        if (options?.mode !== "perm" || !options.id) return;
        this.unSelect(options.id);
        this.selected.push({ id: options.id, index });
    }
}

import { clamp } from "../../utils/values";
import { Algorithm, type CompareOperator } from "../Algorithm";
import { CacheManager } from "../CacheManager";
import type { AlgorithmInstructions } from "../types";

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

type SortMetric = { count: number; name: string };
type SortMetrics = Record<string, SortMetric>;
type SortMetricItem = { id: string; name: string };

type SortSelection = { id?: string; index: number };

type SortStepBase = {
    type: SortStepType;
    activeItems: number[];
    instructionId?: string[];
    operationId?: number;
    prevOperationId?: number;
    operator?: CompareOperator;
    payload?: number;
};

type SortStep = SortStepBase & {
    metrics?: SortMetrics;
    selected?: SortSelection[];
};

type SortStepInput = SortStepBase;

type SortOperation = {
    type: "swap" | "assign" | "copy" | string;
    elements: number[];
    payload?: number;
};

type SortOptions = {
    stepTypes?: SortStepType[];
} & Record<string, unknown>;

type SortStepTypesConfig = {
    enabled: SortStepType[];
    available: SortStepType[];
};

type SortSelectOptions = {
    mode?: "perm";
    id?: string;
    instructionId?: string[];
};

type SortSelectManyItem = {
    index: number;
    options?: SortSelectOptions;
};

type SortUseData = {
    steps: SortStep[];
    operations: SortOperation[];
    array: number[];
    minValue: number;
    maxValue: number;
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

// Class

export class SortAlgorithm extends Algorithm {
    // support instances
    cacheManager!: CacheManager<number[], SortOperation>;
    //

    // state
    array: number[] = []; //					input
    steps: SortStep[] = []; // 					algorithm steps
    operations: SortOperation[] = []; //				operations (mutates array)
    selected: SortSelection[] = []; //				select item between steps - managed by select
    //								options params
    direction: "asc" | "desc" | undefined = undefined;
    minValue: number = Number.NaN;
    maxValue: number = Number.NaN;

    // config
    options: SortOptions = {
        stepTypes: undefined,
    };
    stepTypes: SortStepTypesConfig = {
        enabled: [],
        available: [],
    };
    //

    // metrics
    shouldCountSubArrays: boolean = false;
    shouldCountArrayAccess: boolean = false;
    metrics: SortMetrics = {};
    metricsItemList: SortMetricItem[] = [];
    //

    constructor(array: number[], options: SortOptions = {}) {
        super();
        this.array = array;
        this.options = options;
        this.init();
    }

    /**
     * init
     * @param {object} options
     * set enabled step types (if not provided - all enabled)
     * create sort steps only by selected step types
     */
    init(): void {
        this.mountCache();
        this.applyOptions();
        this.prepareArray();
        this.createSteps();
    }

    /**
     * reset
     * algorithm states are reset
     */
    reset(options?: SortOptions): void {
        this.selected = [];
        this.operations = [];
        this.steps = [];
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    update(array: number[], options?: SortOptions): void {
        this.array = array;
        this.reset(options);
        this.init();
    }

    prepareArray(): void {
        this.#calcArrayMinMax();
    }

    applyOptions(): void {
        const { stepTypes } = this.options;
        this.setEnabledStepTypes(stepTypes);
    }

    mountCache(): void {
        this.cacheManager = new CacheManager<number[], SortOperation>(
            this.cache
        );
    }

    use(): SortUseData {
        return {
            steps: this.getSteps(),
            operations: this.getOperations(),
            array: this.getArray(),
            minValue: this.getArrayMinMax().min,
            maxValue: this.getArrayMinMax().max,
        };
    }

    data(): SortUseData {
        return this.use();
    }

    // Steps creation

    createSteps(): void {
        const dir = this.direction;
        const arr = this.getArray();

        this.createStep({
            type: "initial",
            activeItems: [],
        });

        this.sort(arr, dir);

        this.createStep({
            type: "finish",
            activeItems: Array.from({ length: arr.length }, (_, i) => i),
        });

        this.cacheManager
            .initGroup("state")
            .createPersistentCache(
                "state",
                this.getArray(),
                this.getOperations(),
                this.makeOperation
            );
    }

    createStep(step: SortStepInput): void {
        this.addStepTypeToAvailableTypes(step.type);
        if (!this.isStepTypeEnabled(step.type)) return;
        this.assignPrevOperationIdToStep(step);

        const metrics = this.createStepMetrics();

        // finally destructure step into steps creating new object
        this.steps.push({
            ...step,
            metrics,
            selected: this.selected.slice(),
        });
    }

    createStepMetrics(): SortMetrics {
        const metrics: SortMetrics = {};
        for (const key in this.metrics) {
            metrics[key] = {
                count: this.metrics[key].count,
                name: this.metrics[key].name,
            };
        }

        return metrics;
    }

    // Handling step types

    setEnabledStepTypes(
        types?: SortStepType[],
        shouldReset: boolean = false
    ): void {
        if (Array.isArray(types)) {
            this.stepTypes.enabled = types.slice();
        } else {
            this.stepTypes.enabled = sortStepTypes.slice();
        }

        if (shouldReset) {
            this.reset();
        }
    }

    addStepTypeToAvailableTypes(type: SortStepType): void {
        if (!this.stepTypes.available.includes(type)) {
            this.stepTypes.available.push(type);
        }
    }

    isStepTypeEnabled(type: SortStepType): boolean {
        return this.stepTypes.enabled.includes(type);
    }

    assignPrevOperationIdToStep(step: SortStepInput): void {
        if (typeof step.operationId !== "number") {
            if (this.operations.length > 0) {
                step.prevOperationId = this.operations.length - 1;
            }
        }
    }

    // Operations

    createOperation(
        type: SortOperation["type"],
        elements: number[],
        payload?: number
    ): number {
        this.operations.push({ type, elements, payload });
        return this.operations.length - 1;
    }

    makeOperation(operation: SortOperation, state: number[]): void {
        if (operation.type === "swap") {
            const [index1, index2] = operation.elements;
            [state[index1], state[index2]] = [state[index2], state[index1]];
        }
        if (operation.type === "assign") {
            const [targetIndex] = operation.elements;
            if (typeof operation.payload === "number") {
                state[targetIndex] = operation.payload;
            }
        }

        if (operation.type === "copy") {
            const [targetIndex, copiedIndex] = operation.elements;
            state[targetIndex] = state[copiedIndex];
        }
    }

    // Metrics

    countArrayAccess(count: number = 1): void {
        this.count("arrayAccess", "Reads", count);
    }

    countSubArrays(count: number = 1): void {
        void count;
        // this.count("subArrays", "SubArrays", count);
    }

    countConditionChecks(count: number = 1): void {
        this.count("conditionChecks", "Checks", count);
    }

    countRecursiveCalls(count: number = 1): void {
        this.count("recursiveCalls", "Recursions", count);
    }

    count(id: string, name?: string, count: number = 1): void {
        if (!(id in this.metrics)) {
            const resolvedName = name ?? id;
            this.metrics[id] = { count, name: resolvedName };
            this.metricsItemList.push({ id, name: resolvedName });
        } else {
            this.metrics[id].count = this.metrics[id].count + count;
        }
    }

    getMetrics(): SortMetrics {
        return this.metrics;
    }

    getMetricsItems(): SortMetricItem[] {
        return this.metricsItemList;
    }

    // Querying algorithm states

    getSteps(): SortStep[] {
        return this.steps.slice();
    }

    getOperations(): SortOperation[] {
        return this.operations.slice();
    }

    getArrayLength(): number {
        return this.array.length;
    }

    getArray(): number[] {
        return this.array.slice();
    }

    getArrayMinMax(): { min: number; max: number } {
        if (isNaN(this.minValue) || isNaN(this.maxValue)) {
            this.#calcArrayMinMax();
        }
        return { min: this.minValue, max: this.maxValue };
    }

    // Query by

    getStateByOperationId(operationId?: number): number[] {
        let state = this.getArray();
        let stateId = 0;
        if (typeof operationId !== "number" || isNaN(operationId)) return state;
        const operations = this.getOperations();

        // Restore state by prev operationId and calculate state from that
        const closestState = this.cacheManager.getClosest("state", operationId);
        if (closestState) {
            state = closestState.item.slice();
            stateId = closestState.key;
        }
        if (stateId === operationId) return state;

        if (stateId > operationId) {
            let counter = stateId + 1;
            while (counter - 1 > operationId) {
                counter--;
                const operation = operations[counter];
                this.makeOperation(operation, state);
            }
        } else if (stateId < operationId) {
            let counter = stateId;
            while (counter < operationId) {
                counter++;
                const operation = operations[counter];
                this.makeOperation(operation, state);
            }
        }
        return state;
    }

    getStateByStepsIndex(stepIndex: number): number[] {
        const operationId = this.getOperationIdByStepIndex(stepIndex);
        const state = this.getStateByOperationId(operationId);
        return state;
    }

    getOperationIdByStepIndex(index: number): number | undefined {
        const steps = this.getSteps();
        if (!steps || steps.length === 0) return;
        const stepIndex = clamp(index, 0, steps.length - 1);

        if (typeof steps[stepIndex].prevOperationId === "number") {
            return steps[stepIndex].prevOperationId;
        }

        for (let i = stepIndex; i > 0; i--) {
            const step = steps[i];
            if (
                typeof step.operationId === "number" &&
                !Number.isNaN(step.operationId)
            ) {
                return step.operationId;
            }
        }
    }

    getStepByIndex(index: number): SortStep | undefined {
        const steps = this.getSteps();
        const stepIndex = clamp(index, 0, steps.length - 1);
        const step = steps[stepIndex];
        return step;
    }

    // Utils

    #calcArrayMinMax(): void {
        const arr = this.getArray();
        this.minValue = Math.min(...arr);
        this.maxValue = Math.max(...arr);
    }

    // To implement in child instance

    sort(...args: unknown[]): void {
        void args;
    }
    static getInstructions(): AlgorithmInstructions | undefined {
        return undefined;
    }

    // Step types

    // assign

    assign(
        targetIndex: number,
        item: number,
        arr: number[],
        options?: SortSelectOptions
    ): void {
        // operation details
        const type = "assign";
        const instructionId = options?.instructionId;
        const payload = item;
        const activeItems = [targetIndex];

        this.count(type, "Inserts");

        // Creates and executes an operation. Saves its id and assigns it to step
        const operationId = this.createOperation(type, activeItems, payload);
        this.makeOperation({ type, elements: [targetIndex], payload }, arr);

        // creates step
        this.createStep({
            type,
            activeItems,
            instructionId,
            operationId,
        });
    }

    // copy

    copy(
        targetIndex: number,
        copiedIndex: number,
        arr: number[],
        options?: SortSelectOptions
    ): void {
        // operation details
        const type = "copy";
        const instructionId = options?.instructionId;
        const payload = arr[copiedIndex];
        const activeItems = [targetIndex, copiedIndex];

        this.count(type, "copies");

        this.createStep({
            type: "copy",
            activeItems,
            instructionId,
        });

        // Creates and executes an operation. Saves its id and assigns it to step
        const operationId = this.createOperation(type, activeItems, payload);
        this.makeOperation({ type, elements: activeItems }, arr);

        this.createStep({
            type: "copy-to",
            activeItems,
            instructionId,
            operationId,
        });
    }

    // swap

    swap(
        index1: number,
        index2: number,
        arr: number[],
        options?: SortSelectOptions
    ): void {
        // Operation Details
        const type = "swap";
        const activeItems = [index1, index2];
        const instructionId = options?.instructionId;

        this.count(type, "Swaps");

        // saves and executes operation
        const operationId = this.createOperation(type, activeItems);
        this.makeOperation({ type, elements: activeItems }, arr);

        // creates step and binding operation id with it
        this.createStep({
            type,
            activeItems,
            operationId,
            instructionId,
        });
    }

    // check against value

    checkWithValue(
        index: number,
        operator: CompareOperator,
        value: number,
        arr: number[],
        options?: SortSelectOptions
    ): boolean {
        // Operation Details
        const type = "check-value";
        const activeItems = [index];
        const payload = value;
        const instructionId = options?.instructionId;

        // creates check step
        this.createStep({
            type,
            activeItems,
            operator,
            payload,
            instructionId,
        });

        // creates additional step based on result of comparison
        const result = this.compare(arr[index], value, operator);

        if (result) {
            this.createStep({
                type: "check-value-true",
                activeItems,
                payload,
                instructionId,
            });
        } else {
            this.createStep({
                type: "check-value-false",
                activeItems,
                payload,
                instructionId,
            });
        }

        // return result for easier sort method creation
        return result;
    }

    // check

    check(
        index1: number,
        operator: CompareOperator,
        index2: number,
        arr: number[],
        options?: SortSelectOptions
    ): boolean {
        // Operation Details
        const type = "check";
        const activeItems = [index1, index2];
        const instructionId = options?.instructionId;

        // creates check step
        this.createStep({
            type,
            activeItems,
            operator,
            instructionId,
        });

        // creates additional step based on result of comparison
        const result = this.compare(arr[index1], arr[index2], operator);

        if (result) {
            this.createStep({ type: "check-true", activeItems, instructionId });
        } else {
            this.createStep({
                type: "check-false",
                activeItems,
                instructionId,
            });
        }

        // return result for easier sort method creation
        return result;
    }

    // select

    select(index: number, options?: SortSelectOptions): void {
        // Operation details
        const type = "select";
        const activeItems = [index];

        // handles perm selection
        if (options?.mode === "perm" && options.id) {
            this.selected = this.selected.filter((el) => el.id !== options.id);
            this.selected.push({ id: options.id, index });
        }

        // creates step
        this.createStep({ type, activeItems });
    }

    unSelect(id: string): void {
        this.selected = this.selected.filter((el) => el.id !== id);
    }

    selectMany(selects: SortSelectManyItem[]): void {
        selects.forEach((sel) => {
            const options = sel.options;
            if (options?.mode === "perm" && options.id) {
                this.selected = this.selected.filter(
                    (el) => el.id !== options.id
                );
                this.selected.push({ id: options.id, index: sel.index });
            }
        });
        this.createStep({
            type: "select",
            activeItems: selects.map((sel) => sel.index),
            instructionId: [
                ...new Set(
                    selects
                        .map((sel) => sel.options?.instructionId ?? [])
                        .flat()
                ),
            ],
        });
    }
}

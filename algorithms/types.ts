import type { Algorithm } from "./Algorithm";

export type AlgorithmInstruction = {
    line: string;
    indent: number;
};

export type AlgorithmInstructions = Record<string, AlgorithmInstruction>;

export type AlgorithmGroup = "classic" | "fun";

export type AlgorithmMeta = {
    name: string;
    description: string;
    /** Average-case time. */
    timeComplexity: string;
    bestCase: string;
    worstCase: string;
    auxiliarySpace: string;
    /** Equal values keep their relative order (as implemented here). */
    stable: boolean;
    /** Sorts within the input array, without a second array of size n. */
    inPlace: boolean;
    group?: AlgorithmGroup;
};

export type AlgorithmMetric = {
    count: number;
    name: string;
};

export type AlgorithmMetrics = Record<string, AlgorithmMetric>;

export type AlgorithmConstructor<T extends Algorithm = Algorithm> = new (
    ...args: unknown[]
) => T;

export type AlgorithmRegistryItem = {
    id: string;
    meta: AlgorithmMeta;
    algorithm: {
        Class: AlgorithmConstructor;
        instructions?: AlgorithmInstructions;
    };
};

export type AlgorithmCategory = {
    name: string;
    id: string;
    items: AlgorithmRegistryItem[];
};

export type AlgorithmsRegistry = {
    data: AlgorithmCategory[];
    categoriesLog: string[];
};

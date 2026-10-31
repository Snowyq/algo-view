export type CompareOperator =
    | ">"
    | "<"
    | ">="
    | "<="
    | "=="
    | "==="
    | "!="
    | "!==";

type AlgorithmOperation = {
    type?: string;
    elements?: number[];
    payload?: unknown;
    [key: string]: unknown;
};

type AlgorithmStep = {
    type?: string;
    [key: string]: unknown;
};

/** Storage handed to CacheManager (sorts only). */
type AlgorithmCache = {
    groups: string[];
    [key: string]: unknown;
};

export class Algorithm {
    steps: AlgorithmStep[] = [];
    operations: AlgorithmOperation[] = [];
    options: Record<string, unknown> = {};
    cache: AlgorithmCache = { groups: [] };

    getSteps(): AlgorithmStep[] {
        return this.steps.slice();
    }

    getStepsLength(): number {
        return this.steps.length;
    }

    getOperations(): AlgorithmOperation[] {
        return this.operations.slice();
    }

    makeOperation(operation: unknown, state: unknown): void {
        void operation;
        void state;
    }

    compare(a: number, b: number, operator: CompareOperator): boolean {
        switch (operator) {
            case ">":
                return a > b;
            case "<":
                return a < b;
            case ">=":
                return a >= b;
            case "<=":
                return a <= b;
            case "==":
                return a == b;
            case "===":
                return a === b;
            case "!=":
                return a != b;
            case "!==":
                return a !== b;
            default:
                throw new Error(`wrong operator: ${operator}`);
        }
    }
}

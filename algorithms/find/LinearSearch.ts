import type { AlgorithmInstructions } from "../types";
import { FindAlgorithm } from "./FindAlgorithm";

// Checks every element in order. Needs no sorting.
export class LinearSearch extends FindAlgorithm {
    search(): void {
        for (let i = 0; i < this.values.length; i += 1) {
            if (this.probe(i, { instructionId: ["l1"] }) === 0) {
                this.found(i, { instructionId: ["l2"] });
                return;
            }
            this.narrow(i + 1, this.values.length - 1, {
                instructionId: ["l0"],
            });
        }
        this.miss({ instructionId: ["l3"] });
    }

    static getInstructions(): AlgorithmInstructions {
        return {
            l0: { line: "for (let i = 0; i < arr.length; i++) {", indent: 0 },
            l1: { line: "if (arr[i] === target)", indent: 1 },
            l2: { line: "return i;", indent: 2 },
            le0: { line: "}", indent: 0 },
            l3: { line: "return -1;", indent: 0 },
        };
    }
}

import { BubbleSort } from "./sort/BubbleSort";
import { InsertionSort } from "./sort/InsertionSort";
import { MergeSort } from "./sort/MergeSort";
import { SelectionSort } from "./sort/SelectionSort";
import { ShellSort } from "./sort/ShellSort";
import type {
    AlgorithmCategory,
    AlgorithmConstructor,
    AlgorithmsRegistry,
} from "./types";

const data: AlgorithmCategory[] = [
    {
        name: "Sort",
        id: "sort",
        items: [
            {
                id: "bubbleSort",
                meta: {
                    name: "Bubble",
                    description: "...",
                    timeComplexity: "O(n^2)",
                    auxiliarySpace: "O(1)",
                },
                algorithm: {
                    Class: BubbleSort as AlgorithmConstructor,
                    instructions: BubbleSort.getInstructions(),
                },
            },
            {
                id: "selectionSort",
                meta: {
                    name: "Selection",
                    description: "...",
                    timeComplexity: "O(n^2)",
                    auxiliarySpace: "O(1)",
                },
                algorithm: {
                    Class: SelectionSort as AlgorithmConstructor,
                    instructions: SelectionSort.getInstructions(),
                },
            },
            {
                id: "mergeSort",
                meta: {
                    name: "Merge",
                    description: "...",
                    timeComplexity: "O(n log n)",
                    auxiliarySpace: "O(n)",
                },
                algorithm: {
                    Class: MergeSort as AlgorithmConstructor,
                    instructions: MergeSort.getInstructions(),
                },
            },
            {
                id: "insertionSort",
                meta: {
                    name: "Insertion",
                    description: "...",
                    timeComplexity: "O(n^2)",
                    auxiliarySpace: "O(1)",
                },
                algorithm: {
                    Class: InsertionSort as AlgorithmConstructor,
                    instructions: InsertionSort.getInstructions(),
                },
            },
            {
                id: "shellSort",
                meta: {
                    name: "Shell",
                    description: "...",
                    timeComplexity: "O(n^2)",
                    auxiliarySpace: "O(1)",
                },
                algorithm: {
                    Class: ShellSort as AlgorithmConstructor,
                    instructions: ShellSort.getInstructions(),
                },
            },
        ],
    },
    { name: "Path Finding", id: "path", items: [] },
    { name: "Find", id: "find", items: [] },
];

export const registry: AlgorithmsRegistry = {
    data,
    categoriesLog: data.map((item) => item.id),
};

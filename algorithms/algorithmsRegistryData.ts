import { BubbleSort } from "./sort/BubbleSort";
import { QuickSort } from "./sort/QuickSort";
import { HeapSort } from "./sort/HeapSort";
import { CocktailShakerSort } from "./sort/CocktailShakerSort";
import { CombSort } from "./sort/CombSort";
import { GnomeSort } from "./sort/GnomeSort";
import { OddEvenSort } from "./sort/OddEvenSort";
import { PancakeSort } from "./sort/PancakeSort";
import { RadixSort } from "./sort/RadixSort";
import { BogoSort } from "./sort/BogoSort";
import { BozoSort } from "./sort/BozoSort";
import { StoogeSort } from "./sort/StoogeSort";
import { SlowSort } from "./sort/SlowSort";
import { SleepSort } from "./sort/SleepSort";
import { MiracleSort } from "./sort/MiracleSort";
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
                    description:
                        "Swaps neighbours that are out of order; each pass bubbles the largest value to the end. This version always runs every pass.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
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
                    description:
                        "Finds the smallest remaining value and swaps it into place, one position at a time.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
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
                    description:
                        "Splits the array in halves, sorts each, then merges them. Ties take the right-hand value, so equal items can swap order.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(n)",
                    stable: false,
                    inPlace: false,
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
                    description:
                        "Takes each value and shifts larger ones right until it fits into the sorted prefix.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
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
                    description:
                        "Insertion sort over shrinking gaps (n/2, n/4, …, 1), so values travel far early on.",
                    timeComplexity: "O(n^1.5)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                },
                algorithm: {
                    Class: ShellSort as AlgorithmConstructor,
                    instructions: ShellSort.getInstructions(),
                },
            },
            {
                id: "quickSort",
                meta: {
                    name: "Quick",
                    description:
                        "Partitions around the last value as pivot, then sorts each side. Already sorted input is its worst case.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(log n)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: QuickSort as AlgorithmConstructor,
                    instructions: QuickSort.getInstructions(),
                },
            },
            {
                id: "heapSort",
                meta: {
                    name: "Heap",
                    description:
                        "Builds a max-heap and pops the largest item to the end.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: HeapSort as AlgorithmConstructor,
                    instructions: HeapSort.getInstructions(),
                },
            },
            {
                id: "cocktailShakerSort",
                meta: {
                    name: "Cocktail",
                    description:
                        "Bubble sort that sweeps in both directions and stops early once a pass makes no swaps.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: CocktailShakerSort as AlgorithmConstructor,
                    instructions: CocktailShakerSort.getInstructions(),
                },
            },
            {
                id: "combSort",
                meta: {
                    name: "Comb",
                    description:
                        "Bubble sort with a gap that shrinks by 1.3, so small values near the end move quickly.",
                    timeComplexity: "O(n²/2^p)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: CombSort as AlgorithmConstructor,
                    instructions: CombSort.getInstructions(),
                },
            },
            {
                id: "gnomeSort",
                meta: {
                    name: "Gnome",
                    description:
                        "Steps forward when in order, swaps and steps back when not.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: GnomeSort as AlgorithmConstructor,
                    instructions: GnomeSort.getInstructions(),
                },
            },
            {
                id: "oddEvenSort",
                meta: {
                    name: "Odd-Even",
                    description:
                        "Alternates comparing odd and even neighbour pairs until a full round makes no swaps.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: OddEvenSort as AlgorithmConstructor,
                    instructions: OddEvenSort.getInstructions(),
                },
            },
            {
                id: "pancakeSort",
                meta: {
                    name: "Pancake",
                    description:
                        "Flips prefixes to bring the largest remaining item to the end.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: PancakeSort as AlgorithmConstructor,
                    instructions: PancakeSort.getInstructions(),
                },
            },
            {
                id: "radixSort",
                meta: {
                    name: "Radix",
                    description:
                        "Distributes values into ten digit buckets, least significant digit first. Never compares two values.",
                    timeComplexity: "O(d·(n + b))",
                    bestCase: "O(d·(n + b))",
                    worstCase: "O(d·(n + b))",
                    auxiliarySpace: "O(n + b)",
                    stable: true,
                    inPlace: false,
                    group: "classic",
                },
                algorithm: {
                    Class: RadixSort as AlgorithmConstructor,
                    instructions: RadixSort.getInstructions(),
                },
            },
            {
                id: "bogoSort",
                meta: {
                    name: "Bogo",
                    description:
                        "Shuffles until sorted. Gives up after 25,000 steps.",
                    timeComplexity: "O(n·n!)",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: BogoSort as AlgorithmConstructor,
                    instructions: BogoSort.getInstructions(),
                },
            },
            {
                id: "bozoSort",
                meta: {
                    name: "Bozo",
                    description:
                        "Swaps two random items until sorted. Gives up after 25,000 steps.",
                    timeComplexity: "O(n!)",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: BozoSort as AlgorithmConstructor,
                    instructions: BozoSort.getInstructions(),
                },
            },
            {
                id: "stoogeSort",
                meta: {
                    name: "Stooge",
                    description:
                        "Sorts the first two thirds, the last two thirds, then the first two thirds again. Gives up after 160,000 steps.",
                    timeComplexity: "O(n^2.71)",
                    bestCase: "O(n^2.71)",
                    worstCase: "O(n^2.71)",
                    auxiliarySpace: "O(log n)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: StoogeSort as AlgorithmConstructor,
                    instructions: StoogeSort.getInstructions(),
                },
            },
            {
                id: "slowSort",
                meta: {
                    name: "Slow",
                    description:
                        "Multiply and surrender: deliberately the slowest recursion. Gives up after 25,000 steps.",
                    timeComplexity: "Ω(n^(log n/2))",
                    bestCase: "Ω(n^(log n/2))",
                    worstCase: "Ω(n^(log n/2))",
                    auxiliarySpace: "O(n)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: SlowSort as AlgorithmConstructor,
                    instructions: SlowSort.getInstructions(),
                },
            },
            {
                id: "sleepSort",
                meta: {
                    name: "Sleep",
                    description:
                        "Every value sleeps for its own length; the first to wake goes next. Equal values wake in their original order.",
                    timeComplexity: "O(n + max)",
                    bestCase: "O(n + max)",
                    worstCase: "O(n + max)",
                    auxiliarySpace: "O(n)",
                    stable: true,
                    inPlace: false,
                    group: "fun",
                },
                algorithm: {
                    Class: SleepSort as AlgorithmConstructor,
                    instructions: SleepSort.getInstructions(),
                },
            },
            {
                id: "miracleSort",
                meta: {
                    name: "Miracle",
                    description:
                        "Checks five times whether the array is sorted, waiting for a miracle in between.",
                    timeComplexity: "Unbounded",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: MiracleSort as AlgorithmConstructor,
                    instructions: MiracleSort.getInstructions(),
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

import { BubbleSort } from "./sort/BubbleSort";
import { InsertionSort } from "./sort/InsertionSort";
import { MergeSort } from "./sort/MergeSort";
import { SelectionSort } from "./sort/SelectionSort";
import { ShellSort } from "./sort/ShellSort";

const data = [
	{
		name: "Sort",
		id: "sort",
		items: [
			{
				id: "bubbleSort",
				Class: BubbleSort,
				meta: {
					name: "Bubble sort",
					description: "...",
					timeComplexity: "O(n^2)",
					auxiliarySpace: "O(1)",
				},
				instructions: BubbleSort.getInstructions(),
			},
			{
				id: "selectionSort",
				Class: SelectionSort,
				meta: {
					name: "Selection sort",
					description: "...",
					timeComplexity: "O(n^2)",
					auxiliarySpace: "O(1)",
				},
				instructions: SelectionSort.getInstructions(),
			},
			{
				id: "mergeSort",
				Class: MergeSort,
				meta: {
					name: "Merge Sort",
					description: "...",
					timeComplexity: "O(n log n)",
					auxiliarySpace: "O(n)",
				},
				instructions: MergeSort.getInstructions(),
			},
			{
				id: "insertionSort",
				Class: InsertionSort,
				meta: {
					name: "Insertion Sort",
					description: "...",
					timeComplexity: "O(n^2)",
					auxiliarySpace: "O(1)",
				},
				instructions: InsertionSort.getInstructions(),
			},
			{
				id: "shellSort",
				Class: ShellSort,
				meta: {
					name: "Shell Sort",
					description: "...",
					timeComplexity: "O(n^2)",
					auxiliarySpace: "O(1)",
				},
				instructions: ShellSort.getInstructions(),
			},
		],
	},
	{ name: "Path Finding", id: "path", items: [] },
	{ name: "Find", id: "find", items: [] },
];

export const registryData = {
	data,
	categoriesLog: data.map(item => item.id),
};

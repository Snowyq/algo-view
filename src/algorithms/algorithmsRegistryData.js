import { BubbleSort } from "./sort/BubbleSort";
import { SelectionSort } from "./sort/SelectionSort";

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
				},
				instructions: SelectionSort.getInstructions(),
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

import { BubbleSort } from "./sort/BubbleSort";
import { SelectionSort } from "./sort/SelectionSort";

export const registry = {
	sort: {
		bubbleSort: {
			id: "bubbleSort",
			Class: BubbleSort,
			meta: {
				name: "Bubble sort",
				description: "...",
				timeComplexity: "O(n^2)",
			},
			instructions: {
				i0: {
					line: `for (let i = 1; i < arr.length; i++) {`,
					indent: 0,
				},
				i1: {
					line: `for (let j = 0; j < arr.length - i; j++) {`,
					indent: 1,
				},
				i2: { line: `if (arr[j] > arr[j + 1]) {`, indent: 2 },
				i3: {
					line: `[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];`,
					indent: 3,
				},
				ie2: { line: `}`, indent: 2 },
				ie1: { line: `}`, indent: 1 },
				ie0: { line: `}`, indent: 0 },
			},
		},
		selectionSort: {
			id: "selectionSort",
			Class: SelectionSort,
			meta: {
				name: "Selection sort",
				description: "...",
				timeComplexity: "O(n^2)",
			},
			instructions: {
				i0: { line: `for (let i = 0; i < n; i++) {`, indent: 0 },
				i1: { line: `let minIdx = i;`, indent: 1 },
				i2: { line: `for (let j = i + 1; j < n; j++) {`, indent: 1 },
				i3: { line: `if (arr[j] < arr[minIdx]) {`, indent: 2 },
				i4: { line: `minIdx = j;`, indent: 3 },
				ie3: { line: `}`, indent: 2 },
				ie2: { line: `}`, indent: 1 },
				i5: {
					line: `[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];`,
					indent: 1,
				},
				ie0: { line: `}`, indent: 0 },
			},
		},
	},
};

const categories = Object.keys(registry);
export const algorithmIds = categories
	.map(cat => Object.keys(registry[cat]))
	.flat();

export function getAlgorithmRegistriesByCategory(category) {
	if (!categories.includes(category)) return;
	return Object.keys(registry[category]).map(id => registry[category][id]);
}

export function getCategoriesInRegistry() {
	return categories;
}

export function getAlgorithmRegistry(category, id) {
	if (category) {
		const registriesInCategory = getAlgorithmRegistriesByCategory(category);
		return registriesInCategory.find(reg => reg.id === id);
	}
}

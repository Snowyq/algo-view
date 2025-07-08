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
				i0: `for (let i = 1; i < arr.length; i++) {`,
				i1: `  for (let j = 0; j < arr.length - i; j++) {`,
				i2: `    if (arr[j] > arr[j + 1]) {`,
				i3: `      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];`,
				ie2: `    }`,
				ie1: `  }`,
				ie0: `}`,
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
				i0: `for (let i = 0; i < n; i++) {`,
				i1: `  let minIdx = i;`,
				i2: `  for (let j = i + 1; j < n; j++) {`,
				i3: `    if (arr[j] < arr[minIdx]) {`,
				i4: `      minIdx = j;`,
				ie3: `    }`,
				ie2: `  }`,
				i5: `  [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];`,
				ie0: `}`,
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
	console.log(category, id);
	// if (!algorithmIds.includes(id)) return;
	if (category) {
		console.log(id);
		const registriesInCategory = getAlgorithmRegistriesByCategory(category);
		return registriesInCategory.find(reg => reg.id === id);
	}
}

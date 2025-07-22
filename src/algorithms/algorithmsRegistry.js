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
			instructions: BubbleSort.getInstructions(),
		},
		selectionSort: {
			id: "selectionSort",
			Class: SelectionSort,
			meta: {
				name: "Selection sort",
				description: "...",
				timeComplexity: "O(n^2)",
			},
			instructions: SelectionSort.getInstructions(),
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

export function getAlgorithmClass(category, id) {
	return getAlgorithmRegistry(category, id).Class;
}

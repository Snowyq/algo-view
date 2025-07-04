import { BubbleSort } from "./sort/BubbleSort";

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

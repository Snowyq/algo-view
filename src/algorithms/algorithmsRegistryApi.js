import { registry } from "./algorithmsRegistryData";

function getRegistriesByCategory(categoryId) {
	if (!registry.categoriesLog.includes(categoryId)) return [];

	const registriesInCategory = registry.data.find(
		category => category.id === categoryId
	).items;

	return registriesInCategory;
}

function getCategoriesIds() {
	const ids = registry.data.map(cat => cat.id);
	return ids;
}

function getCategory(category) {
	return registry.data.find(cat => cat.id === category);
}

function getAlgorithmsInCategory(category) {
	if (!category) return;
	return getCategory(category).items;
}

function getAlgorithmRegistry(category, id) {
	const registry = getRegistriesByCategory(category).find(
		reg => reg.id === id
	);

	return registry;
}

function getCategories() {
	return registry.data;
}

function getAlgorithmInfo(category, id) {
	const registry = getRegistriesByCategory(category).find(
		reg => reg.id === id
	);

	return registry.meta;
}

function getAlgorithmClass(category, id) {
	const registry = getAlgorithmRegistry(category, id);
	if (!registry) return;
	return registry.algorithm.Class;
}

function getAlgorithmInstructions(category, id) {
	const registry = getAlgorithmRegistry(category, id);
	if (!registry) return;
	return registry.algorithm.instructions;
}

const registryApi = {
	registry,
	getAlgorithmClass,
	getCategory,
	getRegistriesByCategory,
	getAlgorithmRegistry,
	getCategories,
	getCategoriesIds,
	getAlgorithmsInCategory,
	getAlgorithmInstructions,
	getAlgorithmInfo,
};

export default registryApi;

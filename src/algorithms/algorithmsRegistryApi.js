import { registryData } from "./algorithmsRegistryData";

function getRegistriesByCategory(categoryId) {
	if (!registryData.categoriesLog.includes(categoryId)) return [];

	const registriesInCategory = registryData.data.find(
		category => category.id === categoryId
	).items;

	return registriesInCategory;
}

function getCategories() {
	const categories = registryData.data;
	return categories;
}

function getCategoriesLogs() {
	const logs = registryData.categoriesLog;
	return logs;
}

function getAlgorithmRegistry(category, id) {
	const registry = getRegistriesByCategory(category).find(
		reg => reg.id === id
	);

	return registry;
}

function getAlgorithmClass(category, id) {
	const registry = getAlgorithmRegistry(category, id);
	if (!registry) return;
	return registry.Class;
}

const registryApi = {
	data: registryData,
	getCategories,
	getAlgorithmClass,
	getRegistriesByCategory,
	getAlgorithmRegistry,
	getCategoriesLogs,
};

export default registryApi;

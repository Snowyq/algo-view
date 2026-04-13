import { registry } from "./algorithmsRegistryData";
import type {
    AlgorithmCategory,
    AlgorithmConstructor,
    AlgorithmInstructions,
    AlgorithmMeta,
    AlgorithmRegistryItem,
} from "./types";

function getRegistriesByCategory(categoryId: string): AlgorithmRegistryItem[] {
    if (!registry.categoriesLog.includes(categoryId)) return [];

    const registriesInCategory = registry.data.find(
        (category) => category.id === categoryId
    )?.items;

    return registriesInCategory ?? [];
}

function getCategoriesIds(): string[] {
    const ids = registry.data.map((cat) => cat.id);
    return ids;
}

function getCategory(category: string): AlgorithmCategory | undefined {
    return registry.data.find((cat) => cat.id === category);
}

function getAlgorithmsInCategory(
    category: string | undefined
): AlgorithmRegistryItem[] | undefined {
    if (!category) return;
    return getCategory(category)?.items;
}

function getAlgorithmRegistry(
    category: string,
    id: string
): AlgorithmRegistryItem | undefined {
    const registry = getRegistriesByCategory(category).find(
        (reg) => reg.id === id
    );

    return registry;
}

function getCategories(): AlgorithmCategory[] {
    return registry.data;
}

function getAlgorithmInfo(
    category: string,
    id: string
): AlgorithmMeta | undefined {
    const registry = getRegistriesByCategory(category).find(
        (reg) => reg.id === id
    );

    return registry?.meta;
}

function getAlgorithmClass(
    category: string,
    id: string
): AlgorithmConstructor | undefined {
    const registry = getAlgorithmRegistry(category, id);
    if (!registry) return;
    return registry.algorithm.Class;
}

function getAlgorithmInstructions(
    category: string,
    id: string
): AlgorithmInstructions | undefined {
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

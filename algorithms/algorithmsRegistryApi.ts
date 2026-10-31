import { registry } from "./algorithmsRegistryData";
import type {
    AlgorithmCategory,
    AlgorithmConstructor,
    AlgorithmRegistryItem,
} from "./types";

function getCategoriesIds(): string[] {
    return registry.data.map((category) => category.id);
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
    return getCategory(category)?.items.find((item) => item.id === id);
}

function getAlgorithmClass(
    category: string,
    id: string
): AlgorithmConstructor | undefined {
    return getAlgorithmRegistry(category, id)?.algorithm.Class;
}

const registryApi = {
    registry,
    getAlgorithmClass,
    getCategory,
    getAlgorithmRegistry,
    getCategoriesIds,
    getAlgorithmsInCategory,
};

export default registryApi;

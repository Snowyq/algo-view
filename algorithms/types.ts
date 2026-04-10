import type { Algorithm } from "./Algorithm";

export type AlgorithmInstruction = {
	line: string;
	indent: number;
};

export type AlgorithmInstructions = Record<string, AlgorithmInstruction>;

export type AlgorithmMeta = {
	name: string;
	description: string;
	timeComplexity: string;
	auxiliarySpace: string;
};

export type AlgorithmConstructor<T extends Algorithm = Algorithm> = new (
	...args: unknown[]
) => T;

export type AlgorithmRegistryItem = {
	id: string;
	meta: AlgorithmMeta;
	algorithm: {
		Class: AlgorithmConstructor;
		instructions?: AlgorithmInstructions;
	};
};

export type AlgorithmCategory = {
	name: string;
	id: string;
	items: AlgorithmRegistryItem[];
};

export type AlgorithmsRegistry = {
	data: AlgorithmCategory[];
	categoriesLog: string[];
};

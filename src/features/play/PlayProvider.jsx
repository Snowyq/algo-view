import { useCallback, useMemo, useState } from "react";
import { PlayContext, StepContext } from "./PlayContext";
import { generateRandomArray } from "../../utils/randoms";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { AVAILABLE_SORT_ANIMATION_SPEEDS } from "../../utils/constants";

const DEFAULT_INPUT = [
	19, 28, 12, 27, 20, 11, 30, 15, 9, 4, 23, 2, 29, 25, 14, 12, 8, 3, 18, 10,
	16, 21, 6, 5, 24, 13, 30, 7, 17, 26, 19, 11, 22, 6, 29, 3, 15, 8, 4, 27, 2,
	28, 14, 12, 9, 7, 30, 5, 18, 25, 10, 17, 16, 22, 24, 13, 21, 26, 6, 23, 20,
	11, 19, 3, 9, 5, 14, 17, 28, 8, 7, 2, 18, 12, 16, 29, 13, 22, 10, 4,
];
// const DEFAULT_INPUT = [10, 25, 13, 11, 5, 7, 10, 22, 19, 4];
// const DEFAULT_INPUT = generateRandomArray(300, 0, 30);

const DEFAULT_ALGOS = ["bubbleSort"];
const animationSpeeds = {
	sort: AVAILABLE_SORT_ANIMATION_SPEEDS,
};

function PlayProvider({ children }) {
	const [activeCategory, setActiveCategory] = useState("sort");
	const [activeAlgorithms, setActiveAlgorithms] = useState(DEFAULT_ALGOS);
	const [algorithmInput, setAlgorithmInput] = useState(DEFAULT_INPUT);
	const categories = registryApi.getCategories();
	const categoriesLogs = registryApi.getCategoriesLogs();
	const algorithms = registryApi.getRegistriesByCategory(activeCategory);

	const changeInput = useCallback(newInput => {
		setAlgorithmInput(newInput);
	}, []);

	const changeActiveCategory = useCallback(
		newCategory => {
			if (!categoriesLogs.includes(newCategory)) return;
			setActiveAlgorithms([]);
			setActiveCategory(newCategory);
		},
		[categoriesLogs]
	);

	const openAlgorithm = useCallback(
		algorithmId => {
			const algorithmRegistry = registryApi.getAlgorithmRegistry(
				activeCategory,
				algorithmId
			);
			if (!algorithmRegistry) return;
			setActiveAlgorithms(algos => [...algos, algorithmId]);
		},
		[activeCategory]
	);

	const closeAlgorithm = useCallback(algorithmId => {
		setActiveAlgorithms(algos => {
			if (!algos.includes(algorithmId)) return algos;
			return algos.filter(algoId => algoId !== algorithmId);
		});
	}, []);

	const changeActiveAlgorithms = useCallback(
		algorithmsIds => {
			const registries = algorithmsIds
				.map(id => registryApi.getAlgorithmRegistry(activeCategory, id))
				.filter(Boolean);
			setActiveAlgorithms(registries);
		},
		[activeCategory]
	);

	const playContextValue = useMemo(
		() => ({
			openAlgorithm,
			closeAlgorithm,
			changeActiveAlgorithms,
			activeCategory,
			changeActiveCategory,
			changeInput,
			activeAlgorithms,
			algorithmInput,
			categories,
			algorithms,
			animationSpeeds,
		}),
		[
			openAlgorithm,
			closeAlgorithm,
			changeActiveAlgorithms,
			activeCategory,
			changeActiveCategory,
			changeInput,
			activeAlgorithms,
			algorithmInput,
			categories,
			algorithms,
		]
	);

	return (
		<PlayContext.Provider value={playContextValue}>
			{children}
		</PlayContext.Provider>
	);
}

export default PlayProvider;

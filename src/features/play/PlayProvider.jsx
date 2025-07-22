import { useCallback, useMemo, useState } from "react";
import { PlayContext, StepContext } from "./PlayContext";
import { generateRandomArray } from "../../utils/randoms";
import {
	getAlgorithmRegistriesByCategory,
	getCategoriesInRegistry,
} from "../../algorithms/algorithmsRegistry";

const DEFAULT_INPUT = [
	19, 28, 12, 27, 20, 11, 30, 15, 9, 4, 23, 2, 29, 25, 14, 12, 8, 3, 18, 10,
	16, 21, 6, 5, 24, 13, 30, 7, 17, 26, 19, 11, 22, 6, 29, 3, 15, 8, 4, 27, 2,
	28, 14, 12, 9, 7, 30, 5, 18, 25, 10, 17, 16, 22, 24, 13, 21, 26, 6, 23, 20,
	11, 19, 3, 9, 5, 14, 17, 28, 8, 7, 2, 18, 12, 16, 29, 13, 22, 10, 4,
];
// const DEFAULT_INPUT = [10, 25, 13, 11, 5, 7, 10, 22, 19, 4];
// const DEFAULT_INPUT = generateRandomArray(300, 0, 30);

const DEFAULT_ALGOS = ["bubbleSort", "selectionSort"];

function PlayProvider({ children }) {
	const [category, setCategory] = useState("sort");
	const [algorithms, setAlgorithms] = useState(DEFAULT_ALGOS);
	const [algorithmInput, setAlgorithmInput] = useState(DEFAULT_INPUT);
	const [globalStep, setGlobalStep] = useState(1000);
	const [globalStepsLength, setGlobalStepsLength] = useState(0);

	const changeInput = useCallback(newInput => {
		setAlgorithmInput(newInput);
	}, []);

	const changeCategory = useCallback(newCategory => {
		if (!getCategoriesInRegistry().includes(newCategory)) return;
		setCategory(newCategory);
	}, []);

	const changeGlobalStep = useCallback(newStep => {
		setGlobalStep(newStep);
	}, []);

	const increaseGlobalStep = useCallback(
		val => {
			setGlobalStep(prev => Math.min(prev + val, globalStepsLength - 1));
		},
		[globalStepsLength]
	);

	const decreaseGlobalStep = useCallback(val => {
		setGlobalStep(prev => Math.max(prev - val, 0));
	}, []);

	const changeGlobalStepsLength = useCallback(length => {
		setGlobalStepsLength(prev => (prev < length ? length : prev));
	}, []);

	const openAlgorithm = useCallback(
		algorithmId => {
			const algorithmsInActiveCategory =
				getAlgorithmRegistriesByCategory(category);
			if (!algorithmsInActiveCategory.includes(algorithmId)) return;
			setAlgorithms(algos => [...algos, algorithmId]);
		},
		[category]
	);

	const closeAlgorithm = useCallback(algorithmId => {
		setAlgorithms(algos => {
			if (!algos.includes(algorithmId)) return algos;
			return algos.filter(algoId => algoId !== algorithmId);
		});
	}, []);

	// === Memoized Context Values ===
	const stepContextValue = useMemo(
		() => ({
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
		}),
		[globalStep, changeGlobalStep, decreaseGlobalStep, increaseGlobalStep]
	);

	const playContextValue = useMemo(
		() => ({
			openAlgorithm,
			closeAlgorithm,
			category,
			changeCategory,
			changeInput,
			algorithms,
			algorithmInput,
			changeGlobalStepsLength,
		}),
		[
			openAlgorithm,
			closeAlgorithm,
			category,
			changeCategory,
			changeInput,
			algorithms,
			algorithmInput,
			changeGlobalStepsLength,
		]
	);

	return (
		<StepContext.Provider value={stepContextValue}>
			<PlayContext.Provider value={playContextValue}>
				{children}
			</PlayContext.Provider>
		</StepContext.Provider>
	);
}

export default PlayProvider;

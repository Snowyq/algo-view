import { useState } from "react";
import { PlayContext } from "./PlayContext";
import { generateRandomArray } from "../../utils/randoms";
import {
	getAlgorithmRegistriesByCategory,
	getAlgorithmRegistry,
	getCategoriesInRegistry,
} from "../../algorithms/algorithmsRegistry";

const testActiveWindow = {
	role: "algorithm",
	algorithm: {
		id: "selectionSort",
		category: "sort",
		name: "BubbleSort",
	},
};

const testArr1 = [
	19, 28, 12, 27, 20, 11, 30, 15, 9, 4, 23, 2, 29, 25, 14, 12, 8, 3, 18, 10,
	16, 21, 6, 5, 24, 13, 30, 7, 17, 26, 19, 11, 22, 6, 29, 3, 15, 8, 4, 27, 2,
	28, 14, 12, 9, 7, 30, 5, 18, 25, 10, 17, 16, 22, 24, 13, 21, 26, 6, 23, 20,
	11, 19, 3, 9, 5, 14, 17, 28, 8, 7, 2, 18, 12, 16, 29, 13, 22, 10, 4,
];

const testArr2 = [10, 25, 13, 11, 5, 7, 10, 22, 19, 4];

const testArrDynamic = generateRandomArray(1000, 2, 30);

function PlayProvider({ children }) {
	const [activeAlgorithmsCategory, setActiveAlgorithmsCategory] =
		useState("sort");
	// const [activeAlgorithms, setActiveAlgorithms] = useState([
	// 	testActiveWindow,
	// ]);
	const [activeAlgorithms, setActiveAlgorithms] = useState(["bubbleSort"]);

	// const [algorithmInput, setAlgorithmInput] = useState(testArr1);
	const [algorithmInput, setAlgorithmInput] = useState(testArr2);
	// const [algorithmInput, setAlgorithmInput] = useState(testArrDynamic);
	const [currStep, setCurrStep] = useState(0);

	const changeInput = newInput => {
		setAlgorithmInput(newInput);
	};

	const changeCategory = newCategory => {
		if (!getCategoriesInRegistry().includes(newCategory)) return;
		setActiveAlgorithmsCategory(newCategory);
	};

	const changeCurrStep = newStep => {
		setCurrStep(newStep);
	};

	const openAlgorithm = algorithmId => {
		const algorithmsInActiveCategory = getAlgorithmRegistriesByCategory(
			activeAlgorithmsCategory
		);
		if (!algorithmsInActiveCategory.includes(algorithmId)) return;
		setActiveAlgorithms(algos => [...algos, algorithmId]);
	};

	const closeAlgorithm = algorithmId => {
		setActiveAlgorithms(algos => {
			if (!algos.includes(algorithmId)) return algos;
			else return algos.filter(algoId => algoId !== algorithmId);
		});
	};

	return (
		<PlayContext.Provider
			value={{
				currStep,
				changeCurrStep,
				openAlgorithm,
				closeAlgorithm,
				algorithmCategory: activeAlgorithmsCategory,
				activeAlgorithmsCategory,
				changeCategory,
				changeInput,
				activeWindows: activeAlgorithms,
				activeAlgorithms,
				algorithmInput,
			}}
		>
			{children}
		</PlayContext.Provider>
	);
}

export default PlayProvider;

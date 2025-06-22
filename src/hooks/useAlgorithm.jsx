import { useEffect, useRef, useState } from "react";
import { BubbleSort } from "../algorithms/sort/bubbleSort";

const algorithmClasses = {
	sort: {
		bubbleSort: BubbleSort,
	},
};

function findAlgorithmClass(category, id) {
	const algorithmClass = algorithmClasses[category][id];
	if (algorithmClass) return algorithmClass;
	else throw new Error("such algorithm doesn't exist");
}

function initAlgorithm(category, id, input) {
	const AlgorithmClass = findAlgorithmClass(category, id);
	return new AlgorithmClass(input);
}

function useAlgorithm(category, id, input, ...restOptions) {
	const [Algorithm, setAlgorithm] = useState(() =>
		initAlgorithm(category, id, input)
	);

	// useEffect(() => {

	// }, [category, id, input, restOptions]);

	return {
		Algorithm,
	};
}

export default useAlgorithm;

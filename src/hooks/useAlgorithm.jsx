import { useEffect, useRef } from "react";
import { BubbleSort } from "../algorithms/sort/bubbleSort";

const algorithmClasses = {
	sort: {
		bubbleSort: BubbleSort,
	},
};

function findAlgorithmClass(category, name) {
	const algorithmClass = algorithmClasses[category][name];
	if (algorithmClass) return algorithmClass;
	else throw new Error("such algorithm doesn't exist");
}

function useAlgorithm(category, name, input) {
	const algorithmRef = useRef(null);

	useEffect(() => {
		const AlgorithmClass = findAlgorithmClass(category, name);
		algorithmRef.current = new AlgorithmClass(input);
	}, [category, name, input]);

	return {
		algorithm: algorithmRef.current,
	};
}

export default useAlgorithm;

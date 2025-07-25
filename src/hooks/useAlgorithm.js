import { useEffect, useMemo, useRef, useState } from "react";

export default function useAlgorithm(Class, input) {
	const algorithmInstance = useMemo(() => {
		const instance = new Class(input);
		return instance;
	}, [Class, input]);

	const getStepsLength = () => algorithmInstance?.getStepsLength();

	const getState = stepIndex =>
		algorithmInstance?.getStateByStepsIndex(stepIndex);

	// const getState = stepIndex =>
	// 		() => algorithmInstance?.getStateByStepsIndex(stepIndex),
	// 		[stepIndex]
	// 	);

	const getStep = stepIndex => algorithmInstance?.getStepByIndex(stepIndex);
	const getMaxValue = () => algorithmInstance?.getArrayMinMax().max;
	const getMinValue = () => algorithmInstance?.getArrayMinMax().min;
	const getArrayLength = () => algorithmInstance?.getArrayLength();

	return {
		Algorithm: algorithmInstance,
		getStepsLength,
		getState,
		getStep,
		getArrayLength,
		getMaxValue,
		getMinValue,
	};
}

// import { useEffect, useRef, useState } from "react";

// export default function useSortAlgorithm(category, id, input) {
// 	const [result, setResult] = useState(null);
// 	const [worker, setWorker] = useState(null);
// 	console.log(result);

// 	useEffect(() => {
// 		// Initialize worker
// 		const newWorker = new Worker(
// 			new URL("../workers/sortWorker.js", import.meta.url)
// 		);

// 		// Handle worker messages
// 		newWorker.onmessage = event => {
// 			setResult(event.data);
// 		};

// 		// Send computation to worker
// 		newWorker.postMessage({ type: "mount", payload: { category, id } });

// 		// Cleanup the worker when component unmounts
// 		return () => {
// 			newWorker.terminate();
// 		};
// 	}, [category, id]);
// }

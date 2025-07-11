import { useEffect, useMemo, useRef, useState } from "react";

export default function useSortAlgorithm(Class, input) {
	const algorithmInstance = useMemo(() => {
		const instance = new Class(input);
		return instance;
	}, [Class, input]);

	const init = input => algorithmInstance?.init(input);
	const getStepsLength = () => algorithmInstance?.getStepsLength();
	const getState = stepIndex =>
		algorithmInstance?.getStateByStepsIndex(stepIndex);
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

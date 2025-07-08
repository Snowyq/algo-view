export default function useSortAlgorithm(Class, input) {
	const Algorithm = new Class(input);
	const getStepsLength = () => Algorithm.getStepsLength();
	const getState = stepIndex => Algorithm.getStateByStepsIndex(stepIndex);
	const getStep = stepIndex => Algorithm.getStepByIndex(stepIndex);
	const getMaxValue = () => Algorithm.getArrayMinMax().max;
	const getMinValue = () => Algorithm.getArrayMinMax().min;
	const getArrayLength = () => Algorithm.getArrayLength();

	return {
		Algorithm,
		getStepsLength,
		getState,
		getStep,
		getArrayLength,
		getMaxValue,
		getMinValue,
	};
}

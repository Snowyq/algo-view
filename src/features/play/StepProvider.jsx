import { useCallback, useMemo, useState } from "react";
import { StepContext } from "./PlayContext";
import { clamp } from "../../utils/values";

export function StepProvider({ children }) {
	const [globalStep, setGlobalStep] = useState(0);
	const [globalStepsLength, setGlobalStepsLength] = useState(0);
	const changeGlobalStep = useCallback(
		step => {
			setGlobalStep(clamp(step, 0, globalStepsLength - 1));
		},
		[globalStepsLength]
	);

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

	const stepContextValue = useMemo(
		() => ({
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
			changeGlobalStepsLength,
			globalStepsLength,
		}),
		[
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
			globalStepsLength,
			changeGlobalStepsLength,
		]
	);

	return (
		<StepContext.Provider value={stepContextValue}>
			{children}
		</StepContext.Provider>
	);
}

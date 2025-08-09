import { useCallback, useMemo, useState } from "react";
import { StepContext } from "./PlayContext";
import { clamp } from "../../utils/values";

const DEFAULT_STEP_TYPES = [
	"initial",
	"check",
	"check-true",
	"check-false",
	"check-value",
	"check-value-true",
	"check-value-false",
	"swap",
	"copy",
	"copy-from",
	"copy-to",
	"select",
	"finish",
	"assign",
];

export function StepProvider({ children }) {
	const [globalStep, setGlobalStep] = useState(0);
	const [globalStepsLength, setGlobalStepsLength] = useState(0);
	const [stepsLengths, setStepsLengths] = useState([]);
	const [stepTypes, setStepTypes] = useState(DEFAULT_STEP_TYPES);

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

	const changeGlobalStepsLength = useCallback((newLength, reset = false) => {
		setGlobalStepsLength(length => {
			const longest = reset ? 0 : length;
			return newLength > longest ? newLength : longest;
		});
	}, []);

	const passStepsLength = useCallback(
		(length, id) => {
			setStepsLengths(lengths => {
				const rest = lengths.filter(l => l.id !== id);
				const newLengths = [...rest, { id, length }];
				setGlobalStepsLength(
					Math.max(...newLengths.map(item => item.length))
				);
				return newLengths;
			});
		},
		[setGlobalStepsLength]
	);

	const stepContextValue = useMemo(
		() => ({
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
			changeGlobalStepsLength,
			passStepsLength,
			globalStepsLength,
			stepTypes,
		}),
		[
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
			globalStepsLength,
			passStepsLength,
			changeGlobalStepsLength,
			stepTypes,
		]
	);

	return (
		<StepContext.Provider value={stepContextValue}>
			{children}
		</StepContext.Provider>
	);
}

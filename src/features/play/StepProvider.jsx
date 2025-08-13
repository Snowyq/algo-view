import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { PlayContext, StepContext } from "./PlayContext";
import { clamp } from "../../utils/values";
import PlayProvider from "./PlayProvider";
import { prefetchDNS } from "react-dom";

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
	const [stepsLengths, setStepsLengths] = useState([]);

	const globalStepsLength = useMemo(() => {
		return Math.max(...stepsLengths.map(item => item.length), 0);
	}, [stepsLengths]);
	const globalStepsLengthRef = useRef(globalStepsLength);
	useEffect(() => {
		globalStepsLengthRef.current = globalStepsLength;
	}, [globalStepsLength]);

	const [stepTypes, setStepTypes] = useState(DEFAULT_STEP_TYPES);

	const changeGlobalStep = useCallback(step => {
		setGlobalStep(clamp(step, 0, globalStepsLengthRef.current - 1));
	}, []);

	const increaseGlobalStep = useCallback(val => {
		console.log(globalStepsLengthRef.current);
		setGlobalStep(prev =>
			Math.min(prev + val, globalStepsLengthRef.current - 1)
		);
	}, []);

	const decreaseGlobalStep = useCallback(val => {
		setGlobalStep(prev => Math.max(prev - val, 0));
	}, []);

	const passStepsLength = useCallback((length, id) => {
		setStepsLengths(lengths => {
			const rest = lengths.filter(l => l.id !== id);
			const newLengths = [...rest, { id, length }];

			return newLengths;
		});
	}, []);

	const { activeAlgorithms } = useContext(PlayContext);

	useEffect(() => {
		if (!activeAlgorithms) return;

		setStepsLengths(lengths => {
			return lengths.filter(l =>
				activeAlgorithms.find(item => item.id === l.id)
			);
		});
	}, [activeAlgorithms]);

	const stepContextValue = useMemo(
		() => ({
			globalStep,
			changeGlobalStep,
			decreaseGlobalStep,
			increaseGlobalStep,
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
			stepTypes,
		]
	);

	return (
		<StepContext.Provider value={stepContextValue}>
			{children}
		</StepContext.Provider>
	);
}

import { useContext } from "react";
import { PlayContext, StepContext } from "./PlayContext";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

function PlayVisualizer({ registry, Background }) {
	const { activeCategory, algorithmInput: input } = useContext(PlayContext);

	const { globalStep: stepIndex, changeGlobalStepsLength } =
		useContext(StepContext);

	const handlePassedStepsLength = stepsLength => {
		changeGlobalStepsLength(stepsLength);
	};

	if (activeCategory === "sort")
		return (
			<SortAlgorithmVisualizer
				input={input}
				stepIndex={stepIndex}
				passStepsLength={handlePassedStepsLength}
				registry={registry}
				Background={Background}
			/>
		);
	else return <></>;
}

export default PlayVisualizer;

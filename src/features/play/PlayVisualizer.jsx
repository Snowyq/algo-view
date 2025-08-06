import { useContext } from "react";
import { PlayContext, StepContext } from "./PlayContext";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

function PlayVisualizer({ registry, Background }) {
	const { activeCategory, algorithmInput: input } = useContext(PlayContext);

	const {
		globalStep: stepIndex,
		stepTypes,
		passStepsLength,
	} = useContext(StepContext);

	const handlePassedStepsLength = stepsLength => {
		passStepsLength(stepsLength, registry.id);
	};

	if (activeCategory === "sort")
		return (
			<SortAlgorithmVisualizer
				input={input}
				stepIndex={stepIndex}
				stepTypes={stepTypes}
				passStepsLength={handlePassedStepsLength}
				registry={registry}
				Background={Background}
			/>
		);
	else return <></>;
}

export default PlayVisualizer;

import { useContext } from "react";
import SortArrayDisplay from "./SortArrayDisplay";
import { PlayContext } from "./PlayContext";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

function PlayVisualizer({ registry, Background }) {
	const {
		activeAlgorithmsCategory: category,
		algorithmInput: input,
		globalStep: stepIndex,
		changeGlobalStepsLength,
	} = useContext(PlayContext);

	const handlePassedStepsLength = stepsLength => {
		changeGlobalStepsLength(stepsLength);
	};

	if (category === "sort")
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

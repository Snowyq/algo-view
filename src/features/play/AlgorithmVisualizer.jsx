import { useContext } from "react";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";
import { PlayContext } from "./PlayContext";

function AlgorithmVisualizer({
	registry,
	input,
	category,
	stepIndex,
	passStepsLength,
}) {
	if (category === "sort")
		return (
			<SortAlgorithmVisualizer
				registry={registry}
				input={input}
				stepIndex={stepIndex}
				passStepsLength={passStepsLength}
			/>
		);
	else return <></>;
}

export default AlgorithmVisualizer;

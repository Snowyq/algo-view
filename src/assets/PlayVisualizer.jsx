import { useContext } from "react";
import { PlayContext, StepContext } from "../features/play/PlayContext";
import SortAlgorithmVisualizer from "../features/play/SortAlgorithmVisualizer";

function PlayVisualizer({ registry, Background, onUpdate }) {
	const { activeCategory } = useContext(PlayContext);

	if (activeCategory === "sort")
		return <SortAlgorithmVisualizer registry={registry} />;
	else return <></>;
}

export default PlayVisualizer;

import { useContext } from "react";
import { PlayContext } from "../features/play/PlayContext";
import SortVisualizerCanvas from "../features/play/SortVisualizerCanvas";

function PlayVisualizer({ registry, Background, onUpdate }) {
	const { activeCategory } = useContext(PlayContext);

	if (activeCategory === "sort")
		return <SortVisualizerCanvas registry={registry} />;
	else return <></>;
}

export default PlayVisualizer;

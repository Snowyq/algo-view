import { useContext } from "react";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";
import { PlayContext } from "./PlayContext";

function AlgorithmVisualizer({ registry, input, category }) {
	if (category === "sort")
		return <SortAlgorithmVisualizer registry={registry} input={input} />;
	else return <></>;
}

export default AlgorithmVisualizer;

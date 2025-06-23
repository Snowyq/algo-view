import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

function AlgorithmVisualizer({ algorithm }) {
	const { category, id } = algorithm;
	if (!category || !id) return <></>;
	if (category === "sort")
		return <SortAlgorithmVisualizer algorithm={algorithm} />;
	else return <></>;
}

export default AlgorithmVisualizer;

import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

function AlgorithmVisualizer({ category, id }) {
	if (category === "sort") return <SortAlgorithmVisualizer id={id} />;
	else return <></>;
}

export default AlgorithmVisualizer;

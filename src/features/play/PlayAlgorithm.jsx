import PlaySortAlgorithm from "./PlaySortAlgorithm";

function PlayAlgorithm({ category, id }) {
	if (category === "sort") return <PlaySortAlgorithm id={id} />;
	else return <></>;
}

export default PlayAlgorithm;

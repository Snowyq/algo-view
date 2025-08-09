import { useState } from "react";
import styled from "styled-components";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";

const Header = styled.div``;

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

function PlaySortWindow({ registry }) {
	const [metrics, setMetrics] = useState({});

	const loadMetrics = metrics => {
		setMetrics(metrics);
	};

	const handleUpdate = ({ metrics }) => {
		loadMetrics(metrics);
	};

	return (
		<Container>
			<Header>{registry.meta.name}</Header>
			<SortAlgorithmVisualizer
				registry={registry}
				onUpdate={handleUpdate}
			/>
		</Container>
	);
}

export default PlaySortWindow;

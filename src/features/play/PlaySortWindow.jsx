import { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";
import PlayStepMetrics from "./PlayStepMetrics";
import ButtonIcon from "../../ui/ButtonIcon";
import { FiSettings } from "react-icons/fi";
import { RiFileSettingsFill } from "react-icons/ri";
import { IoSettings } from "react-icons/io5";
import { PlayContext } from "./PlayContext";

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

const Heading = styled.h2``;

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;

	flex-direction: column;
`;

const Top = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	padding: 0rem 0rem 0.5rem 0.5rem;
	width: 100%;
`;

const Metrics = styled.div`
	padding-right: 0.5rem;
	width: 100%;
	display: flex;
	justify-content: end;
	width: fit-content;
`;

const Body = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 1rem;
	height: 100%;
`;

function PlaySortWindow({ registry }) {
	const [metrics, setMetrics] = useState({});
	const { activeAlgorithms } = useContext(PlayContext);
	console.log(activeAlgorithms);

	const [showMetrics, setShowMetics] = useState(
		activeAlgorithms.length === 1
	);

	const loadMetrics = metrics => {
		setMetrics(metrics);
	};

	const handleUpdate = ({ step, metrics }) => {
		if (metrics) {
			const displayMetrics = {};
			Object.keys(metrics).forEach(key => {
				displayMetrics[key] = {
					name: metrics[key].name,
					id: key,
					count: 0,
				};
				if (step.metrics[key]) {
					displayMetrics[key].count = step.metrics[key].count;
				}
			});
			loadMetrics(displayMetrics);
		}
	};

	return (
		<Container>
			<Top>
				<Header>
					<Heading>{registry.meta.name}</Heading>
					<ButtonIcon>
						<IoSettings />
					</ButtonIcon>
				</Header>
				<PlayStepMetrics metrics={metrics} />
			</Top>
			<SortAlgorithmVisualizer
				registry={registry}
				onStepUpdate={handleUpdate}
			/>
		</Container>
	);
}

export default PlaySortWindow;

import styled from "styled-components";
import AlgorithmPanelShell from "./AlgorithmPanelShell";
import SortAlgorithmPanel from "./SortAlgorithmPanel";

const Container = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
	padding: 0;
	margin: 0 auto;

	padding: 1rem;

	/* max-width: 1200px; */
`;

const WindowCategories = {
	sort: SortAlgorithmPanel,
};

function AlgorithmPanel({ registry, category }) {
	const Window = WindowCategories[category];

	return (
		<AlgorithmPanelShell>
			<Container>{Window && <Window registry={registry} />}</Container>
		</AlgorithmPanelShell>
	);
}

export default AlgorithmPanel;
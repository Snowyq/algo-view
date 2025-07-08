import styled from "styled-components";
import PlayAlgorithmWindow from "./PlayAlgorithmWindow";
import { useContext } from "react";
import { PlayContext } from "./PlayContext";
import { getAlgorithmRegistry } from "../../algorithms/algorithmsRegistry";

const StyledPlayViewArea = styled.div`
	height: 100%;
	width: 100%;
	/* background-color: var(--color-grey-0);
	box-shadow: 1px 1px 15px 5px var(--color-grey-200);
	border: 5px solid var(--color-grey-200); */
	/* border-radius: 2.5rem; */
`;

const Grid = styled.div`
	display: grid;
	gap: 5rem;
	/* grid-template-rows: 1fr 1fr; */
	grid-template-columns: 1fr 1fr;
	height: 100%;
	width: 100%;
`;

function PlayDisplayedAlgorithmsArea() {
	const { activeAlgorithms, activeAlgorithmsCategory } =
		useContext(PlayContext);

	return (
		<StyledPlayViewArea>
			<Grid num={activeAlgorithms.length}>
				{activeAlgorithms.map((id, index) => {
					const registry = getAlgorithmRegistry(
						activeAlgorithmsCategory,
						id
					);
					console.log(id, registry);

					return (
						<PlayAlgorithmWindow
							key={`${index}-${id}`}
							registry={registry}
						/>
					);
				})}
			</Grid>
		</StyledPlayViewArea>
	);
}

export default PlayDisplayedAlgorithmsArea;

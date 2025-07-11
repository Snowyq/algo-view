import styled, { css } from "styled-components";
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

const categories = {
	sort: {
		1: css``,
		2: css`
			grid-template-rows: 1fr 1fr;
		`,
		3: css`
			grid-template-rows: 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		4: css`
			grid-template-rows: 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		5: css``,
		6: css`
			grid-template-rows: 1fr 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
	},
};

const Grid = styled.div`
	display: grid;
	gap: 3rem;

	/* grid-template-columns: 1fr 1fr; */
	height: 100%;
	width: 100%;

	${({ category, num }) => categories[category][num]}
`;

function PlayDisplayedAlgorithmsArea() {
	const { activeAlgorithms, activeAlgorithmsCategory } =
		useContext(PlayContext);

	return (
		<StyledPlayViewArea>
			<Grid
				num={activeAlgorithms.length}
				category={activeAlgorithmsCategory}
			>
				{activeAlgorithms.map((id, index) => {
					const registry = getAlgorithmRegistry(
						activeAlgorithmsCategory,
						id
					);
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

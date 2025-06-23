import styled from "styled-components";
import PlayAlgorithmWindow from "./PlayAlgorithmWindow";
import { useContext } from "react";
import { PlayContext } from "./PlayContext";

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
	/* grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr; */
	height: 100%;
	width: 100%;
`;

function PlayDisplayedAlgorithmsArea() {
	const { activeWindows } = useContext(PlayContext);
	const algorithmWindows = activeWindows.filter(
		window => window.role === "algorithm"
	);
	return (
		<StyledPlayViewArea>
			<Grid num={algorithmWindows.length}>
				{activeWindows.map((window, index) => {
					return (
						<PlayAlgorithmWindow
							key={`${index}-${window.algorithm.id}`}
							window={window}
						/>
					);
				})}
			</Grid>
		</StyledPlayViewArea>
	);
}

export default PlayDisplayedAlgorithmsArea;

import styled from "styled-components";
import Graph from "./GraphDecoration";

const StyledGraphBackground = styled.div`
	position: absolute;
	width: 150svw;
	left: -25svw;

	display: grid;
	gap: 1rem;

	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(2, 1fr);
	height: 150svh;
	top: -25svh;
	z-index: 0;

	@media screen and (min-width: 1000px) {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
`;

function GraphBackground({ graphNum = 10 }) {
	return (
		<StyledGraphBackground graphNum={graphNum}>
			{Array.from({ length: 9 }, (_, index) => (
				<Graph key={index} />
			))}
		</StyledGraphBackground>
	);
}

export default GraphBackground;

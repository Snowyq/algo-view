import PlayWindow from "./PlayWindow";
import styled from "styled-components";
import PlaySortWindow from "./PlaySortWindow";

const Container = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
	padding: 1rem;
	margin: 0 auto;
	/* max-width: 1200px; */
`;

const WindowCategories = {
	sort: PlaySortWindow,
};

function PlayAlgorithmWindow({ registry, category }) {
	const Window = WindowCategories[category];

	return (
		<PlayWindow>
			<Container>{Window && <Window registry={registry} />}</Container>
		</PlayWindow>
	);
}

export default PlayAlgorithmWindow;

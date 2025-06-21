import PlayWindow from "./PlayWindow";
import { BubbleSort } from "../../algorithms/sort/bubbleSort";
import PlayAlgorithm from "./PlayAlgorithm";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
`;
const WindowOutlet = styled.div`
	height: 80%;
	width: 100%;
`;

function PlayAlgorithmWindow({ window }) {
	const { algorithm } = window;

	return (
		<Container>
			<WindowOutlet>
				<PlayWindow>
					<PlayWindow.Header>
						<span>{algorithm.name}</span>
					</PlayWindow.Header>
					<PlayWindow.Body>
						<PlayAlgorithm
							category={window.algorithm.category}
							id={window.algorithm.id}
						/>
					</PlayWindow.Body>
					<PlayWindow.Footer></PlayWindow.Footer>
				</PlayWindow>
			</WindowOutlet>
		</Container>
	);
}

export default PlayAlgorithmWindow;

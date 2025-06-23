import PlayWindow from "./PlayWindow";
import AlgorithmVisualizer from "./AlgorithmVisualizer";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
`;
const WindowOutlet = styled.div`
	width: 100%;
	height: 100%;
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
						<AlgorithmVisualizer algorithm={window.algorithm} />
					</PlayWindow.Body>
				</PlayWindow>
			</WindowOutlet>
		</Container>
	);
}

export default PlayAlgorithmWindow;

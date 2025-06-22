import PlayWindow from "./PlayWindow";
import { BubbleSort } from "../../algorithms/sort/bubbleSort";
import AlgorithmVisualizer from "./AlgorithmVisualizer";
import styled from "styled-components";
import useAlgorithm from "../../hooks/useAlgorithm";
import { createContext } from "react";

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
						<AlgorithmVisualizer algorithm={window.algorithm} />
					</PlayWindow.Body>
					<PlayWindow.Footer></PlayWindow.Footer>
				</PlayWindow>
			</WindowOutlet>
		</Container>
	);
}

export default PlayAlgorithmWindow;

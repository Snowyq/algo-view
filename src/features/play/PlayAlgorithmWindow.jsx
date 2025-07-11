import PlayWindow from "./PlayWindow";
import PlayVisualizer from "./PlayVisualizer";
import styled from "styled-components";
import { useContext } from "react";
import { PlayContext } from "./PlayContext";

const Container = styled.div`
	display: flex;
	height: 100%;
	width: 100%;
	justify-content: center;
	align-items: center;
`;

const VisualizerContainer = styled(Container)`
	width: 100%;
	max-width: 100%;
	padding: 1rem;
`;

function PlayAlgorithmWindow({ registry }) {
	return (
		<Container>
			<PlayWindow>
				{/* <PlayWindow.Header>
					<span>{registry.meta.name}</span>
				</PlayWindow.Header> */}
				<PlayWindow.Body>
					<VisualizerContainer>
						<PlayVisualizer registry={registry} />
					</VisualizerContainer>
				</PlayWindow.Body>
			</PlayWindow>
		</Container>
	);
}

export default PlayAlgorithmWindow;

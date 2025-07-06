import PlayWindow from "./PlayWindow";
import AlgorithmVisualizer from "./AlgorithmVisualizer";
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
	padding: 5rem;
	@media screen and (min-width: 1000px) {
		padding: 15rem;
	}
`;

function PlayAlgorithmWindow({ registry }) {
	const { activeAlgorithmsCategory, algorithmInput } =
		useContext(PlayContext);
	return (
		<Container>
			<PlayWindow>
				<PlayWindow.Header>
					<span>{registry.meta.name}</span>
				</PlayWindow.Header>
				<PlayWindow.Body>
					<PlayWindow.Background>
						<VisualizerContainer>
							<AlgorithmVisualizer
								category={activeAlgorithmsCategory}
								registry={registry}
								input={algorithmInput}
							/>
						</VisualizerContainer>
					</PlayWindow.Background>
				</PlayWindow.Body>
			</PlayWindow>
		</Container>
	);
}

export default PlayAlgorithmWindow;

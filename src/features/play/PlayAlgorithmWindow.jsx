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
	width: 100%;
	padding: 5rem;
	@media screen and (min-width: 1000px) {
		width: 100%;
		padding: 15rem;
	}
	max-width: 100%;
`;

function PlayAlgorithmWindow({ registry }) {
	const {
		activeAlgorithmsCategory,
		algorithmInput,
		globalStep,
		changeGlobalStepsLength,
	} = useContext(PlayContext);

	const handlePassedStepsLength = stepsLength => {
		changeGlobalStepsLength(stepsLength);
	};

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
								stepIndex={globalStep}
								passStepsLength={handlePassedStepsLength}
							/>
						</VisualizerContainer>
					</PlayWindow.Background>
				</PlayWindow.Body>
			</PlayWindow>
		</Container>
	);
}

export default PlayAlgorithmWindow;

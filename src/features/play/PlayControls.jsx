import styled from "styled-components";
import ControlBar from "../../ui/ControlBar";
import PlayWindow from "./PlayWindow";
import AlgorithmControls from "./AlgorithmControls";
import { useContext } from "react";
import { PlayContext } from "./PlayContext";

const Background = styled.div`
	/* background-color: yellow; */
	width: 100%;
	height: 100%;
`;

const Container = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	align-items: center;
	padding: 0 2rem;
`;

function PlayControls() {
	const { decreaseGlobalStep, globalStep, increaseGlobalStep } =
		useContext(PlayContext);

	return (
		<PlayWindow>
			<PlayWindow.Body>
				<Background>
					<Container>
						<button onClick={() => decreaseGlobalStep(1)}>
							wstecz
						</button>
						{globalStep}
						<button onClick={() => increaseGlobalStep(1)}>
							dalej
						</button>
						{/* <AlgorithmControls /> */}
					</Container>
				</Background>
			</PlayWindow.Body>
		</PlayWindow>
	);
}

export default PlayControls;

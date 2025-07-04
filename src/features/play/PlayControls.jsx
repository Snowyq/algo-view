import styled from "styled-components";
import ControlBar from "../../ui/ControlBar";
import PlayWindow from "./PlayWindow";
import AlgorithmControls from "./AlgorithmControls";

const Background = styled.div`
	/* background-color: yellow; */
	width: 100%;
	height: 100%;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	justify-content: center;
	align-items: center;
	padding: 0 2rem;
`;

function PlayControls() {
	return (
		<PlayWindow>
			<PlayWindow.Body>
				<Background>
					<Container>
						<AlgorithmControls />
					</Container>
				</Background>
			</PlayWindow.Body>
		</PlayWindow>
	);
}

export default PlayControls;

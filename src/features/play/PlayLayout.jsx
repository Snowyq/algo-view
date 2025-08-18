import styled from "styled-components";
import PlayDisplayedAlgorithmsArea from "./PlayDisplayedAlgorithmsArea";
import PlayControls from "./PlayControls";
import PlaySidebar from "./PlaySidebar";

const StyledPlayground = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	overflow: hidden;
	/* padding: 1rem 2rem 1rem 1.5rem; */
`;

const Container = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	/* flex-direction: column; */
`;

const PlayMain = styled.div`
	flex-direction: column;
	width: 100%;
	height: 100%;
	display: flex;
`;

const PlayGroup = styled.div`
	display: flex;
	height: 100%;
`;

function PlayLayout() {
	return (
		<StyledPlayground>
			<Container>
				<PlayMain>
					<PlayGroup>
						<PlayDisplayedAlgorithmsArea />
					</PlayGroup>
					<PlayControls />
				</PlayMain>
				<PlaySidebar />
			</Container>
		</StyledPlayground>
	);
}

export default PlayLayout;

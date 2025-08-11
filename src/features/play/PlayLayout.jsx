import styled from "styled-components";

// import DottedBackground from "../../ui/DottedBackground";
import PlayDisplayedAlgorithmsArea from "./PlayDisplayedAlgorithmsArea";
import PlaySidebar from "./PlaySidebar";
import PlayControls from "./PlayControls";
import useWindowSize from "../../hooks/useWindowSize";
import PlaySidebarDesktop from "./PlaySidebarDesktop";
import PlaySidebarMobile from "./PlaySidebarMobile";
import PlayInfo from "./PlayInfo";

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
	const { size } = useWindowSize();

	const Sidebar = size.width > 640 ? PlaySidebarDesktop : PlaySidebarMobile;

	return (
		<StyledPlayground>
			<Container>
				<PlayInfo />
				<PlayMain>
					<PlayGroup>
						<PlayDisplayedAlgorithmsArea />
					</PlayGroup>
					<PlayControls />
				</PlayMain>
				<Sidebar />
			</Container>
		</StyledPlayground>
	);
}

export default PlayLayout;

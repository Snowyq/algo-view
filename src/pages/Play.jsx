import styled from "styled-components";
import BackgroundPattern from "../ui/BackgroundPattern";
import DottedBackground from "../ui/DottedBackground";
import PlayViewArea from "../ui/PlayViewArea";
import PlaySidebar from "../ui/PlaySidebar";
import PlayHeader from "../ui/PlayHeader";

const StyledPlayground = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	padding: 5rem;
`;

const Container = styled.div`
	padding: 5rem;
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 45rem;
	gap: 5rem;
`;

const PlayMain = styled.div`
	display: flex;
	flex-direction: column;
`;

function Play() {
	return (
		<StyledPlayground>
			<DottedBackground
				bg="var(--color-grey-0)"
				color="var(--color-grey-300)"
				size="3px"
				space="3rem"
				borderRadius="5rem"
			>
				<Container>
					<PlayMain>
						<PlayHeader />
						<PlayViewArea />
					</PlayMain>
					<PlaySidebar />
				</Container>
			</DottedBackground>
		</StyledPlayground>
	);
}

export default Play;

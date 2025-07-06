import styled from "styled-components";

// import DottedBackground from "../../ui/DottedBackground";
import PlayDisplayedAlgorithmsArea from "./PlayDisplayedAlgorithmsArea";
import PlaySidebar from "./PlaySidebar";
import PlayHeader from "./PlayHeader";
import PlayControls from "./PlayControls";

const StyledPlayground = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	/* padding: 1rem 2rem 1rem 1.5rem; */
`;

const DottedBackground = styled.div`
	--dot-bg: ${({ bg }) => bg || "white"};
	--dot-color: ${({ color }) => color || "black"};
	--dot-size: ${({ size }) => size || "1px"};
	--dot-space: ${({ space }) => space || "2.5rem"};
	background:
		linear-gradient(
				90deg,
				var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
				transparent 1%
			)
			center / var(--dot-space) var(--dot-space),
		linear-gradient(
				var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
				transparent 1%
			)
			center / var(--dot-space) var(--dot-space),
		var(--dot-color);

	height: 100%;
	width: 100%;
	position: absolute;
	left: 0;
	top: 0;
	/* background-color: yellow; */
	/* box-shadow: 1px 1px 25px 5px var(--color-grey-300); */
	/* border: 5px solid var(--color-grey-100); */
`;

const Container = styled.div`
	padding: 5rem;
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 30rem;
	gap: 5rem;
	margin: 0 auto;
`;

const PlayMain = styled.div`
	display: grid;
	grid-template-rows: 1fr 10rem;
	gap: 5rem;
`;

function PlayLayout() {
	return (
		<StyledPlayground>
			<DottedBackground
				bg="var(--color-grey-100)"
				color="var(--color-grey-400)"
				size="2px"
				space="1.5rem"
			/>
			<Container>
				<PlayMain>
					<PlayDisplayedAlgorithmsArea />
					<PlayControls />
				</PlayMain>
				<PlaySidebar />
			</Container>
			{/* </DottedBackground> */}
		</StyledPlayground>
	);
}

export default PlayLayout;

import styled from "styled-components";

// import DottedBackground from "../../ui/DottedBackground";
import PlayDisplayedAlgorithmsArea from "./PlayDisplayedAlgorithmsArea";
import PlaySidebar from "./PlaySidebar";
import PlayHeader from "./PlayHeader";

const StyledPlayground = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
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
	/* box-shadow: 1px 1px 25px 5px var(--color-grey-300); */
	/* border: 5px solid var(--color-grey-100); */
`;

const Container = styled.div`
	padding: 5rem;
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 40rem;
	gap: 5rem;
`;

const PlayMain = styled.div`
	display: grid;
	grid-template-rows: 1fr;
	gap: 2.5rem;
`;

function PlayLayout() {
	return (
		<StyledPlayground>
			<DottedBackground
				bg="var(--color-grey-100)"
				color="var(--color-grey-400)"
				size="3px"
				space="3rem"
			>
				<Container>
					<PlayMain>
						<PlayDisplayedAlgorithmsArea />
					</PlayMain>
					<PlaySidebar />
				</Container>
			</DottedBackground>
		</StyledPlayground>
	);
}

export default PlayLayout;

import styled from "styled-components";

const StyledBackgroundPattern = styled.div`
	background-color: yellow;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	--dot-bg: #161616;
	--dot-color: #black;
	--dot-size: 1px;
	--dot-space: 50px;
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
`;

const ChildContainer = styled.div``;

function BackgroundPattern({ children, type = "dotted" }) {
	return (
		<StyledBackgroundPattern>
			<ChildContainer>{children}</ChildContainer>
		</StyledBackgroundPattern>
	);
}

export default BackgroundPattern;

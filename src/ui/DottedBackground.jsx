import styled from "styled-components";

const StyledDottedBackground = styled.div`
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
	border-radius: ${({ borderRadius }) => borderRadius || "5rem"};
	box-shadow: 1px 1px 25px 5px var(--color-grey-300);
	border: 5px solid var(--color-grey-100);
`;

function DottedBackground({
	bg = "white",
	color = "black",
	size = "1px",
	space = "2.5rem",
	borderRadius = "5rem",
	children,
}) {
	return (
		<StyledDottedBackground
			bg={bg}
			color={color}
			size={size}
			space={space}
			borderRadius={borderRadius}
		>
			{children}
		</StyledDottedBackground>
	);
}

export default DottedBackground;

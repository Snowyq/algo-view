import styled from "styled-components";

const PlayWindow = styled.div`
	--box-shadow-color: ${({ $boxShadowColor }) =>
		$boxShadowColor || "var(--color-grey-300)"};
	--background-color: ${({ $backgroundColor }) =>
		$backgroundColor || "var(--color-grey-200)"};

	position: relative;
	height: 100%;
	width: 100%;
	background-color: var(--background-color);
	box-shadow: 0.3rem 0.3rem 0px 3px var(--box-shadow-color);
	/* border: 0.75rem solid var(--color-grey-300); */
	border-radius: 2.5rem;
`;

export default PlayWindow;

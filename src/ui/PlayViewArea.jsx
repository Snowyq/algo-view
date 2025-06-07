import styled from "styled-components";

const StyledPlayViewArea = styled.div`
	height: 100%;
	width: 100%;
	background-color: var(--color-grey-0);
	box-shadow: 1px 1px 15px 5px var(--color-grey-200);
	border: 5px solid var(--color-grey-200);
	border-radius: 2.5rem;
`;

function PlayViewArea() {
	return <StyledPlayViewArea></StyledPlayViewArea>;
}

export default PlayViewArea;

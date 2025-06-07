import styled from "styled-components";

const StyledPlayMain = styled.div`
	display: flex;
	flex-direction: column;
`;

function PlayMain({ children }) {
	return <StyledPlayMain>{children}</StyledPlayMain>;
}

export default PlayMain;

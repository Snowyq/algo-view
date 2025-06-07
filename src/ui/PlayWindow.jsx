import styled from "styled-components";

const PlayWindow = styled.div`
	background-color: ${({ color }) => color || "var(--color-grey-50)"};
	box-shadow: 1px 1px 15px 5px var(--color-grey-200);
	border: 5px solid var(--color-grey-200);
	border-radius: 2.5rem;
`;

export default PlayWindow;

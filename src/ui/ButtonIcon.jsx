import styled from "styled-components";

const ButtonIcon = styled.button`
	background: none;
	border: none;
	padding: 0.6rem;
	border-radius: 50%;
	transition: all 0.2s;

	&:hover {
		background-color: var(--color-red-700);
		svg {
			color: var(--color-grey-50);
		}
	}

	& svg {
		width: 2.2rem;
		height: 2.2rem;
		color: var(--color-red-700);
	}
`;

export default ButtonIcon;

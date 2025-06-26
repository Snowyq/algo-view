import styled, { css } from "styled-components";

const variations = {
	default: css`
		--color: var(--color-grey-600);
		--background: var(--color-grey-200);
		--hover-background: var(--color-grey-100);
		--hover-color: var(--color-grey-800);
	`,
	alert: css`
		--color: var(--color-red-700);
		--hover-color: var(--color-red-200);
		--hover-background: var(--color-red-100);
		--hover-color: var(--color-red-800);
	`,
};

const ButtonIcon = styled.button`
	--color: var(--color-grey-600);
	--background: var(--color-grey-200);
	--hover-background: var(--color-grey-100);
	--hover-color: var(--color-grey-800);

	${({ variation = "default" }) => variations[variation]}

	background: none;
	border: none;
	padding: 0.6rem;
	border-radius: 50%;
	transition: all 0.2s;
	background-color: ${({ background }) => background || "var(--background)"};

	&:hover {
		background-color: var(--hover-background);
		svg {
			color: var(--hover-color);
		}
	}

	& svg {
		width: 2.2rem;
		height: 2.2rem;
		color: var(--color);
	}
`;

export default ButtonIcon;

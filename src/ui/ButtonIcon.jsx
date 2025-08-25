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

	--size: ${({ size = "2.2rem" }) => size};
	--padding: ${({ padding = "0.6rem" }) => padding};
	--border: ${({ border = "none" }) => border};
	--border-radius: ${({ $borderRadius = "50%" }) => $borderRadius};

	${({ variation = "default" }) => variations[variation]};
	background: none;
	border: var(--border);
	padding: var(--padding);
	border-radius: var(--border-radius);
	transition: all 0.2s;
	background-color: ${({ background }) => background || "var(--background)"};

	@media (hover: hover) and (pointer: fine) {
		&:hover {
			background-color: var(--hover-background);
			svg {
				color: var(--hover-color);
			}
		}
	}

	& svg {
		width: var(--size);
		height: var(--size);
		color: var(--color);
	}
`;

export default ButtonIcon;

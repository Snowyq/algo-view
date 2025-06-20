import styled, { css } from "styled-components";

const sizes = {
	small: css`
		font-size: 1.4rem;
		padding: 0.8rem 0.8rem;
		text-transform: uppercase;
		font-weight: 600;
		text-align: center;
	`,
	medium: css`
		font-size: 1.6rem;
		padding: 1.6rem 1.6rem;
		font-weight: 500;
	`,
	large: css`
		font-size: 1.8rem;
		padding: 2.4rem 2.4rem;
		font-weight: 500;
	`,
	xlarge: css`
		font-size: 2rem;
		padding: 2.8rem 2.8rem;
		font-weight: 500;
	`,
};

const variations = {
	primary: css`
		color: var(--color-brand-50);
		background-color: var(--color-brand-600);

		&:hover {
			background-color: var(--color-brand-700);
		}
	`,
	secondary: css`
		color: var(--color-grey-600);
		background: var(--color-grey-0);
		border: 1px solid var(--color-grey-200);

		&:hover {
			background-color: var(--color-grey-50);
		}
	`,
	danger: css`
		color: var(--color-red-100);
		background-color: var(--color-red-700);

		&:hover {
			background-color: var(--color-red-800);
		}
	`,
	close: css`
		color: var(--color-grey-600);
		background-color: var(--color-red-100);
		&:hover {
			background-color: var(--color-red-700);
		}
	`,
};

const CircleButton = styled.button`
	border: none;
	border-radius: 50%;
	box-shadow: var(--shadow-lg);

	${({ size = "medium" }) => sizes[size]}
	${({ variation = "primary" }) => variations[variation]}
`;

export default CircleButton;

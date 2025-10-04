import styled, { css } from "styled-components";

const optionsStates = {
	opened: css`
		visibility: visible;
		box-shadow: 0.45rem 0.45rem 0px 4px var(--color-grey-400);
		/* translate: -0.3rem -0.3rem; */
		translate: -0.18rem -0.18rem;
	`,
	closed: css`
		box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300);
		height: 0;
		visibility: hidden;
	`,
};

const StyledOptions = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;
	padding-top: ${({ $paddingTop }) => $paddingTop + "px"};
	border-radius: 15px;
	/* box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300); */
	overflow: hidden;
	top: 0;
	transition:
		box-shadow 0.5s,
		translate 0.3s,
		height 0.3s;
	width: 100%;

	z-index: -1;
	background-color: var(--color-grey-100);
	${({ $isOpened }) => optionsStates[$isOpened ? "opened" : "closed"]}
`;

function Options({ options, optionClick, isOpened, paddingTop, selected }) {
	return (
		<StyledOptions $isOpened={isOpened} $paddingTop={paddingTop}>
			{options.map(option =>
				generateOptionWithOverlay(option, optionClick, selected)
			)}
		</StyledOptions>
	);
}

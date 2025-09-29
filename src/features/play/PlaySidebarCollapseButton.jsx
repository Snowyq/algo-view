import styled, { css } from "styled-components";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
const CollapseButton = styled.button`
	--border-color: var(--color-grey-300);
	--border-radius: 2rem;

	border: none;
	background-color: var(--color-grey-50);
	font-size: ${({ $fontSize = "2rem" }) => $fontSize};
	padding: 0.2em 0.2em;
	position: absolute;
	right: 0;

	box-shadow: 1px 4px 0px -1px var(--color-grey-400);

	border-top-left-radius: var(--border-radius);
	border-bottom-left-radius: var(--border-radius);
	border-top: 3px solid var(--border-color);
	border-bottom: 3px solid var(--border-color);
	border-left: 3px solid var(--border-color);
`;

const arrowStates = {
	hidden: css``,
	visible: css`
		rotate: 180deg;
	`,
};
const ArrowCollapse = styled.div`
	position: absolute;
	font-size: 2rem;
	top: 50%;
	left: 10%;
	translate: 0 -50%;
	transition: rotate 0.5s;

	${({ state }) => arrowStates[state]}
`;

function PlaySidebarCollapseButton({ onClick, state }) {
	return (
		<CollapseButton onClick={onClick} $fontSize={"2.6rem"}>
			<ArrowCollapse state={state}>
				<IoIosArrowBack />
			</ArrowCollapse>
			<BsLayoutSidebarReverse />
		</CollapseButton>
	);
}

export default PlaySidebarCollapseButton;

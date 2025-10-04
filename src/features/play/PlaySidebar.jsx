import styled, { css } from "styled-components";
import { useState } from "react";

import PlaySelectAlgorithms from "./PlaySelectAlgorithms";
import PlayConfigSortInput from "./PlayConfigInput";
import PlaySidebarCollapseButton from "./PlaySidebarCollapseButton";
import PlaySidebarItem from "./PlaySidebarItem";

const sidebarStates = {
	hidden: css`
		border-left: 0 solid transparent;
		width: 0;
	`,
	visible: css`
		width: 35rem;
	`,
};

const Sidebar = styled.div`
	--sidebar-border-width: 3px;
	position: absolute;
	@media screen and (min-width: 640px) {
		position: relative;
	}
	right: 0;
	transition:
		width 0.3s,
		border-left 0.3s;
	height: 100%;
	background-color: var(--color-grey-100);
	border-left: var(--sidebar-border-width) solid var(--color-grey-300);
	z-index: 100000;
	${({ state }) => sidebarStates[state]}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	padding: 2rem 2rem;
	height: 100%;

	gap: 1.5rem;
`;

const Header = styled.div``;

const SidebarOutlet = styled.div`
	width: 35rem;
	overflow: hidden;

	height: 100%;
`;

const CollapseButtonHolder = styled.div`
	--margin-right: 0rem;
	--margin-top: 1rem;
	--right-hidden: calc(100% + var(--margin-right));
	--right-visible: calc(
		100% + var(--margin-right) + var(--sidebar-border-width)
	);

	position: absolute;
	right: ${({ state }) =>
		`var(${state === "hidden" ? "--right-hidden" : "--right-visible"})`};
	top: var(--margin-top);
`;

function PlaySidebar() {
	const [isOpen, setIsOpen] = useState(false);
	const state = isOpen ? "visible" : "hidden";

	const toggleOpen = () => {
		setIsOpen(x => !x);
	};

	return (
		<Sidebar state={state}>
			<CollapseButtonHolder state={state}>
				<PlaySidebarCollapseButton onClick={toggleOpen} state={state} />
			</CollapseButtonHolder>

			<SidebarOutlet state={state}>
				<Container>
					<Header>
						<h3>Visualizer Config</h3>
					</Header>
					<PlaySidebarItem title="Configure input">
						<PlayConfigSortInput />
					</PlaySidebarItem>
					<PlaySidebarItem title="Select Algorithms">
						<PlaySelectAlgorithms />
					</PlaySidebarItem>
				</Container>
			</SidebarOutlet>
		</Sidebar>
	);
}

export default PlaySidebar;

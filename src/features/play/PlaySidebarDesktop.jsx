import styled, { css } from "styled-components";
import PlaySidebar from "./PlaySidebar";
import PlayWindow from "./PlayWindow";
import ButtonIcon from "../../ui/ButtonIcon";
import { GoSidebarCollapse } from "react-icons/go";
import { useContext, useEffect, useRef, useState } from "react";
import { BsLayoutSidebarReverse, BsPinAngleFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { PlayContext } from "./PlayContext";
import PlaySelectCategory from "./PlaySelectCategory";
import PlaySelectAlgorithms from "./PlaySelectAlgorithms";

const sidebarStates = {
	hidden: css`
		width: 0;
	`,
	visible: css`
		/* width: 30%;
		/* min-width: 20rem; */
		width: 30rem;
	`,
};

const Sidebar = styled.div`
	--sidebar-border-width: 3px;
	position: absolute;
	position: relative;
	right: 0;
	transition: width 0.3s;
	height: 100%;
	background-color: var(--color-grey-100);
	border-left: var(--sidebar-border-width) solid var(--color-grey-300);
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
	width: 30rem;
	overflow: hidden;

	height: 100%;
`;

const CollapseButtonHolder = styled.div`
	--margin-right: 0rem;
	--margin-top: 1rem;

	position: absolute;
	right: calc(100% + var(--margin-right) + var(--sidebar-border-width));
	top: var(--margin-top);
`;

const CollapseButton = styled.button`
	--border-color: var(--color-grey-200);
	--border-radius: 2rem;

	border: none;
	background-color: var(--color-grey-50);
	font-size: ${({ $fontSize = "2rem" }) => $fontSize};
	padding: 0.2em 0.2em;
	position: absolute;
	right: 0;

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

function PlaySidebarDesktop() {
	const [isOpen, setIsOpen] = useState(false);
	const state = isOpen ? "visible" : "hidden";

	const open = () => {
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
	};

	const toggleOpen = () => {
		setIsOpen(x => !x);
	};

	const {
		activeCategory,
		activeAlgorithms,
		changeActiveAlgorithms,
		openAlgorithm,
		closeAlgorithm,
		changeActiveCategory,
		categories,
		algorithms,
	} = useContext(PlayContext);

	const categoriesOptions = categories.map(cat => {
		return { value: cat.id, label: cat.name };
	});

	const algorithmsOptions = algorithms.map(algo => {
		return { value: algo.id, label: algo.meta.name };
	});

	const handleCategoryChange = e => {
		changeActiveCategory(e.target.value);
	};

	const handleAlgorithmSelect = option => {
		openAlgorithm(option.value);
	};

	const handleAlgorithmDeselect = option => {
		closeAlgorithm(option.value);
	};

	const handleAlgorithmsChange = options => {
		const ids = options.map(option => option.value);
		changeActiveAlgorithms(ids);
	};

	return (
		<Sidebar state={state}>
			<CollapseButtonHolder>
				<CollapseButton onClick={toggleOpen} $fontSize={"2.6rem"}>
					<ArrowCollapse state={state}>
						<IoIosArrowBack />
					</ArrowCollapse>
					<BsLayoutSidebarReverse />
				</CollapseButton>
			</CollapseButtonHolder>

			<SidebarOutlet state={state}>
				<Container>
					<Header>
						<h3>Visualizer Config</h3>
					</Header>
					<PlaySelectCategory
						options={categoriesOptions}
						selected={activeAlgorithms}
						onChange={handleCategoryChange}
					/>
					<PlaySelectAlgorithms />
				</Container>
			</SidebarOutlet>
		</Sidebar>
	);
}

export default PlaySidebarDesktop;

import styled, { css } from "styled-components";
import PlaySidebar from "./PlaySidebar";
import PlayWindow from "./PlayWindow";
import ButtonIcon from "../../ui/ButtonIcon";
import { GoSidebarCollapse } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import { BsLayoutSidebarReverse, BsPinAngleFill } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";

const sidebarStates = {
	hidden: css`
		width: 0;
	`,
	visible: css`
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
	padding: 0 2rem;
	height: 100%;

	gap: 1rem;
`;

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

const PinCollapse = styled.div`
	position: absolute;
	font-size: 1.6rem;
	top: 50%;
	left: 20%;
	translate: 0 -50%;
	transition: rotate 0.5s;

	${({ state }) => arrowStates[state]}
`;

function PlaySidebarDesktop() {
	const [isOpen, setIsOpen] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const [isMouseNearby, setIsMouseNearby] = useState(false);
	const sidebarRef = useRef(null);
	const state = isOpen ? "visible" : "hidden";

	const intervalRef = useRef(null);

	const handleMove = e => {
		const { clientX } = e;
		if (window.innerWidth - clientX < 20) {
			open();
			setIsMouseNearby(true);
		}
	};

	const open = () => {
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
		setIsMouseNearby(false);
	};

	const toggleOpen = () => {
		setIsMouseNearby(false);
		setIsOpen(x => !x);
	};

	const handleMouseLeave = e => {
		if (isMouseNearby) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			intervalRef.current = setInterval(close, 1000);
		}
	};

	const handleMouseEnter = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
	};

	useEffect(() => {
		window.addEventListener("mousemove", handleMove);
	});

	return (
		<Sidebar
			state={state}
			ref={sidebarRef}
			onMouseLeave={handleMouseLeave}
			onMouseEnter={handleMouseEnter}
		>
			<CollapseButtonHolder>
				<CollapseButton onClick={toggleOpen} $fontSize={"2.6rem"}>
					<ArrowCollapse state={state}>
						<IoIosArrowBack />
					</ArrowCollapse>
					<BsLayoutSidebarReverse />
				</CollapseButton>
				<CollapseButton onClick={toggleOpen}>
					<PinCollapse>
						<BsPinAngleFill />
					</PinCollapse>
					<BsLayoutSidebarReverse />
				</CollapseButton>
			</CollapseButtonHolder>

			<SidebarOutlet state={state}>
				<Container>
					<PlaySidebar />
				</Container>
			</SidebarOutlet>
		</Sidebar>
	);
}

export default PlaySidebarDesktop;

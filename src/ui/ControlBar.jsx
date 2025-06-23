import styled from "styled-components";
import { useDraggable } from "../hooks/useDraggable";
import { useRef } from "react";
import { useRect } from "../hooks/useRect";
import { minmax } from "../utils/minmax";

const StyledControlBar = styled.div`
	--dot-size: 2rem;

	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--color-grey-400);
`;

const Bar = styled.div`
	height: 10px;
	width: calc(100% - var(--dot-size));
	position: relative;
`;

const Dot = styled.div`
	background-color: var(--color-grey-300);
	width: var(--dot-size);
	height: var(--dot-size);
	border-radius: 50%;
	position: absolute;
	left: ${({ progress }) => `calc(${progress})`};
	top: 50%;
	translate: -50% -50%;
	border: 5px solid var(--color-grey-50);
	box-shadow: 2px 2px 0px 1px var(--color-grey-300);
`;

function ControlBar({ progress, isDraggable, updateProgress }) {
	const { parentRef, ref, position } = useDraggable({
		onDrag,
	});

	function onDrag(position, targetRect, targetParentRect) {
		const relX = position.x - targetParentRect.x;
		const rawProgress = (relX / targetParentRect.width) * 100;
		const newProgress = minmax(rawProgress, 0, 100);

		updateProgress(newProgress);
	}

	return (
		<StyledControlBar>
			<Bar ref={parentRef}>
				<Dot progress={"100%"} ref={ref} position={position} />
			</Bar>
		</StyledControlBar>
	);
}

export default ControlBar;

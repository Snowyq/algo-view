import styled from "styled-components";
import { useRect } from "../hooks/useRect";
import { useCallback, useEffect, useRef, useState } from "react";
import useRateLimit from "../hooks/useRateLimit";
import { clamp } from "../utils/values";

const StyledSlider = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	gap: 2rem;
	background-color: var(--color-grey-400);
	/* padding-left: ${({ size }) => size / 2 + "px"};
	padding-right: ${({ size }) => size / 2 + "px"}; */
`;

const Dot = styled.div`
	position: absolute;
	background-color: var(--color-grey-50);
	border-radius: 50%;
	width: ${({ size }) => size + "px"};
	height: ${({ size }) => size + "px"};

	top: 50%;
	translate: -50% -50%;
	z-index: 1;
	box-shadow: 1px 1px 0px 1px var(--color-grey-400);
	cursor: pointer;

	&::before {
		content: "";
		position: absolute;
		left: 3px;
		right: 3px;
		top: 3px;
		bottom: 3px;
		z-index: -10;
		border-radius: 50%;
		background-color: var(--color-grey-500);
	}
`;
const DotContainer = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	cursor: pointer;
`;

const Display = styled.div`
	position: absolute;
	top: calc(-100% - 1.2rem);
	left: 50%;
	translate: -50% 0;
	background-color: var(--color-grey-600);
	border-radius: 5px;
	padding: 0 0.3rem;
	color: white;
	opacity: ${({ $isDragging }) => ($isDragging ? 1 : 0)};
	pointer-events: none;

	${Dot}:hover & {
		opacity: 1;
	}
`;

function Slider({
	onChange,
	onMouseUp,
	onChangeInterval = 100,
	display,
	progress: stateProgress,
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [isInitialized, setIsInitialized] = useState(true);

	const dotRef = useRef();
	const { ref: dotContainerRef, rect: dotContainerRect } = useRect();
	const limitedOnChange = useRateLimit(onChange, onChangeInterval);

	const moveDot = useCallback(
		progress => {
			if (!dotRef.current || !dotContainerRect) return;
			const clampedProgress = clamp(progress, 0, 1);
			const percent = clampedProgress * 100;
			dotRef.current.style.left = percent + "%";
		},
		[dotContainerRect, dotRef]
	);

	const calculateProgress = useCallback(
		event => {
			const x = event.clientX - dotContainerRect.left;
			const progress = clamp(x / dotContainerRect.width, 0, 1);
			return progress;
		},
		[dotContainerRect]
	);

	const handleMouseDown = e => {
		const progress = calculateProgress(e);
		moveDot(progress);
		limitedOnChange?.(progress);
		setIsDragging(true);
		e.preventDefault();
	};

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		onMouseUp?.();
	}, [onMouseUp]);

	const handleMouseMove = useCallback(
		e => {
			if (!isDragging) return;
			const progress = calculateProgress(e);
			moveDot(progress);
			limitedOnChange?.(progress);
		},
		[isDragging, calculateProgress, limitedOnChange, moveDot]
	);

	const addListeners = useCallback(() => {
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}, [handleMouseMove, handleMouseUp]);

	const removeListeners = useCallback(() => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	}, [handleMouseMove, handleMouseUp]);

	useEffect(() => {
		if (isDragging) addListeners();
		else removeListeners();
		return removeListeners;
	}, [isDragging, removeListeners, addListeners]);

	useEffect(() => {
		moveDot(stateProgress);
	}, [stateProgress, moveDot]);

	return (
		<StyledSlider>
			<DotContainer ref={dotContainerRef} onMouseDown={handleMouseDown}>
				<Dot
					size={16}
					ref={dotRef}
					onMouseDown={handleMouseDown}
					$isInitialized={isInitialized}
				>
					<Display $isDragging={isDragging}>{display}</Display>
				</Dot>
			</DotContainer>
		</StyledSlider>
	);
}

export default Slider;

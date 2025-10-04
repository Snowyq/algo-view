import styled, { css } from "styled-components";
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

const DotContainer = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
	cursor: pointer;
`;

const displayStates = {
	show: css`
		opacity: 0.5;
	`,
	drag: css`
		opacity: 1;
	`,
	hide: css`
		opacity: 0;
	`,
};

const Display = styled.div`
	position: absolute;
	top: calc(-100% - 1.2rem);
	/* left: 50%; */
	/* translate: -50% 0; */
	background-color: var(--color-grey-600);
	border-radius: 5px;
	padding: 0 0.3rem;
	color: white;
	/* opacity: ${({ $isDragging }) => ($isDragging ? 1 : 0)}; */
	pointer-events: none;

	${Dot}:hover & {
		opacity: 1;
	}

	${({ state }) => displayStates[state]}
`;

function Slider({
	onChange,
	onMouseUp,
	onChangeInterval = 100,
	progress: stateProgress,
	showDisplay = true,
	calculateDisplay,
	max,
	min,
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const displayState = !isHovered ? "hide" : isDragging ? "drag" : "show";
	const [display, setDisplay] = useState(
		calculateDisplay ? calculateDisplay(stateProgress) : 0
	);

	const dotRef = useRef();
	const displayRef = useRef();
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

	const moveDisplay = useCallback(
		progress => {
			if (!displayRef.current || !dotContainerRect) return;
			const clampedProgress = clamp(progress, 0, 1);
			const percent = clampedProgress * 100;
			displayRef.current.style.left = percent + "%";
		},
		[dotContainerRect, displayRef]
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
			if (!isHovered) return;
			const progress = calculateProgress(e);

			moveDisplay(progress);
			setDisplay(calculateDisplay(progress, min, max));

			if (isDragging) {
				moveDot(progress);
				limitedOnChange?.(progress);
			}
		},
		[isDragging, calculateProgress, limitedOnChange, moveDot, displayState]
	);

	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
	}, []);

	const removeListeners = useCallback(() => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	}, [handleMouseMove, handleMouseUp]);

	useEffect(() => {
		if (isHovered) {
			document.addEventListener("mousemove", handleMouseMove);
		}

		if (isDragging) {
			document.addEventListener("mouseup", handleMouseUp);
		}

		if (!isHovered) {
			removeListeners();
		}

		return removeListeners;
	}, [
		isDragging,
		isHovered,
		handleMouseMove,
		handleMouseUp,
		removeListeners,
	]);

	useEffect(() => {
		moveDot(stateProgress);
	}, [stateProgress, moveDot]);

	return (
		<StyledSlider>
			<DotContainer
				ref={dotContainerRef}
				onMouseDown={handleMouseDown}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<Dot size={16} ref={dotRef} onMouseDown={handleMouseDown} />
				<Display
					ref={displayRef}
					state={displayState}
					show={isHovered}
					$isDragging={isDragging}
				>
					{display}
				</Display>
			</DotContainer>
		</StyledSlider>
	);
}

export default Slider;

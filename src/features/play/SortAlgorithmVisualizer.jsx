import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import useAlgorithm from "../../hooks/useAlgorithm";
import { PlayContext } from "./PlayContext";
import { useRect } from "../../hooks/useRect";
import { FaPlay } from "react-icons/fa6";
import ButtonIcon from "../../ui/ButtonIcon";
import AlgorithmControls from "./AlgorithmControls";
import { valueBetween } from "../../utils/valueBetween";
import useSortAlgorithm from "../../hooks/useAlgorithm";

const variations = {
	swap: css`
		--background-color: var(--color-blue-400);
		--background-color-hover: var(--color-blue-300);
		--box-shadow-color: var(--color-blue-500);
		--color: var(--color-blue-800);
		--dot-color: var(--color-blue-500);
	`,
	select: css`
		--background-color: var(--color-pink-400);
		--background-color-hover: var(--color-pink-300);
		--box-shadow-color: var(--color-pink-500);
		--color: var(--color-pink-800);
		--dot-color: var(--color-pink-500);
	`,
	check: css`
		--background-color: var(--color-yellow-400);
		--background-color-hover: var(--color-yellow-300);
		--box-shadow-color: var(--color-yellow-500);
		--color: var(--color-yellow-800);
		--dot-color: var(--color-yellow-500);
	`,
	finish: css`
		--background-color: var(--color-cyan-400);
		--background-color-hover: var(--color-cyan-300);
		--box-shadow-color: var(--color-cyan-500);
		--color: var(--color-cyan-800);
		--dot-color: var(--color-cyan-500);
	`,
	"check-false": css`
		--background-color: var(--color-red-400);
		--background-color-hover: var(--color-red-300);
		--box-shadow-color: var(--color-red-500);
		--color: var(--color-red-800);
		--dot-color: var(--color-red-500);
	`,
	"check-true": css`
		--background-color: var(--color-green-400);
		--background-color-hover: var(--color-green-300);
		--box-shadow-color: var(--color-green-500);
		--color: var(--color-green-800);
		--dot-color: var(--color-green-500);
	`,
};

const Block = styled.div`
	--background-color: var(--color-grey-300);
	--background-color-hover: var(--color-grey-200);
	--box-shadow-color: var(--color-grey-400);
	--color: var(--color-grey-800);
	--dot-color: var(--color-grey-400);

	position: relative;
	width: ${({ $blockWidth }) => $blockWidth};
	height: ${({ $blockHeight }) => $blockHeight};
	background-color: var(--background-color);
	border-radius: 0.8rem;
	display: flex;
	justify-content: center;
	align-items: end;
	font-weight: 600;
	box-shadow: 3px 3px 0px 1px var(--box-shadow-color);
	transition:
		margin 0.5s,
		width 0.3s;
	min-width: 0;
	flex-shrink: 1;
	flex-grow: 0;

	&::after {
		content: "";
		position: absolute;
		background-color: var(--background-color-hover);
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		scale: 0;
		border-radius: 0.8rem;
	}

	&::before {
		content: "";
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--dot-color);
		left: 50%;
		translate: -50% 0;
		bottom: -2rem;
		opacity: 0;
	}

	p {
		opacity: ${({ $showBlockValues }) => ($showBlockValues ? 1 : 0)};
		visibility: ${({ $showBlockValues }) =>
			$showBlockValues ? "visible" : "hidden"};
		width: ${({ $showBlockValues }) => ($showBlockValues ? "auto" : 0)};
		z-index: 10;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		margin: 0;
		transition: opacity 0.5s ease;
	}

	&:hover {
		transition-delay: 0.7s;
		cursor: pointer;

		${({ $blockValueDisplayThreshold: x, $showBlockValues }) => {
			if (!$showBlockValues)
				return css`
					margin: 0 0.25rem;
					width: ${x};
				`;
		}};

		p {
			opacity: 1;
			visibility: visible;
			transition-delay: 0.7s;
			width: auto;
		}

		&::after {
			scale: 1;
			transition: 0.7s;
			transition-delay: 0.2s;
		}

		&::before {
			opacity: 1;
		}
	}

	${({ type }) => variations[type]};
`;

const BlockArea = styled.div`
	width: 100%;
	max-width: 100%;
	height: 100%;
	display: flex;
	align-items: end;

	gap: ${({ $gapWidth }) => $gapWidth};
`;

const calculateBlockGapWidths = (blocksNum, blockProportion = 0.7) => {
	const fixedBlockProportion = valueBetween(blockProportion, 0, 1);
	const gapProportion = 1 - fixedBlockProportion;
	const blockWidth = (100 / blocksNum) * fixedBlockProportion;
	const gapWidth = (100 / (blocksNum - 1)) * gapProportion;

	return { gapWidth, blockWidth };
};

const isDisplayBlockValueVisible = (areaWidth, blockWidth, threshold) => {
	return (areaWidth * blockWidth) / 100 > threshold;
};

const DEFAULT_BLOCK_VALUE_DISPLAY_THRESHOLD = 30; // px

function SortAlgorithmVisualizer({
	registry,
	input,
	stepIndex = 0,
	blockValueDisplayThreshold = DEFAULT_BLOCK_VALUE_DISPLAY_THRESHOLD,
	passStepsLength,
}) {
	const [currStepIndex, setCurrStepIndex] = useState(stepIndex);
	const { ref: blockAreaRef, rect: blockAreaRect } = useRect();
	const { getState, getStep, getArrayLength, getMaxValue, getStepsLength } =
		useSortAlgorithm(registry.Class, input);
	console.log(currStepIndex);
	const currentStep = getStep(currStepIndex);
	const arrayLength = getArrayLength();
	const stepsLength = getStepsLength();

	useEffect(() => {
		passStepsLength(stepsLength);
	}, [stepsLength, passStepsLength]);

	useEffect(() => {
		setCurrStepIndex(() => {
			if (stepIndex >= stepsLength - 1) return stepsLength - 1;
			else if (stepIndex <= 0) return 0;
			else return stepIndex;
		});
	}, [stepIndex, stepsLength]);

	const { blockWidth, gapWidth } = useMemo(
		() => calculateBlockGapWidths(arrayLength, 0.6),
		[arrayLength]
	);

	const showBlockValues = useMemo(
		() =>
			isDisplayBlockValueVisible(
				blockAreaRect.width,
				blockWidth,
				blockValueDisplayThreshold
			),
		[blockAreaRect, blockWidth, blockValueDisplayThreshold]
	);

	return (
		<>
			<BlockArea
				ref={blockAreaRef}
				$gapWidth={gapWidth + "%"}
				$arrayLength={arrayLength}
				$blockWidth={blockWidth + "%"}
			>
				{getState(currStepIndex).map((val, index) => {
					const isActive = currentStep.activeItems.includes(index);
					const isSelected = currentStep.selected.filter(
						el => el.index === index
					).length;
					let type = isSelected ? "select" : "default";
					type = isActive ? currentStep.type : type;
					const maxVal = getMaxValue();
					const blockHeight =
						val === 0
							? ((val + 1) / 2 / maxVal) * 100
							: (val / maxVal) * 100;

					return (
						<Block
							$blockWidth={blockWidth + "%"}
							$blockHeight={blockHeight + "%"}
							type={type}
							key={index}
							$showBlockValues={showBlockValues}
							$blockValueDisplayThreshold={
								blockValueDisplayThreshold + "px"
							}
						>
							<p>{val}</p>
						</Block>
					);
				})}
			</BlockArea>
		</>
	);
}

export default SortAlgorithmVisualizer;

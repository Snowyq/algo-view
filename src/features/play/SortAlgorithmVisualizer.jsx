import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import useAlgorithm from "../../hooks/useAlgorithm";
import { PlayContext } from "./PlayContext";
import { useRect } from "../../hooks/useRect";
import { FaPlay } from "react-icons/fa6";
import ButtonIcon from "../../ui/ButtonIcon";
import AlgorithmControls from "./AlgorithmControls";
import { valueBetween } from "../../utils/valueBetween";

const variations = {
	swap: css`
		background-color: var(--color-blue-400);
		box-shadow: 3px 3px 0px 1px var(--color-blue-700);
		color: var(--color-blue-800);
	`,
	select: css`
		background-color: var(--color-grey-400);
		box-shadow: 3px 3px 0px 1px var(--color-grey-700);
		color: var(--color-grey-800);
	`,
	check: css`
		background-color: var(--color-yellow-400);
		box-shadow: 3px 3px 0px 1px var(--color-yellow-700);
		color: var(--color-yellow-800);
	`,
	finish: css`
		background-color: var(--color-cyan-400);
		box-shadow: 3px 3px 0px 1px var(--color-cyan-700);
		color: var(--color-cyan-800);
	`,
	"check-false": css`
		background-color: var(--color-red-400);
		box-shadow: 3px 3px 0px 1px var(--color-red-700);
		color: var(--color-red-800);
	`,
	"check-true": css`
		background-color: var(--color-green-400);
		box-shadow: 3px 3px 0px 1px var(--color-green-700);
		color: var(--color-green-800);
	`,
};
const Block = styled.div`
	grid-column: span 1;
	grid-row: span ${({ val }) => val} / -1;
	background-color: var(--color-grey-300);
	border-radius: 0.8rem;
	color: white;
	display: flex;
	justify-content: center;
	align-items: end;
	font-weight: 600;
	box-shadow: 3px 3px 0px 1px var(--color-grey-400);
	width: auto;
	transition: scale 0.3s;

	&:hover {
		scale: 1.2;
	}

	${({ type }) => variations[type]};
`;

const BlockArea = styled.div`
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: ${({ $blockWidth, $maxValue }) =>
		`repeat(${$maxValue}, ${$blockWidth})`};
	grid-template-columns: ${({ $blockWidth, $arrayLength }) =>
		`repeat(${$arrayLength}, ${$blockWidth})`};
	grid-gap: 0 ${({ $gapWidth }) => `${$gapWidth}`};
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
	blockValueDisplayThreshold = DEFAULT_BLOCK_VALUE_DISPLAY_THRESHOLD,
}) {
	const { ref: blockAreaRef, rect: blockAreaRect } = useRect();

	const AlgorithmClass = registry.Class;
	const Algorithm = new AlgorithmClass(input);
	const stepsLength = Algorithm.getStepsLength();
	const [currentStepIndex, setCurrentStepIndex] = useState(stepsLength - 1);
	const displayedState = Algorithm.getStateByStepsIndex(currentStepIndex);
	const currentStep = Algorithm.getStepByIndex(currentStepIndex);
	const arrayLength = Algorithm.getArrayLength();
	const { min: arrayMin, max: arrayMax } = Algorithm.getArrayMinMax();

	const progress = (currentStepIndex / (stepsLength - 1)) * 100;

	const { blockWidth, gapWidth } = useMemo(
		() => calculateBlockGapWidths(arrayLength, 0.7),
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

	const updateProgress = useCallback(
		newProgress => {
			const newStepIndex = Math.round(
				(newProgress / 100) * (stepsLength - 1)
			);
			setCurrentStepIndex(newStepIndex);
		},
		[stepsLength]
	);

	return (
		<>
			<BlockArea
				ref={blockAreaRef}
				$gapWidth={gapWidth + "%"}
				$arrayLength={arrayLength}
				$blockWidth={blockWidth + "%"}
			>
				{displayedState.map((val, index) => {
					const isActive = currentStep.activeItems.includes(index);
					const isSelected = currentStep.selected.filter(
						el => el.index === index
					).length;
					let type = isSelected ? "select" : "default";
					type = isActive ? currentStep.type : type;
					return (
						<Block
							$blockWidth={"3px"}
							$minValue={arrayMin}
							$maxValue={arrayMax}
							type={type}
							index={index}
							key={index}
							val={val}
							$showBlockValues={showBlockValues}
							$blockValueDisplayThreshold={
								blockValueDisplayThreshold
							}
						>
							{showBlockValues ? val : ""}
						</Block>
					);
				})}
			</BlockArea>
		</>
	);
}

export default SortAlgorithmVisualizer;

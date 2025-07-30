import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { useRect } from "../../hooks/useRect";
import { valueBetween } from "../../utils/valueBetween";
import SortArrayBlock from "./SortArrayBlock";

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

function SortArrayDisplay({
	step,
	arrayLength,
	blockValueDisplayThreshold = DEFAULT_BLOCK_VALUE_DISPLAY_THRESHOLD,
	state,
	maxValue,
}) {
	const { ref: blockAreaRef, rect: blockAreaRect } = useRect();

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
				{state.map((val, index) => {
					const isActive = step.activeItems.includes(index);
					const isSelected = step.selected.filter(
						el => el.index === index
					).length;
					let type = isSelected ? "select" : "default";
					type = isActive ? step.type : type;
					const blockHeight =
						val === 0
							? ((val + 1) / 2 / maxValue) * 100
							: (val / maxValue) * 100;

					return (
						<SortArrayBlock
							key={index}
							val={val}
							index={index}
							arrayLength={arrayLength}
							blockWidth={blockWidth}
							blockHeight={blockHeight}
							type={type}
							showBlockValues={showBlockValues}
							blockValueDisplayThreshold={
								blockValueDisplayThreshold
							}
						/>
					);
				})}
			</BlockArea>
		</>
	);
}

export default SortArrayDisplay;

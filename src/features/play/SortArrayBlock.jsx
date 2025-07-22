import React from "react";
import styled, { css } from "styled-components";

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

const Value = styled.div`
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
`;

const Block = styled.div`
	--background-color: var(--color-grey-300);
	--background-color-hover: var(--color-grey-200);
	--box-shadow-color: var(--color-grey-400);
	--color: var(--color-grey-800);
	--dot-color: var(--color-grey-400);

	position: relative;
	width: ${({ $blockWidth }) => $blockWidth};
	min-width: 0;
	height: ${({ $blockHeight }) => $blockHeight};

	display: flex;
	justify-content: center;
	align-items: end;
	flex-shrink: 1;
	flex-grow: 0;

	background-color: var(--background-color);
	border-radius: 0.8rem;
	font-weight: 600;
	box-shadow: 3px 3px 0px 1px var(--box-shadow-color);

	transition:
		margin 0.5s,
		width 0.3s;

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
		display: none;
	}

	&:hover {
		transition-delay: 0.7s;
		cursor: pointer;

		${({
			$blockValueDisplayThreshold: x,
			$showBlockValues,
			index,
			$arrayLength,
		}) => {
			if (!$showBlockValues)
				return css`
					margin: ${index === 0
						? "0 0.25rem 0 0"
						: $arrayLength - 1 === index
							? "0 0 0 .25rem"
							: "0 0.25rem"};
					width: ${x};
				`;
		}};

		${Value} {
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
			display: block;
		}
	}

	${({ type }) => variations[type]};
`;

const SortArrayBlock = React.memo(
	function SortArrayBlock({
		val,
		index,
		arrayLength,
		blockWidth,
		blockHeight,
		type,
		showBlockValues,
		blockValueDisplayThreshold,
	}) {
		return (
			<Block
				$blockWidth={blockWidth + "%"}
				$blockHeight={blockHeight + "%"}
				type={type}
				index={index}
				$arrayLength={arrayLength}
				key={index}
				$showBlockValues={showBlockValues}
				$blockValueDisplayThreshold={blockValueDisplayThreshold + "px"}
			>
				<Value
					$showBlockValues={showBlockValues}
					$blockValueDisplayThreshold={
						blockValueDisplayThreshold + "px"
					}
				>
					{val}
				</Value>
			</Block>
		);
	},
	(prev, next) =>
		prev.val === next.val &&
		prev.type === next.type &&
		prev.blockHeight === next.blockHeight &&
		prev.showBlockValues === next.showBlockValues
);

export default SortArrayBlock;

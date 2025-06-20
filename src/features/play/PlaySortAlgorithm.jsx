import { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";

const variations = {
	swap: css`
		background-color: var(--color-blue-500);
	`,
	select: css`
		background-color: var(--color-grey-500);
	`,
	check: css`
		background-color: var(--color-yellow-500);
	`,
	finish: css`
		background-color: var(--color-cyan-500);
	`,
	"check-false": css`
		background-color: var(--color-red-500);
	`,
	"check-true": css`
		background-color: var(--color-green-500);
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
	padding: 0.5rem 0;

	${({ type }) => variations[type]}
`;

const BlockArea = styled.div`
	display: grid;
	height: 100%;
	width: 100%;

	grid-template-rows: repeat(20, 1fr);
	grid-template-columns: repeat(50, 1fr);
	grid-gap: 0 0.2%;
`;

function PlaySortAlgorithm({ algorithm }) {
	const [options, setOptions] = useState({
		check: false,
		"check-true": false,
		"check-false": false,
		select: true,
	});

	useEffect(() => {
		algorithm.setStepOptions(options);
		algorithm.createSteps();
	}, [options, algorithm]);

	const { steps, operations } = algorithm.use();
	const [displayState, setDisplayState] = useState(algorithm.getArray());
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const step = steps[activeStepIndex] || {};
	const stepType = step.type;
	const stepActiveItems = step?.activeItems || [];

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveStepIndex(prev => {
				const next = prev + 1;
				if (next < steps.length) {
					const newState = algorithm.getStateByStepsIndex(next);
					setDisplayState(newState);
					return next;
				} else {
					clearInterval(interval);
					return prev;
				}
			});
		}, 150);

		return () => clearInterval(interval);
	}, [algorithm, steps.length, options]);

	return (
		<BlockArea>
			{displayState.map((val, index) => {
				const isActive = stepActiveItems.includes(index);
				const type = isActive ? stepType : "default";
				return (
					<Block type={type} index={index} key={index} val={val}>
						<p>{val}</p>
					</Block>
				);
			})}
		</BlockArea>
	);
}

export default PlaySortAlgorithm;

import { useEffect, useMemo, useRef, useState } from "react";
import SortArrayDisplay from "./SortArrayDisplay";
import useAlgorithm from "../../hooks/useAlgorithm";
import styled from "styled-components";
import ButtonIcon from "../../ui/ButtonIcon";
import PlayAlgorithmInstructions from "./PlayAlgorithmInstructions";
import SortArrayCanvas from "./SortArrayCanvas";
import { useRect } from "../../hooks/useRect";
import { useWebWorker } from "../../hooks/useWebWorker";
import useSortCanvas from "../../hooks/useSortCanvas";
import Loader from "../../ui/Loader";

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
`;

const Body = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	gap: 2rem;
`;

const AlgorithmContainer = styled.div`
	width: 100%;
	height: 100%;
	padding: 4rem;
	display: flex;
	gap: 2rem;
	background-color: var(--color-grey-50);
	box-shadow: 0.2rem 0.2rem 0px 2px var(--color-grey-300);
	border-radius: 15px;
`;

const InstructionsContainer = styled.div`
	/* width: 100%; */
	display: flex;
	position: absolute;
	font-weight: 700;
	right: 2rem;
	padding: 0 1rem;
	top: 2rem;
	bottom: 2rem;
	z-index: 100;
	backdrop-filter: blur(4px);
	flex-direction: column;
`;

const Sizer = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
	overflow: hidden;
`;

const Options = styled.div`
	display: flex;
	padding: 0.7rem;
	align-self: end;
`;

const Option = styled(ButtonIcon)`
	background-color: transparent;
`;

function SortAlgorithmVisualizer({
	registry,
	input,
	stepIndex,
	passStepsLength,
}) {
	const { ref, rect } = useRect();
	const [localStepIndex, setCurrStepIndex] = useState(stepIndex);
	const { getStepsLength } = useAlgorithm(registry.Class, input);

	// pass stepsLength to parentComponent
	const stepsLength = getStepsLength();
	useEffect(() => {
		passStepsLength(stepsLength);
	}, [stepsLength, passStepsLength]);

	return (
		<Container>
			{/* <Options>
				<Option>
					<IoSettings />
				</Option>
			</Options> */}
			<Body>
				<AlgorithmContainer>
					<Sizer ref={ref}>
						<SortArrayCanvas
							id={registry.id}
							stepIndex={stepIndex}
							input={input}
							parentRect={rect}
						/>
					</Sizer>
				</AlgorithmContainer>
				{/* <InstructionsContainer>
					<p>Instructions</p>
					<PlayAlgorithmInstructions
						instructions={registry.instructions}
						step={step}
					/>
				</InstructionsContainer> */}
			</Body>
		</Container>
	);
}

export default SortAlgorithmVisualizer;

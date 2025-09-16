import { useSelector } from "react-redux";
import styled from "styled-components";
import { getActiveAlgorithms, getStep } from "./playSlice";
import { useMemo } from "react";
import { clamp } from "../../utils/values";

const Metrics = styled.div`
	display: flex;
	align-items: center;
	align-items: end;
	align-items: start;
	/* justify-content: space-between; */
	flex-wrap: wrap;
	gap: 1rem;
	width: 100%;
`;

const MetricsItem = styled.div`
	display: flex;
	white-space: nowrap;
	position: relative;
	align-items: end;
	gap: 0.4rem;
	font-size: 1.4rem;
	line-height: 1.6rem;
	/* flex-direction: column; */
`;

const Name = styled.span`
	color: var(--color-grey-500);
`;
const Count = styled.span`
	font-weight: bold;
`;

function PlayStepMetrics({ registry }) {
	const activeAlgorithms = useSelector(getActiveAlgorithms);
	const step = useSelector(getStep);
	const algorithm = activeAlgorithms.find(algo => algo.id === registry.id);

	const baseMetrics = useMemo(() => {
		if (!algorithm.metrics) return {};
		console.log(algorithm);
		return Object.keys(algorithm.metrics).reduce((acc, key) => {
			acc[key] = { ...algorithm.metrics[key], count: 0 };
			return acc;
		}, {});
	}, [algorithm]);

	if (!algorithm.steps) return <></>;

	let metrics = baseMetrics;

	const stepIndex = step.value;
	const maxStepIndex = algorithm.steps.length;
	const clampedStepIndex = clamp(stepIndex, 0, maxStepIndex - 1);
	const currentStep = algorithm.steps[clampedStepIndex];

	if (currentStep && currentStep.metrics) {
		metrics = { ...baseMetrics, ...currentStep.metrics };
	}

	if (!metrics) return <></>;

	return (
		<Metrics>
			{Object.keys(metrics).map(key => {
				const { id, name, count } = metrics[key];
				return (
					<MetricsItem key={id}>
						<Count>{count}</Count>
						<Name>{name}</Name>
					</MetricsItem>
				);
			})}
		</Metrics>
	);
}

export default PlayStepMetrics;

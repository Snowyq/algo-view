import styled from "styled-components";

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

function PlayStepMetrics({ metrics }) {
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

import { JSX, useMemo } from "react";
import styled from "styled-components";
import type { AlgorithmMetrics } from "../../algorithms/types";

const Metrics = styled.div`
    display: flex;
    gap: 0 1rem;
    width: 100%;
`;

const MetricsItem = styled.div`
    display: flex;
    flex-direction: column;

    white-space: nowrap;
    position: relative;
    align-items: start;
    font-size: 1.2rem;
    line-height: 1.4rem;
`;

const Name = styled.span`
    color: var(--color-grey-500);
`;
const Count = styled.span`
    font-weight: bold;
`;

type StepMetricsPanelProps = {
    metrics: AlgorithmMetrics | null;
    stepMetrics: AlgorithmMetrics | null;
};

function StepMetricsPanel({
    metrics,
    stepMetrics,
}: StepMetricsPanelProps): JSX.Element {
    const baseMetrics = useMemo<AlgorithmMetrics | null>(() => {
        if (!metrics) return null;
        return Object.keys(metrics).reduce((acc, key) => {
            acc[key] = { ...metrics[key], count: 0 };
            return acc;
        }, {} as AlgorithmMetrics);
    }, [metrics]);

    if (!baseMetrics || !stepMetrics) return <></>;

    const mergedMetrics: AlgorithmMetrics = { ...baseMetrics, ...stepMetrics };

    return (
        <Metrics>
            {Object.keys(mergedMetrics).map((key) => {
                const { name, count } = mergedMetrics[key];
                return (
                    <MetricsItem key={name}>
                        <Count>{count}</Count>
                        <Name>{name}</Name>
                    </MetricsItem>
                );
            })}
        </Metrics>
    );
}

export default StepMetricsPanel;

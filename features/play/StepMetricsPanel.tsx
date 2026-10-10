import { JSX, useMemo } from "react";
import styled from "styled-components";
import type { AlgorithmMetrics } from "../../algorithms/types";

const Metrics = styled.div`
    display: flex;
    gap: 0 var(--space-5);
    width: 100%;
`;

const MetricsItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    white-space: nowrap;
    position: relative;
    line-height: 1.2;
`;

const Name = styled.span`
    font-family: var(--font-mono-stack);
    font-size: 1.1rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
`;
const Count = styled.span`
    font-family: var(--font-mono-stack);
    font-size: var(--text-base);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--text);
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

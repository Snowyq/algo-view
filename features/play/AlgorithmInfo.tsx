import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmRegistryItem } from "../../algorithms/types";
import type { RootState } from "../../store";
import type { ActiveAlgorithm } from "./playSlice";
import { getActiveAlgorithms, getInput } from "./playSlice";

/*
 * Basic facts about one algorithm, as implemented here. Rendered both in
 * the sidebar's Info tab and in a panel's side column when it fits.
 */

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
`;

const Title = styled.h3`
    font-family: var(--font-display-stack);
    font-variation-settings: "opsz" 48;
    font-weight: 700;
    font-size: 3.2rem;
    line-height: 1;
    text-transform: uppercase;
    color: var(--text);
`;

const Group = styled.p`
    margin-top: var(--space-2);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
`;

const Description = styled.p`
    font-size: var(--text-base);
    line-height: var(--leading-body);
    color: var(--text-soft);
`;

const Facts = styled.dl`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--space-2) var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--ink-700);

    dt {
        font-size: var(--text-sm);
        color: var(--text-muted);
    }

    dd {
        font-family: var(--font-mono-stack);
        font-size: var(--text-sm);
        font-variant-numeric: tabular-nums;
        color: var(--text);
    }
`;

const numberFormat = new Intl.NumberFormat("en-US");

type AlgorithmInfoProps = {
    registry: AlgorithmRegistryItem;
    /** The panel header already shows the name. */
    showTitle?: boolean;
};

function AlgorithmInfo({
    registry,
    showTitle = true,
}: AlgorithmInfoProps): JSX.Element {
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const input = useSelector<RootState, number[]>(getInput);
    const { meta } = registry;
    const running = active.find((algo) => algo.id === registry.id);
    const group = meta.group === "fun" ? "Just for fun" : "Classic";

    return (
        <Wrap>
            {showTitle ? (
                <div>
                    <Title>{meta.name}</Title>
                    <Group>{group}</Group>
                </div>
            ) : (
                <Group as="p">{group}</Group>
            )}
            <Description>{meta.description}</Description>
            <Facts>
                <dt>Best case</dt>
                <dd>{meta.bestCase}</dd>
                <dt>Average case</dt>
                <dd>{meta.timeComplexity}</dd>
                <dt>Worst case</dt>
                <dd>{meta.worstCase}</dd>
                <dt>Extra space</dt>
                <dd>{meta.auxiliarySpace}</dd>
                <dt>Stable</dt>
                <dd>{meta.stable ? "Yes" : "No"}</dd>
                <dt>In place</dt>
                <dd>{meta.inPlace ? "Yes" : "No, needs extra memory"}</dd>
            </Facts>
            <Facts aria-label="This run">
                <dt>Input size</dt>
                <dd>{numberFormat.format(input.length)}</dd>
                <dt>Steps</dt>
                <dd>
                    {running?.stepsLength
                        ? numberFormat.format(running.stepsLength)
                        : "–"}
                </dd>
            </Facts>
        </Wrap>
    );
}

export default AlgorithmInfo;

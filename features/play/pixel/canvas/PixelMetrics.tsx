import { JSX, memo } from "react";
import styled from "styled-components";
import type { AlgorithmMetrics } from "../../../../algorithms/types";
import { useStepMetrics } from "../../stepInfoStore";
import { labelText } from "../primitives/pixel";

const Row = styled.dl`
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 2rem;
`;

const Item = styled.div`
    display: grid;
    grid-template-columns: auto auto;
    align-items: baseline;
    column-gap: 0.8rem;
    row-gap: 0.3rem;
`;

const Name = styled.dt`
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);
`;

const Count = styled.dd`
    font-family: var(--f-display);
    font-size: 2rem;
    line-height: 0.8;
    color: var(--fg);
    font-variant-numeric: tabular-nums;
    text-align: right;
`;

/* Ten blocks: how far this counter is toward its final total. */
const Meter = styled.dd`
    grid-column: 1 / -1;
    display: flex;
    gap: 2px;

    i {
        width: 6px;
        height: 4px;
        background-color: var(--line);
    }
    i[data-on="true"] {
        background-color: var(--fg-2);
    }
`;

type PixelMetricsProps = {
    /** Algorithm whose current-step counters to show. */
    id: string;
    /** Totals for the whole run (decide which counters exist). */
    totals: AlgorithmMetrics | null;
};

const format = new Intl.NumberFormat("en-US");

function PixelMetrics({ id, totals }: PixelMetricsProps): JSX.Element | null {
    const current = useStepMetrics(id);
    if (!totals) return null;
    const keys = Object.keys(totals).filter((key) => key !== "gaveUp");
    if (keys.length === 0) return null;

    return (
        <Row aria-label="Counters at this step">
            {keys.map((key) => {
                const total = totals[key]?.count ?? 0;
                const count = current?.[key]?.count ?? 0;
                const lit = total > 0 ? Math.round((count / total) * 10) : 0;
                return (
                    <Item key={key}>
                        <Name>{totals[key].name}</Name>
                        <Count>{format.format(count)}</Count>
                        <Meter aria-hidden="true">
                            {Array.from({ length: 10 }, (_, i) => (
                                <i key={i} data-on={i < lit} />
                            ))}
                        </Meter>
                    </Item>
                );
            })}
        </Row>
    );
}

export default memo(PixelMetrics);

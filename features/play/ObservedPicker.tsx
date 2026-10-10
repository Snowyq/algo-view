import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../store";
import type { ActiveAlgorithm } from "./playSlice";
import {
    getActiveAlgorithms,
    getObservedAlgorithmId,
    setObservedAlgorithm,
} from "./playSlice";

/* Which open algorithm the Code and Info tabs follow. Shared by both. */

const Choices = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
`;

const Choice = styled.button`
    display: inline-flex;
    align-items: center;
    height: 3.2rem;
    padding: 0 1.2rem;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-sm);
    background-color: var(--ink-950);
    color: var(--text-soft);
    font-size: var(--text-sm);
    font-weight: 500;
    transition:
        border-color var(--dur-fast) var(--ease-out),
        background-color var(--dur-fast) var(--ease-out);

    &[aria-pressed="true"] {
        border-color: var(--swap);
        background-color: rgba(var(--swap-rgb), 0.12);
        color: var(--text);
    }

    @media (hover: hover) {
        &:hover:not([aria-pressed="true"]) {
            border-color: var(--ink-600);
        }
    }
`;

function ObservedPicker(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const observedId = useSelector<RootState, string | null>(
        getObservedAlgorithmId
    );

    if (active.length === 0) return null;

    return (
        <Choices aria-label="Algorithm to follow">
            {active.map((algo) => (
                <Choice
                    key={algo.id}
                    type="button"
                    aria-pressed={algo.id === observedId}
                    onClick={() => dispatch(setObservedAlgorithm(algo.id))}
                >
                    {algo.info.name}
                </Choice>
            ))}
        </Choices>
    );
}

export default ObservedPicker;

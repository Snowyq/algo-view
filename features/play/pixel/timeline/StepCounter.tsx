import { JSX, memo } from "react";
import { useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import type { RootState } from "../../../../store";
import { formatNumber } from "../../format";
import { getMaxStep, getStep } from "../../playSlice";
import { TINY } from "../media";
import { labelText } from "../primitives/pixel";

/* Current step over the total; each changed digit drops in. */

const flip = keyframes`
    from { clip-path: inset(0 0 100% 0); transform: translateY(-4px); }
    to { clip-path: inset(0 0 0 0); transform: translateY(0); }
`;

const Counter = styled.p`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.3rem;
    min-width: 0;

    small {
        ${labelText};
        font-size: 0.9rem;
        color: var(--fg-4);
    }
`;

const Line = styled.span`
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    white-space: nowrap;

    i {
        font-style: normal;
        color: var(--fg-4);
    }
`;

/* Overlays an invisible copy of the widest possible number, so the width
   stays fixed while playing and the bar never shifts. */
const Slot = styled.span`
    display: inline-grid;
    justify-items: end;

    & > * {
        grid-area: 1 / 1;
    }
    & > [data-ghost] {
        visibility: hidden;
    }
`;

const Digits = styled.span`
    display: inline-flex;
    font-family: var(--f-display);
    font-size: 2.4rem;
    line-height: 0.8;
    color: var(--fg);
    font-variant-numeric: tabular-nums;

    @media ${TINY} {
        font-size: 2rem;
    }

    span {
        display: inline-block;
        /* Shorter than the 50ms tick, so fast playback never clips. */
        animation: ${flip} 40ms steps(2) both;
    }
    &[data-dim] {
        color: var(--fg-4);
    }
`;

function StepDigits({
    value,
    dim,
}: {
    value: number;
    dim?: boolean;
}): JSX.Element {
    const text = formatNumber(Math.max(0, value));
    // Keyed by position from the right, so only changed digits re-animate.
    return (
        <Digits data-dim={dim || undefined}>
            {[...text].map((char, index) => (
                <span key={`${text.length - index}:${char}`}>{char}</span>
            ))}
        </Digits>
    );
}

const StepCounter = memo(function StepCounter(): JSX.Element {
    const { value } = useSelector<RootState, { value: number }>(getStep);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const has = maxStep > 0;
    const total = Math.max(0, maxStep);
    return (
        <Counter
            aria-live="off"
            aria-label={`Step ${has ? value : 0} of ${total}`}
        >
            <small>Step</small>
            <Line>
                <Slot>
                    <Digits data-ghost aria-hidden="true">
                        {formatNumber(total).replace(/\d/g, "8")}
                    </Digits>
                    <StepDigits value={has ? value : 0} />
                </Slot>
                <i>/</i>
                <StepDigits value={total} dim />
            </Line>
        </Counter>
    );
});

export default StepCounter;

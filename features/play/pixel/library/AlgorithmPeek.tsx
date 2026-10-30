import { JSX } from "react";
import styled from "styled-components";
import { algorithmTraits } from "../../traits";
import type { RegistryAlgorithm } from "../../playSlice";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";

/*
 * Hover (or focus) an algorithm in the sidebar: what it is, before you
 * open it. The card sits beside the list, level with the row, and never
 * takes focus or clicks itself.
 */

const Card = styled.aside`
    position: fixed;
    z-index: 50;
    width: 30rem;
    padding: 1.4rem 1.6rem 1.6rem;
    background-color: var(--surface-2);
    pointer-events: none;
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 140ms steps(1) both;

    h3 {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 2.4rem;
        line-height: 0.9;
        text-transform: uppercase;
        color: var(--fg);
    }
    p {
        margin-top: 0.8rem;
        font-size: 1.35rem;
        line-height: 1.45;
        color: var(--fg-3);
    }
`;

const Facts = styled.dl`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.3rem 1rem;
    margin-top: 1.2rem;

    dt {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
    dd {
        font-family: var(--f-mono);
        font-size: 1.2rem;
        color: var(--fg-2);
    }
`;

const Traits = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    margin-top: 1rem;
    list-style: none;

    li {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        ${labelText};
        font-size: 1rem;
        color: var(--fg-3);
    }
    li[data-on="true"] {
        color: var(--color-step-finish);
    }
`;

type AlgorithmPeekProps = {
    algorithm: RegistryAlgorithm;
    top: number;
    left: number;
};

function AlgorithmPeek({
    algorithm,
    top,
    left,
}: AlgorithmPeekProps): JSX.Element {
    return (
        <Card style={{ top, left }} aria-hidden="true">
            <h3>{algorithm.name}</h3>
            <p>{algorithm.description}</p>
            <Facts>
                <dt>Average</dt>
                <dd>{algorithm.timeComplexity}</dd>
                <dt>Worst</dt>
                <dd>{algorithm.worstCase}</dd>
                <dt>Memory</dt>
                <dd>{algorithm.auxiliarySpace}</dd>
            </Facts>
            <Traits>
                {algorithmTraits(algorithm).map((trait) => (
                    <li key={trait.short} data-on={trait.on}>
                        <PixelIcon
                            name={trait.on ? "check" : "close"}
                            scale={1}
                        />
                        {trait.label}
                    </li>
                ))}
            </Traits>
        </Card>
    );
}

export default AlgorithmPeek;

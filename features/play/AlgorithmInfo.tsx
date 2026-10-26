import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmRegistryItem } from "../../algorithms/types";
import type { RootState } from "../../store";
import { labelText, pixelFrame } from "./pixel/primitives/pixel";
import { algorithmTraits } from "./traits";
import type { ActiveAlgorithm } from "./playSlice";
import { categoryOf } from "./categories";
import { getActiveAlgorithms } from "./playSlice";

/*
 * Spec card for one algorithm, as implemented here. Rendered in the
 * Inspector's Info tab and in a panel's side column when it fits.
 */

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
`;

const Title = styled.h3`
    font-family: var(--f-display);
    font-size: 4rem;
    line-height: 0.8;
    text-transform: uppercase;
    color: var(--fg);
`;

const Group = styled.p`
    margin-top: 0.8rem;
    ${labelText};
    font-size: 1rem;
    color: var(--accent);
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 1.5;
    color: var(--fg-2);
    text-wrap: pretty;
`;

/* Yes/no traits as pixel badges: lit when true. */
const Traits = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`;

const Trait = styled.li<{ $on: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    margin: var(--b);
    ${labelText};
    font-size: 1rem;
    color: ${({ $on }) => ($on ? "var(--fg)" : "var(--fg-4)")};
    background-color: ${({ $on }) =>
        $on ? "var(--surface-3)" : "transparent"};
    ${({ $on }) => pixelFrame($on ? "var(--line-2)" : "var(--line)")};

    &::before {
        content: "";
        width: 0.6rem;
        height: 0.6rem;
        background-color: ${({ $on }) =>
            $on ? "var(--color-step-check-true)" : "var(--line-2)"};
    }
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const SectionTitle = styled.h4`
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);
    margin-bottom: 0.4rem;
`;

/* name ········· value, the dots fill whatever space is left. */
const Fact = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.8rem;

    dt {
        font-size: 1.4rem;
        color: var(--fg-3);
    }
    i {
        flex: 1;
        height: 2px;
        min-width: 1.6rem;
        background-image: repeating-linear-gradient(
            90deg,
            var(--line-2) 0 2px,
            transparent 2px 6px
        );
    }
    dd {
        font-family: var(--f-mono);
        font-size: 1.35rem;
        font-variant-numeric: tabular-nums;
        color: var(--fg);
    }
`;

const numberFormat = new Intl.NumberFormat("en-US");

function FactRow({
    name,
    value,
}: {
    name: string;
    value: string;
}): JSX.Element {
    return (
        <Fact>
            <dt>{name}</dt>
            <i aria-hidden="true" />
            <dd>{value}</dd>
        </Fact>
    );
}

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
    // A string key keeps this from re-rendering on every playback step.
    const factsKey = useSelector((state: RootState) =>
        JSON.stringify(
            categoryOf(state.play.active.category).runFacts(state.play)
        )
    );
    const runFacts = JSON.parse(factsKey) as Array<{
        name: string;
        value: string;
    }>;
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
                <Group>{group}</Group>
            )}
            <Description>{meta.description}</Description>
            <Traits aria-label="Traits">
                {algorithmTraits(meta).map((trait) => (
                    <Trait key={trait.label} $on={trait.on}>
                        {trait.label}
                    </Trait>
                ))}
            </Traits>
            <Section>
                <SectionTitle>Complexity</SectionTitle>
                <dl>
                    <FactRow name="Best" value={meta.bestCase} />
                    <FactRow name="Average" value={meta.timeComplexity} />
                    <FactRow name="Worst" value={meta.worstCase} />
                    <FactRow name="Extra space" value={meta.auxiliarySpace} />
                </dl>
            </Section>
            <Section>
                <SectionTitle>This run</SectionTitle>
                <dl>
                    {runFacts.map((fact) => (
                        <FactRow
                            key={fact.name}
                            name={fact.name}
                            value={fact.value}
                        />
                    ))}
                    <FactRow
                        name="Steps"
                        value={
                            running?.stepsLength
                                ? numberFormat.format(running.stepsLength)
                                : "–"
                        }
                    />
                </dl>
            </Section>
        </Wrap>
    );
}

export default AlgorithmInfo;

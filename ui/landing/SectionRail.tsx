"use client";

import { JSX } from "react";
import styled, { css } from "styled-components";

/*
 * The case study read as an array: one bar per section, length = how much
 * there is to read. Bars turn "check" while you are in a section and
 * "finish" once you have passed it.
 */

export type RailSection = {
    id: string;
    title: string;
    weight: number;
};

type BarState = "idle" | "active" | "done";

const stateColor: Record<BarState, ReturnType<typeof css>> = {
    idle: css`
        background-color: var(--color-step-default);
    `,
    active: css`
        background-color: var(--check);
    `,
    done: css`
        background-color: var(--finish);
    `,
};

const Rail = styled.nav`
    display: none;

    @media (min-width: 960px) {
        display: block;
        position: sticky;
        top: var(--space-7);
    }
`;

const List = styled.ol`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
`;

const RailLink = styled.a<{ $state: BarState }>`
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    color: ${({ $state }) =>
        $state === "idle" ? "var(--text-muted)" : "var(--text)"};
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.3;
    transition:
        color var(--dur-base) var(--ease-out),
        background-color var(--dur-fast) var(--ease-out);

    @media (hover: hover) {
        &:hover {
            color: var(--text);
            background-color: var(--ink-850);
        }
    }
`;

const Track = styled.span`
    display: block;
    height: 6px;
    width: 100%;
`;

const Bar = styled.span<{ $state: BarState; $weight: number }>`
    display: block;
    height: 100%;
    width: ${({ $weight }) => `${Math.round(30 + $weight * 70)}%`};
    border-radius: 2px;
    transition: background-color var(--dur-slow) var(--ease-out);
    ${({ $state }) => stateColor[$state]}
`;

const Strip = styled.div`
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    gap: 3px;
    padding: var(--space-3) var(--gutter);
    margin: 0 calc(var(--gutter) * -1);
    background-color: var(--ink-950);

    @media (min-width: 960px) {
        display: none;
    }
`;

const Segment = styled.span<{ $state: BarState; $weight: number }>`
    flex: ${({ $weight }) => 0.6 + $weight} 1 0;
    height: 4px;
    border-radius: 2px;
    transition: background-color var(--dur-slow) var(--ease-out);
    ${({ $state }) => stateColor[$state]}
`;

function barState(index: number, active: number): BarState {
    if (index < active) return "done";
    if (index === active) return "active";
    return "idle";
}

type SectionRailProps = {
    sections: RailSection[];
    active: number;
};

export function SectionRail({
    sections,
    active,
}: SectionRailProps): JSX.Element {
    return (
        <Rail aria-label="Case study sections">
            <List>
                {sections.map((section, index) => {
                    const state = barState(index, active);
                    return (
                        <li key={section.id}>
                            <RailLink
                                href={`#${section.id}`}
                                $state={state}
                                aria-current={
                                    state === "active" ? "location" : undefined
                                }
                            >
                                {section.title}
                                <Track aria-hidden="true">
                                    <Bar
                                        $state={state}
                                        $weight={section.weight}
                                    />
                                </Track>
                            </RailLink>
                        </li>
                    );
                })}
            </List>
        </Rail>
    );
}

export function SectionStrip({
    sections,
    active,
}: SectionRailProps): JSX.Element {
    return (
        <Strip aria-hidden="true">
            {sections.map((section, index) => (
                <Segment
                    key={section.id}
                    $state={barState(index, active)}
                    $weight={section.weight}
                />
            ))}
        </Strip>
    );
}
